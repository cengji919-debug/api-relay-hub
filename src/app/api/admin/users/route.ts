import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { users, tokenBalances } from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';

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

    // Check if admin
    const adminUsers = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.sub));

    if (!adminUsers[0] || adminUsers[0].role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all users with balances
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(sql`${users.createdAt} DESC`);

    // Get balances for all users
    const usersWithBalances = await Promise.all(
      allUsers.map(async (user) => {
        const balanceResult = await db
          .select({ balance: tokenBalances.balance })
          .from(tokenBalances)
          .where(eq(tokenBalances.userId, user.id))
          .limit(1);
        
        return {
          ...user,
          balance: balanceResult[0]?.balance || 0,
        };
      })
    );

    return NextResponse.json({ users: usersWithBalances });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
