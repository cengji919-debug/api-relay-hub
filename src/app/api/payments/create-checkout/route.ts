import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { TOKEN_PACKAGES } from '@/lib/constants';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = authHeader.slice(7);
    const user = await verifyJWT<{ sub: string; email: string }>(token, process.env.JWT_SECRET || 'dev-secret');

    const { packageId, successUrl, cancelUrl } = await request.json();
    const pkg = TOKEN_PACKAGES.find(p => p.id === packageId);

    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${pkg.name} - ${(pkg.tokens / 1000000).toFixed(1)}M Tokens`,
            description: pkg.bonus > 0 ? `Includes ${(pkg.bonus / 10000).toFixed(0)}K bonus tokens` : undefined,
          },
          unit_amount: Math.round(pkg.price * 100),
        },
        quantity: 1,
      }],
      metadata: {
        userId: user.sub,
        packageId: pkg.id,
        tokens: String(pkg.tokens + pkg.bonus),
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?canceled=true`,
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}