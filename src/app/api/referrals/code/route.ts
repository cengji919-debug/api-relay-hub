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

    // Generate referral code if not exists
    const existingReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    const referralCode = existingReferrals.length > 0 
      ? existingReferrals[0].referralCode 
      : `REF${userId.slice(0, 8).toUpperCase()}`;

    return NextResponse.json({ code: referralCode });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
