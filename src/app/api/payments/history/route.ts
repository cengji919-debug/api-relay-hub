import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { payments } from '../../../drizzle/schema';
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

    const db = getDB(process.env.DB as unknown as D1Database);
    const history = await db.select()
      .from(payments)
      .where(eq(payments.userId, user.sub))
      .orderBy(desc(payments.createdAt))
      .limit(50)
      .all();

    return NextResponse.json({ history });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}