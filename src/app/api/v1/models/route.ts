import { NextResponse } from 'next/server';
import { PROVIDER_MODELS } from '@/lib/constants';

export const runtime = 'edge';

export async function GET() {
  const models = Object.entries(PROVIDER_MODELS).map(([id, config]) => ({
    id,
    object: 'model',
    created: Date.now(),
    owned_by: config.provider,
    permission: [],
    root: id,
    parent: null,
  }));

  return NextResponse.json({ object: 'list', data: models });
}