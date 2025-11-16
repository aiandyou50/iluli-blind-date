import { Hono } from 'hono';
import { Env } from '../types/env';
import { authMiddleware, getAuthUser } from '../middleware/auth';

const matching = new Hono<{ Bindings: Env }>();

/**
 * GET /api/v1/matching/deck
 * 매칭 카드 덱 조회 (PRD-MATCH-001)
 * 
 * @description
 * - 내가 아직 액션(OK/Pass)을 하지 않은 사용자들을 반환
 * - 승인된 사진이 1개 이상 있는 사용자만 반환
 * - 최대 20명씩 반환
 */
matching.get('/deck', authMiddleware, async (c) => {
  const authUser = getAuthUser(c);
  const limit = 20;

  try {
    // 1. 내가 이미 액션을 한 사용자 ID 조회
    const actedUsersResult = await c.env.DB.prepare(`
      SELECT target_user_id
      FROM MatchingActions
      WHERE source_user_id = ?
    `).bind(authUser.userId).all();

    const actedUserIds = actedUsersResult.results.map((row: any) => row.target_user_id);
    
    // 2. 승인된 사진이 있는 사용자 중, 내가 액션하지 않은 사용자 조회
    let query = `
      SELECT DISTINCT
        u.id AS user_id,
        up.nickname,
        up.school,
        up.mbti,
        up.bio,
        up.instagram_url
      FROM Users u
      INNER JOIN UserProfiles up ON u.id = up.user_id
      INNER JOIN ProfilePhotos pp ON u.id = pp.user_id
      WHERE pp.verification_status = 'approved'
        AND u.id != ?
    `;

    // 이미 액션한 사용자 제외
    if (actedUserIds.length > 0) {
      const placeholders = actedUserIds.map(() => '?').join(',');
      query += ` AND u.id NOT IN (${placeholders})`;
    }

    query += ` ORDER BY RANDOM() LIMIT ${limit}`;

    const bindings = [authUser.userId, ...actedUserIds];
    const usersResult = await c.env.DB.prepare(query).bind(...bindings).all();

    // 3. 각 사용자의 승인된 사진 조회
    const deck = await Promise.all(
      usersResult.results.map(async (user: any) => {
        const photosResult = await c.env.DB.prepare(`
          SELECT id, image_url
          FROM ProfilePhotos
          WHERE user_id = ? AND verification_status = 'approved'
          ORDER BY created_at DESC
        `).bind(user.user_id).all();

        return {
          user_id: user.user_id,
          nickname: user.nickname || '익명',
          school: user.school,
          mbti: user.mbti,
          bio: user.bio,
          instagram_url: user.instagram_url || null,
          photos: photosResult.results.map((photo: any) => ({
            id: photo.id,
            image_url: photo.image_url,
          })),
        };
      })
    );

    return c.json({ deck });

  } catch (error) {
    console.error('Error fetching matching deck:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * POST /api/v1/matching/action
 * 매칭 액션 (OK/Pass) 수행 (PRD-MATCH-001)
 * 
 * @body targetUserId - 대상 사용자 ID
 * @body action - 'ok' 또는 'pass'
 */
matching.post('/action', authMiddleware, async (c) => {
  const authUser = getAuthUser(c);
  const body = await c.req.json<{
    target_user_id: string;
    action: 'ok' | 'pass';
  }>();

  if (!body.target_user_id || !body.action) {
    return c.json({ error: 'target_user_id and action are required' }, 400);
  }

  if (body.action !== 'ok' && body.action !== 'pass') {
    return c.json({ error: 'action must be "ok" or "pass"' }, 400);
  }

  try {
    // 1. 대상 사용자가 존재하는지 확인
    const targetUser = await c.env.DB.prepare(`
      SELECT id
      FROM Users
      WHERE id = ?
    `).bind(body.target_user_id).first();

    if (!targetUser) {
      return c.json({ error: 'Target user not found' }, 404);
    }

    // 2. 자기 자신에게 액션 불가
    if (body.target_user_id === authUser.userId) {
      return c.json({ error: 'Cannot perform action on yourself' }, 400);
    }

    // 3. MatchingActions 테이블에 액션 저장
    await c.env.DB.prepare(`
      INSERT INTO MatchingActions (source_user_id, target_user_id, action)
      VALUES (?, ?, ?)
      ON CONFLICT(source_user_id, target_user_id) DO UPDATE SET action = ?, created_at = CURRENT_TIMESTAMP
    `).bind(authUser.userId, body.target_user_id, body.action, body.action).run();

    // 4. OK인 경우, 상호 OK 여부 확인 (매치 성사)
    let matched = false;
    let matchData = null;

    if (body.action === 'ok') {
      const mutualOk = await c.env.DB.prepare(`
        SELECT action
        FROM MatchingActions
        WHERE source_user_id = ? AND target_user_id = ?
      `).bind(body.target_user_id, authUser.userId).first<{ action: string }>();

      if (mutualOk && mutualOk.action === 'ok') {
        matched = true;

        // 매치 레코드 생성 (user_a < user_b 정렬)
        const [userA, userB] =
          authUser.userId < body.target_user_id
            ? [authUser.userId, body.target_user_id]
            : [body.target_user_id, authUser.userId];

        const matchId = crypto.randomUUID();

        await c.env.DB.prepare(`
          INSERT INTO Matches (id, user_a_id, user_b_id)
          VALUES (?, ?, ?)
          ON CONFLICT(user_a_id, user_b_id) DO NOTHING
        `).bind(matchId, userA, userB).run();

        // 매치된 상대방 정보 조회
        const matchedUserProfile = await c.env.DB.prepare(`
          SELECT 
            u.id,
            up.nickname,
            up.instagram_url
          FROM Users u
          LEFT JOIN UserProfiles up ON u.id = up.user_id
          WHERE u.id = ?
        `).bind(body.target_user_id).first();

        matchData = {
          match_id: matchId,
          matched_user: {
            user_id: body.target_user_id,
            nickname: matchedUserProfile?.nickname || '익명',
            instagram_url: matchedUserProfile?.instagram_url || null,
          },
        };
      }
    }

    return c.json({
      message: 'Action recorded successfully',
      matched,
      match: matchData,
    });

  } catch (error: any) {
    console.error('Error recording matching action:', error);
    
    // UNIQUE 제약 위반 (이미 액션을 한 경우)
    if (error.message?.includes('UNIQUE')) {
      return c.json({ error: 'Action already recorded for this user' }, 400);
    }
    
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

/**
 * GET /api/v1/matching/matches
 * 내 매칭 목록 조회 (PRD-MATCH-001)
 */
matching.get('/matches', authMiddleware, async (c) => {
  const authUser = getAuthUser(c);

  try {
    // 1. 내가 포함된 매칭 목록 조회
    const matchesResult = await c.env.DB.prepare(`
      SELECT 
        m.id AS match_id,
        m.created_at,
        CASE
          WHEN m.user_a_id = ? THEN m.user_b_id
          ELSE m.user_a_id
        END AS matched_user_id
      FROM Matches m
      WHERE m.user_a_id = ? OR m.user_b_id = ?
      ORDER BY m.created_at DESC
    `).bind(authUser.userId, authUser.userId, authUser.userId).all();

    // 2. 각 매칭의 상대방 정보 조회
    const matches = await Promise.all(
      matchesResult.results.map(async (match: any) => {
        const userProfile = await c.env.DB.prepare(`
          SELECT 
            u.id,
            up.nickname,
            up.instagram_url
          FROM Users u
          LEFT JOIN UserProfiles up ON u.id = up.user_id
          WHERE u.id = ?
        `).bind(match.matched_user_id).first();

        return {
          match_id: match.match_id,
          matched_at: match.created_at,
          matched_user: {
            user_id: match.matched_user_id,
            nickname: userProfile?.nickname || '익명',
            instagram_url: userProfile?.instagram_url || null,
          },
        };
      })
    );

    return c.json({ matches });

  } catch (error) {
    console.error('Error fetching matches:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

export default matching;
