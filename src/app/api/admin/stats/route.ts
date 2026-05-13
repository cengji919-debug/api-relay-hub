import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { users, tokenBalances, payments, apiUsageLogs } from '@/drizzle/schema';
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

    // Get total users
    const totalUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    const totalUsers = Number(totalUsersResult[0]?.count) || 0;

    // Get active users
    const activeUsersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isActive, 1));
    const activeUsers = Number(activeUsersResult[0]?.count) || 0;

    // Get total revenue
    const revenueResult = await db
      .select({ total: sql<number>`sum(amount)` })
      .from(payments)
      .where(eq(payments.status, 'COMPLETED'));
    const totalRevenue = Number(revenueResult[0]?.total) || 0;

    // Get total tokens
    const tokensResult = await db
      .select({ total: sql<number>`sum(lifetime_usage)` })
      .from(tokenBalances);
    const totalTokens = Number(tokensResult[0]?.total) || 0;

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalRevenue,
      totalTokens,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
