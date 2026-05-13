import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { referrals, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { REFERRAL_BONUS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const payload = await (await import('@/lib/auth')).verifyJWT<{ sub: string; email: string; role: string }>(
      token,
      process.env.JWT_SECRET || 'dev-secret',
    );
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const db = getDB(process.env.DB as unknown as D1Database);
    const userId = payload.sub;

    // Get referral history
    const userReferrals = await db
      .select({
        id: referrals.id,
        referredUserId: referrals.referredUserId,
        bonusTokens: referrals.bonusTokens,
        createdAt: referrals.createdAt,
      })
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    // Get user emails for referred users
    const history = await Promise.all(
      userReferrals.map(async (r) => {
        const user = await db
          .select({ email: users.email })
          .from(users)
          .where(eq(users.id, r.referredUserId))
          .limit(1);
        
        return {
          id: r.id,
          referredUserEmail: user[0]?.email || 'Unknown',
          bonusTokens: r.bonusTokens,
          createdAt: r.createdAt,
        };
      })
    );

    return NextResponse.json({ history });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
