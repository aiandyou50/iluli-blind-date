-- ============================================================
-- 이루리 소개팅 서비스 D1 데이터베이스 스키마
-- 버전: 2.5 (PRD-USER-001 v2.5 + PRD-USER-004 v1.1 반영)
-- 작성일: 2025-11-16
-- ============================================================

-- 1. 사용자 (Google OAuth 기반)
-- ============================================================
CREATE TABLE IF NOT EXISTS Users (
    id TEXT PRIMARY KEY,                            -- UUID (Worker에서 생성)
    google_subject_id TEXT UNIQUE NOT NULL,         -- Google에서 받은 고유 ID (sub 클레임)
    email TEXT,                                     -- Google 이메일
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. 사용자 프로필 (PRD-USER-001 v2.5)
-- ============================================================
CREATE TABLE IF NOT EXISTS UserProfiles (
    user_id TEXT PRIMARY KEY NOT NULL,
    nickname TEXT UNIQUE,                           -- 사용자 닉네임 (UNIQUE 제약)
    school TEXT,                                    -- 대학교
    mbti TEXT,                                      -- MBTI 유형
    bio TEXT,                                       -- 자기소개
    instagram_url TEXT,                             -- 인스타그램 URL (NULL 허용)
    
    -- [v2.4] 위치 정보
    latitude REAL,                                  -- 위도
    longitude REAL,                                 -- 경도
    location_updated_at TEXT,                       -- 위치 업데이트 시간
    
    -- [v2.5] Geohash (PRD-USER-003 거리순 정렬 최적화)
    geohash TEXT,                                   -- Geohash (정밀도 6-7)
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 인덱스: Geohash 기반 거리순 정렬 (PRD-USER-003)
CREATE INDEX IF NOT EXISTS idx_userprofiles_geohash ON UserProfiles(geohash);

-- 3. 프로필 사진 (PRD-USER-001 v2.5)
-- ============================================================
CREATE TABLE IF NOT EXISTS ProfilePhotos (
    id TEXT PRIMARY KEY,                            -- UUID (Worker에서 생성)
    user_id TEXT NOT NULL,
    image_url TEXT NOT NULL,                        -- R2에 저장된 이미지 URL
    
    -- 인증 상태: 'not_applied' (기본) -> 'pending' (신청) -> 'approved' (승인) / 'rejected' (거절)
    verification_status TEXT DEFAULT 'not_applied' NOT NULL 
        CHECK(verification_status IN ('not_applied', 'pending', 'approved', 'rejected')),
        
    rejection_reason TEXT,                          -- 관리자가 거절 시 사유
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- [의존성: PRD-USER-004] 좋아요 카운트 (성능 최적화용)
    likes_count INTEGER DEFAULT 0 NOT NULL,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_profilephotos_user_id ON ProfilePhotos(user_id);
CREATE INDEX IF NOT EXISTS idx_profilephotos_verification_status ON ProfilePhotos(verification_status);
CREATE INDEX IF NOT EXISTS idx_profilephotos_likes_count ON ProfilePhotos(likes_count);  -- PRD-USER-003 좋아요순 정렬

-- 4. 좋아요 (PRD-USER-004 v1.1)
-- ============================================================
CREATE TABLE IF NOT EXISTS Likes (
    user_id TEXT NOT NULL,                          -- 좋아요를 누른 사용자
    photo_id TEXT NOT NULL,                         -- 좋아요를 받은 사진
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    PRIMARY KEY (user_id, photo_id),                -- 한 사용자가 한 사진에 1번만
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    -- [v1.1] CASCADE DELETE: ProfilePhotos 삭제 시 자동으로 Likes도 삭제
    FOREIGN KEY (photo_id) REFERENCES ProfilePhotos(id) ON DELETE CASCADE
);

-- 인덱스: '좋아요 누른 사람 목록' 조회 최적화
CREATE INDEX IF NOT EXISTS idx_likes_photo_id ON Likes(photo_id, created_at);

-- 5. 매칭 액션 (PRD-MATCH-001)
-- ============================================================
CREATE TABLE IF NOT EXISTS MatchingActions (
    source_user_id TEXT NOT NULL,                   -- 액션을 한 사용자
    target_user_id TEXT NOT NULL,                   -- 액션 대상 사용자
    action TEXT NOT NULL CHECK(action IN ('ok', 'pass')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    PRIMARY KEY (source_user_id, target_user_id),   -- 한 사용자가 한 대상에 1번만
    
    FOREIGN KEY (source_user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 인덱스: Mutual 'OK' 확인 최적화
CREATE INDEX IF NOT EXISTS idx_matchingactions_target_source ON MatchingActions(target_user_id, source_user_id);

-- 6. 매칭 성사 (PRD-MATCH-001)
-- ============================================================
CREATE TABLE IF NOT EXISTS Matches (
    id TEXT PRIMARY KEY,                            -- UUID (Worker에서 생성)
    user_a_id TEXT NOT NULL,                        -- 매칭된 사용자 A (정렬: A < B)
    user_b_id TEXT NOT NULL,                        -- 매칭된 사용자 B
    created_at TEXT DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    CHECK (user_a_id < user_b_id),                  -- 정렬 제약 (중복 방지)
    UNIQUE (user_a_id, user_b_id),                  -- 동일 매칭 중복 방지
    
    FOREIGN KEY (user_a_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_b_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 인덱스: 특정 사용자의 매칭 목록 조회
CREATE INDEX IF NOT EXISTS idx_matches_user_a ON Matches(user_a_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_b ON Matches(user_b_id);

-- ============================================================
-- 마이그레이션 완료
-- ============================================================
-- 실행 명령어 (로컬):
--   wrangler d1 execute iluli-db --local --file=./schema.sql
-- 실행 명령어 (프로덕션):
--   wrangler d1 execute iluli-db --remote --file=./schema.sql
-- ============================================================
