import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { loginSchema } from '@/lib/validations';
import { comparePassword, signJWT } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { email, password } = validation.data;
    const db = getDB(process.env.DB as unknown as D1Database);

    const user = await db.select().from(users).where(eq(users.email, email)).get();
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const accessToken = await signJWT(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'dev-secret',
      '15m',
    );

    const refreshToken = await signJWT(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      '7d',
    );

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}