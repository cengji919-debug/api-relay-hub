import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { platformPricing, apiProviders } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET() {
  const db = getDB(process.env.DB as unknown as D1Database);

  const pricing = await db.select({
    providerId: platformPricing.providerId,
    providerName: apiProviders.displayName,
    modelName: platformPricing.modelName,
    pricePerToken: platformPricing.pricePerToken,
    profitMargin: platformPricing.profitMargin,
  }).from(platformPricing)
    .leftJoin(apiProviders, eq(platformPricing.providerId, apiProviders.id))
    .where(eq(platformPricing.isActive, 1))
    .all();

  return NextResponse.json({ pricing });
}