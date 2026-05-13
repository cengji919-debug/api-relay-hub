import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { verifyJWT, signJWT } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { refreshToken?: string };
    const { refreshToken } = body;
    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 });
    }

    const payload = await verifyJWT<{ sub: string; email: string; role: string }>(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    );

    const db = getDB(process.env.DB as unknown as D1Database);
    const user = await db.select().from(users).where(eq(users.id, payload.sub)).get();

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    }

    const newAccessToken = await signJWT(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'dev-secret',
      '15m',
    );

    const newRefreshToken = await signJWT(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      '7d',
    );

    return NextResponse.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
  }
}