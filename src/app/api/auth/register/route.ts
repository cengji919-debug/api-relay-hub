import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { users, tokenBalances, referrals } from '@/drizzle/schema';
import { registerSchema } from '@/lib/validations';
import { hashPassword, signJWT } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { REFERRAL_BONUS } from '@/lib/constants';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { email, password, displayName, referralCode } = validation.data;
    const db = getDB(process.env.DB as unknown as D1Database);

    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const newUser = await db.insert(users).values({
      email,
      passwordHash,
      displayName: displayName || email.split('@')[0],
    }).returning().get();

    await db.insert(tokenBalances).values({
      userId: newUser.id,
      balance: 0,
      lifetimeUsage: 0,
    }).run();

    // Handle referral
    if (referralCode) {
      const referrer = await db
        .select()
        .from(users)
        .where(eq(users.id, referralCode.replace('REF', '').toLowerCase()))
        .get();

      if (referrer) {
        await db.insert(referrals).values({
          referrerId: referrer.id,
          referredUserId: newUser.id,
          referralCode,
          bonusTokens: REFERRAL_BONUS,
        }).run();

        // Add bonus tokens to referrer
        const referrerBalance = await db
          .select()
          .from(tokenBalances)
          .where(eq(tokenBalances.userId, referrer.id))
          .get();

        if (referrerBalance) {
          await db
            .update(tokenBalances)
            .set({
              balance: referrerBalance.balance + REFERRAL_BONUS,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(tokenBalances.userId, referrer.id))
            .run();
        }
      }
    }

    const accessToken = await signJWT(
      { sub: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'dev-secret',
      '15m',
    );

    const refreshToken = await signJWT(
      { sub: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      '7d',
    );

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}