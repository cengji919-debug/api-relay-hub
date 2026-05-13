import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { autoRechargeSettings, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  try {
    const token = authHeader.slice(7);
    const encoder = new TextEncoder();
    const tokenData = encoder.encode(token);
    const keyData = encoder.encode(process.env.JWT_SECRET || 'default-secret');
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    
    return payload.userId || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDB(process.env.DB as unknown as D1Database);
    const settings = await db.select().from(autoRechargeSettings)
      .where(eq(autoRechargeSettings.userId, userId))
      .get();

    return NextResponse.json({
      isEnabled: settings?.isEnabled === 1,
      thresholdBalance: settings?.thresholdBalance || 10000,
      rechargeAmount: settings?.rechargeAmount || 100000,
      packageId: settings?.packageId || 'basic',
      lastRechargedAt: settings?.lastRechargedAt || null,
    });
  } catch (error) {
    console.error('Get auto-recharge settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      isEnabled?: boolean;
      thresholdBalance?: number;
      rechargeAmount?: number;
      packageId?: string;
    };
    const { isEnabled, thresholdBalance, rechargeAmount, packageId } = body;

    const db = getDB(process.env.DB as unknown as D1Database);
    const existing = await db.select().from(autoRechargeSettings)
      .where(eq(autoRechargeSettings.userId, userId))
      .get();

    if (existing) {
      await db.update(autoRechargeSettings)
        .set({
          isEnabled: isEnabled ? 1 : 0,
          thresholdBalance: thresholdBalance ?? existing.thresholdBalance,
          rechargeAmount: rechargeAmount ?? existing.rechargeAmount,
          packageId: packageId ?? existing.packageId,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(autoRechargeSettings.userId, userId))
        .run();
    } else {
      await db.insert(autoRechargeSettings).values({
        userId,
        isEnabled: isEnabled ? 1 : 0,
        thresholdBalance: thresholdBalance ?? 10000,
        rechargeAmount: rechargeAmount ?? 100000,
        packageId: packageId ?? 'basic',
      }).run();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update auto-recharge settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
