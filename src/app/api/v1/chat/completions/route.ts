import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { apiKeys, tokenBalances, apiUsageLogs, apiProviders } from '@/drizzle/schema';
import { chatCompletionSchema } from '@/lib/validations';
import { PROVIDER_MODELS } from '@/lib/constants';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';

async function getSiliconFlowApiKey(): Promise<string | null> {
  return process.env.SILICONFLOW_API_KEY || null;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKeyValue = authHeader.slice(7);
    const db = getDB(process.env.DB as unknown as D1Database);

    const encoder = new TextEncoder();
    const keyData = encoder.encode(apiKeyValue);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    const keyHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    const keyRecord = await db.select({
      id: apiKeys.id,
      userId: apiKeys.userId,
    }).from(apiKeys).where(eq(apiKeys.keyHash, keyHash)).get();

    if (!keyRecord || !keyRecord.userId) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const body = await request.json();
    const validation = chatCompletionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    const { model, messages, temperature, stream, max_tokens } = validation.data;

    const modelConfig = PROVIDER_MODELS[model as keyof typeof PROVIDER_MODELS];
    if (!modelConfig) {
      return NextResponse.json({ error: `Unsupported model: ${model}` }, { status: 400 });
    }

    const siliconFlowApiKey = await getSiliconFlowApiKey();
    if (!siliconFlowApiKey) {
      return NextResponse.json({ error: 'Provider not configured' }, { status: 503 });
    }

    const balance = await db.select({ balance: tokenBalances.balance, lifetimeUsage: tokenBalances.lifetimeUsage })
      .from(tokenBalances)
      .where(eq(tokenBalances.userId, keyRecord.userId))
      .get();

    const estimatedTokens = messages.reduce((acc, m) => acc + m.content.length, 2) * 2;
    if (!balance || balance.balance < estimatedTokens) {
      return NextResponse.json({ error: 'Insufficient token balance' }, { status: 402 });
    }

    const startTime = Date.now();

    const response = await fetch(SILICONFLOW_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${siliconFlowApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: temperature ?? 0.7,
        stream: stream ?? false,
        max_tokens,
      }),
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json() as { usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } };

    if (!response.ok) {
      return NextResponse.json({ error: 'Provider API error', details: data }, { status: response.status });
    }

    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;
    const totalTokens = data.usage?.total_tokens || (inputTokens + outputTokens);

    const providerRecord = await db.select({ id: apiProviders.id })
      .from(apiProviders)
      .where(eq(apiProviders.name, 'siliconflow'))
      .get();

    await db.insert(apiUsageLogs).values({
      userId: keyRecord.userId,
      apiKeyId: keyRecord.id,
      providerId: providerRecord?.id || '',
      modelName: model,
      inputTokens,
      outputTokens,
      totalTokens,
      tokensCost: totalTokens,
      responseTimeMs: responseTime,
      statusCode: response.status,
    }).run();

    await db.update(tokenBalances)
      .set({
        balance: balance.balance - totalTokens,
        lifetimeUsage: (balance.lifetimeUsage || 0) + totalTokens,
      })
      .where(eq(tokenBalances.userId, keyRecord.userId))
      .run();

    await db.update(apiKeys)
      .set({ lastUsedAt: new Date().toISOString() })
      .where(eq(apiKeys.id, keyRecord.id))
      .run();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
