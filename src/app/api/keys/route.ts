import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { apiKeys } from '../../../drizzle/schema';
import { createApiKeySchema } from '@/lib/validations';
import { generateApiKey, verifyJWT } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export const runtime = 'edge';

async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.slice(7);
    return await verifyJWT<{ sub: string; email: string; role: string }>(
      token,
      process.env.JWT_SECRET || 'dev-secret',
    );
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const user = await authenticate(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDB(process.env.DB as unknown as D1Database);
  const keys = await db.select({
    id: apiKeys.id,
    keyPreview: apiKeys.keyPreview,
    name: apiKeys.name,
    isActive: apiKeys.isActive,
    lastUsedAt: apiKeys.lastUsedAt,
    createdAt: apiKeys.createdAt,
  }).from(apiKeys).where(eq(apiKeys.userId, user.sub)).all();

  return NextResponse.json({ keys });
}

export async function POST(request: NextRequest) {
  const user = await authenticate(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validation = createApiKeySchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
  }

  const { key, preview, hash } = generateApiKey();
  const db = getDB(process.env.DB as unknown as D1Database);

  await db.insert(apiKeys).values({
    userId: user.sub,
    keyPreview: preview,
    keyHash: hash,
    name: validation.data.name || null,
  }).run();

  return NextResponse.json({ key, preview, name: validation.data.name });
}

export async function DELETE(request: NextRequest) {
  const user = await authenticate(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const keyId = searchParams.get('id');
  if (!keyId) {
    return NextResponse.json({ error: 'Key ID required' }, { status: 400 });
  }

  const db = getDB(process.env.DB as unknown as D1Database);
  await db.delete(apiKeys).where(
    and(eq(apiKeys.id, keyId), eq(apiKeys.userId, user.sub)),
  ).run();

  return NextResponse.json({ success: true });
}