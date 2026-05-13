import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { apiUsageLogs } from '../../../drizzle/schema';
import { verifyJWT } from '@/lib/auth';
import { eq, desc, sql } from 'drizzle-orm';

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
    const days = parseInt(searchParams.get('days') || '7');

    const db = getDB(process.env.DB as unknown as D1Database);

    const logs = await db.select({
      id: apiUsageLogs.id,
      modelName: apiUsageLogs.modelName,
      inputTokens: apiUsageLogs.inputTokens,
      outputTokens: apiUsageLogs.outputTokens,
      totalTokens: apiUsageLogs.totalTokens,
      tokensCost: apiUsageLogs.tokensCost,
      responseTimeMs: apiUsageLogs.responseTimeMs,
      statusCode: apiUsageLogs.statusCode,
      createdAt: apiUsageLogs.createdAt,
    }).from(apiUsageLogs)
      .where(eq(apiUsageLogs.userId, user.sub))
      .orderBy(desc(apiUsageLogs.createdAt))
      .limit(100)
      .all();

    const summary = await db.select({
      totalTokens: sql`SUM(${apiUsageLogs.totalTokens})`.as('totalTokens'),
      totalCost: sql`SUM(${apiUsageLogs.tokensCost})`.as('totalCost'),
      totalCalls: sql`COUNT(*)`.as('totalCalls'),
      avgResponseTime: sql`AVG(${apiUsageLogs.responseTimeMs})`.as('avgResponseTime'),
    }).from(apiUsageLogs)
      .where(eq(apiUsageLogs.userId, user.sub))
      .get();

    return NextResponse.json({ logs, summary });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}