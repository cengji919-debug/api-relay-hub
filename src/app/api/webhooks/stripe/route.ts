import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { payments, tokenBalances, tokenTransactions } from '../../../drizzle/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );
    } catch {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const tokens = parseInt(session.metadata.tokens);
      const amount = session.amount_total / 100;

      const db = getDB(process.env.DB as unknown as D1Database);

      await db.insert(payments).values({
        userId,
        provider: 'STRIPE',
        providerPaymentId: session.id,
        amount,
        currency: session.currency.toUpperCase(),
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