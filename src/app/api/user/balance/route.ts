import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { tokenBalances } from '@/drizzle/schema';
import { verifyJWT } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = authHeader.slice(7);
    const user = await verifyJWT<{ sub: string }>(token, process.env.JWT_SECRET || 'dev-secret');

    const db = getDB(process.env.DB as unknown as D1Database);
    const balance = await db.select({
      balance: tokenBalances.balance,
      lifetimeUsage: tokenBalances.lifetimeUsage,
    }).from(tokenBalances).where(eq(tokenBalances.userId, user.sub)).get();

    return NextResponse.json({
      balance: balance?.balance || 0,
      lifetimeUsage: balance?.lifetimeUsage || 0,
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}