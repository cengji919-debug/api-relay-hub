import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { payments, tokenBalances, tokenTransactions } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

async function verifyStripeWebhook(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  const parts = sigHeader.split(',');
  let timestamp = 0;
  let signature = '';

  for (const part of parts) {
    if (part.startsWith('t=')) {
      timestamp = parseInt(part.substring(2));
    } else if (part.startsWith('v1=')) {
      signature = part.substring(3);
    }
  }

  if (!timestamp || !signature) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const payloadData = encoder.encode(signedPayload);

  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, payloadData);
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return expected === signature;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const isValid = await verifyStripeWebhook(body, signature, webhookSecret);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const tokens = parseInt(session.metadata.tokens);
      const amount = (session.amount_total || 0) / 100;

      const db = getDB(process.env.DB as unknown as D1Database);

      await db.insert(payments).values({
        userId,
        provider: 'STRIPE',
        providerPaymentId: session.id,
        amount,
        currency: (session.currency || 'usd').toUpperCase(),
        tokens,
        status: 'COMPLETED',
        metadata: JSON.stringify(session),
      }).run();

      const currentBalance = await db.select({ balance: tokenBalances.balance })
        .from(tokenBalances)
        .where(eq(tokenBalances.userId, userId))
        .get();

      const newBalance = (currentBalance?.balance || 0) + tokens;

      await db.update(tokenBalances)
        .set({ balance: newBalance })
        .where(eq(tokenBalances.userId, userId))
        .run();

      await db.insert(tokenTransactions).values({
        userId,
        type: 'PURCHASE',
        amount: tokens,
        balanceBefore: currentBalance?.balance || 0,
        balanceAfter: newBalance,
        referenceType: 'payment',
        referenceId: session.id,
        description: `Stripe purchase - $${amount}`,
      }).run();
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}