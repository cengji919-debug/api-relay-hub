import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { apiKeys, users, tokenBalances, apiUsageLogs, apiProviders } from '../../../../drizzle/schema';
import { chatCompletionSchema } from '@/lib/validations';
import { PROVIDER_MODELS } from '@/lib/constants';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

const PROVIDER_ENDPOINTS: Record<string, { url: string; headers: (apiKey: string) => Record<string, string>; transformBody: (body: any) => any; transformResponse: (data: any) => any }> = {
  ernie: {
    url: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat',
    headers: () => ({}),
    transformBody: (body: any) => ({
      messages: body.messages,
      temperature: body.temperature ?? 0.7,
      stream: body.stream ?? false,
    }),
    transformResponse: (data: any) => ({
      id: data.id,
      object: 'chat.completion',
      created: Date.now(),
      model: data.model,
      choices: [{
        index: 0,
        message: { role: 'assistant', content: data.result },
        finish_reason: 'stop',
      }],
      usage: {
        prompt_tokens: data.usage?.prompt_tokens || 0,
        completion_tokens: data.usage?.completion_tokens || 0,
        total_tokens: data.usage?.total_tokens || 0,
      },
    }),
  },
  tongyi: {
    url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    headers: (apiKey: string) => ({ 'Authorization': `Bearer ${apiKey}` }),
    transformBody: (body: any) => ({
      model: body.model,
      input: { messages: body.messages },
      parameters: {
        temperature: body.temperature ?? 0.7,
        result_format: 'message',
      },
    }),
    transformResponse: (data: any) => ({
      id: data.request_id,
      object: 'chat.completion',
      created: Date.now(),
      model: data.output?.model_id,
      choices: data.output?.choices?.map((c: any) => ({
        index: c.index,
        message: c.message,
        finish_reason: c.finish_reason,
      })) || [],
      usage: data.usage,
    }),
  },
  spark: {
    url: 'https://spark-api.xf-yun.com/v4.0/chat',
    headers: (apiKey: string) => ({ 'Authorization': `Bearer ${apiKey}` }),
    transformBody: (body: any) => ({
      header: { app_id: process.env.SPARK_APP_ID },
      parameter: { chat: { temperature: body.temperature ?? 0.7 } },
      payload: {
        message: { text: body.messages.map((m: any) => ({ role: m.role, content: m.content })) },
      },
    }),
    transformResponse: (data: any) => ({
      id: data.header?.sid,
      object: 'chat.completion',
      created: Date.now(),
      choices: [{
        index: 0,
        message: { role: 'assistant', content: data.payload?.choices?.text?.[0]?.content || '' },
        finish_reason: 'stop',
      }],
      usage: data.payload?.usage?.text ? {
        prompt_tokens: data.payload.usage.text[0]?.question_tokens || 0,
        completion_tokens: data.payload.usage.text[0]?.answer_tokens || 0,
        total_tokens: (data.payload.usage.text[0]?.question_tokens || 0) + (data.payload.usage.text[0]?.answer_tokens || 0),
      } : undefined,
    }),
  },
  deepseek: {
    url: 'https://api.deepseek.com/chat/completions',
    headers: (apiKey: string) => ({ 'Authorization': `Bearer ${apiKey}` }),
    transformBody: (body: any) => body,
    transformResponse: (data: any) => data,
  },
};

async function getProviderApiKey(provider: string): Promise<string | null> {
  const envKey = `${provider.toUpperCase()}_API_KEY`;
  return process.env[envKey] || null;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKeyValue = authHeader.slice(7);
    const db = getDB(process.env.DB as unknown as D1Database);

    const crypto = require('crypto');
    const keyHash = crypto.createHash('sha256').update(apiKeyValue).digest('hex');

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

    const provider = modelConfig.provider;
    const adapter = PROVIDER_ENDPOINTS[provider];
    if (!adapter) {
      return NextResponse.json({ error: `Unsupported provider: ${provider}` }, { status: 400 });
    }

    const providerApiKey = await getProviderApiKey(provider);
    if (!providerApiKey) {
      return NextResponse.json({ error: 'Provider not configured' }, { status: 503 });
    }

    const balance = await db.select({ balance: tokenBalances.balance })
      .from(tokenBalances)
      .where(eq(tokenBalances.userId, keyRecord.userId))
      .get();

    const estimatedTokens = messages.reduce((acc, m) => acc + m.content.length, 0) * 2;
    if (!balance || balance.balance < estimatedTokens) {
      return NextResponse.json({ error: 'Insufficient token balance' }, { status: 402 });
    }

    const startTime = Date.now();
    const transformedBody = adapter.transformBody({
      model, messages, temperature, stream, max_tokens,
    });

    const response = await fetch(adapter.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...adapter.headers(providerApiKey),
      },
      body: JSON.stringify(transformedBody),
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: 'Provider API error', details: data }, { status: response.status });
    }

    const transformed = adapter.transformResponse(data);
    const inputTokens = transformed.usage?.prompt_tokens || 0;
    const outputTokens = transformed.usage?.completion_tokens || 0;
    const totalTokens = transformed.usage?.total_tokens || (inputTokens + outputTokens);

    const providerRecord = await db.select({ id: apiProviders.id })
      .from(apiProviders)
      .where(eq(apiProviders.name, provider))
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

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}