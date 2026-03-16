import { NextRequest, NextResponse } from 'next/server';
import { getStripe, getStripePriceId, type PlanType, type BillingCycle } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const user_id = await verifyAuth(req);
    if (!user_id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { plan, billingCycle, successUrl, cancelUrl } = await req.json();

    // Validate inputs
    if (!plan || !['starter', 'professional', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (!billingCycle || !['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 });
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json(
        { error: 'successUrl and cancelUrl are required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: user_id },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get or create Stripe customer
    let customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        metadata: {
          userId: user_id,
          email: user.email,
        },
      });
      customerId = customer.id;

      // Update subscription record with customer ID
      if (user.subscription) {
        await prisma.subscription.update({
          where: { userId: user_id },
          data: { stripeCustomerId: customerId },
        });
      } else {
        // Create subscription if doesn't exist
        await prisma.subscription.create({
          data: {
            userId: user_id,
            plan: plan as PlanType,
            status: 'active',
            billingCycle: billingCycle as BillingCycle,
            stripeCustomerId: customerId,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(
              new Date().getTime() +
                (billingCycle === 'yearly'
                  ? 365 * 24 * 60 * 60 * 1000
                  : 30 * 24 * 60 * 60 * 1000)
            ),
          },
        });
      }
    }

    // Get Stripe price ID
    const priceId = getStripePriceId(plan as PlanType, billingCycle as BillingCycle);

    // Create checkout session
    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user_id,
        plan,
        billingCycle,
      },
      subscription_data: {
        metadata: {
          userId: user_id,
          plan,
          billingCycle,
        },
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Stripe price not configured')) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
