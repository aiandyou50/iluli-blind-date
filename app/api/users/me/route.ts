import { getPrisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getToken } from 'next-auth/jwt';
import { profileSchema } from '@/lib/validations';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const ctx = getRequestContext();
    // @ts-ignore
    const secret = ctx.env.AUTH_SECRET || process.env.AUTH_SECRET;
    
    let token = await getToken({ req, secret });
    if (!token) {
      token = await getToken({ req, secret, cookieName: '__Secure-authjs.session-token' });
    }

    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = ctx.env.DB;
    if (!db) {
      return new NextResponse('Database binding not found', { status: 500 });
    }

    const prisma = getPrisma(db);
    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      select: {
        id: true,
        nickname: true,
        school: true,
        instagramId: true,
        introduction: true,
        gender: true,
        isGraduated: true,
        status: true,
        image: true,
        email: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const ctx = getRequestContext();
    // @ts-ignore
    const secret = ctx.env.AUTH_SECRET || process.env.AUTH_SECRET;

    let token = await getToken({ req, secret });
    if (!token) {
      token = await getToken({ req, secret, cookieName: '__Secure-authjs.session-token' });
    }

    if (!token || !token.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const json = await req.json();
    const validation = profileSchema.safeParse(json);

    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation Error", 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const db = ctx.env.DB;
    if (!db) {
      return new NextResponse('Database binding not found', { status: 500 });
    }

    const prisma = getPrisma(db);
    
    // Check if nickname is already taken by another user
    const existingNickname = await prisma.user.findUnique({
      where: { nickname: validation.data.nickname }
    });

    if (existingNickname && existingNickname.id !== token.sub) {
      return NextResponse.json({ 
        error: "Nickname already taken",
        field: "nickname"
      }, { status: 409 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: token.sub },
      data: {
        ...validation.data,
        // If user was PENDING, updating profile might make them ready for review or ACTIVE
        // For now, we just update the fields. 
        // SPEC says: "필수 정보(학교, 인스타ID) 미입력 시 /profile/edit 외 모든 페이지 접근 차단"
        // So filling this out is crucial.
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
