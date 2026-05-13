import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { tokenTransactions } from '../../../drizzle/schema';
import { verifyJWT } from '@/lib/auth';
import { eq, desc } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = authHeader.slice(7);
    const user = await verifyJWT<{ sub: string }>(token, process.env.JWT_SECRET || 'dev-secret');

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const db = getDB(process.env.DB as unknown as D1Database);
    const transactions = await db.select()
      .from(tokenTransactions)
      .where(eq(tokenTransactions.userId, user.sub))
      .orderBy(desc(tokenTransactions.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    return NextResponse.json({ transactions });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}