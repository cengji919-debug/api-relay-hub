import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import { TOKEN_PACKAGES } from '@/lib/constants';

export const runtime = 'edge';

async function stripeRequest(endpoint: string, method: string, body: Record<string, unknown>, secretKey: string) {
  const params = new URLSearchParams();
  function flatten(obj: Record<string, unknown>, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}[${key}]` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        flatten(value as Record<string, unknown>, fullKey);
      } else if (Array.isArray(value)) {
        value.forEach((item, i) => {
          flatten(item as Record<string, unknown>, `${fullKey}[${i}]`);
        });
      } else {
        params.append(fullKey, String(value));
      }
    }
  }
  flatten(body);

  const response = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  return response.json();
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const token = authHeader.slice(7);
    const user = await verifyJWT<{ sub: string; email: string }>(token, process.env.JWT_SECRET || 'dev-secret');

    const body = await request.json() as { packageId?: string; successUrl?: string; cancelUrl?: string };
    const { packageId, successUrl, cancelUrl } = body;
    const pkg = TOKEN_PACKAGES.find(p => p.id === packageId);

    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY || '';
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const session = await stripeRequest('/checkout/sessions', 'POST', {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${pkg.name} - ${(pkg.tokens / 1000000).toFixed(1)}M Tokens`,
              description: pkg.bonus > 0 ? `Includes ${(pkg.bonus / 10000).toFixed(0)}K bonus tokens` : undefined,
            },
            unit_amount: Math.round(pkg.price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.sub,
        packageId: pkg.id,
        tokens: String(pkg.tokens + pkg.bonus),
      },
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?success=true`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?canceled=true`,
    }, secretKey) as { url: string; id: string };

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}