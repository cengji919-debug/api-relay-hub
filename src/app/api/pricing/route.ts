import { NextRequest, NextResponse } from 'next/server';
import { getAllPricing, getPricingForModel } from '@/lib/pricing';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get('model');

    if (modelId) {
      const pricing = getPricingForModel(modelId);
      if (!pricing) {
        return NextResponse.json({ error: 'Model not found' }, { status: 404 });
      }
      return NextResponse.json(pricing);
    }

    const allPricing = getAllPricing();
    return NextResponse.json({ pricing: allPricing });
  } catch (error) {
    console.error('Pricing API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
