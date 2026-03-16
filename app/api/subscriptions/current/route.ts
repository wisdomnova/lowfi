import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { getStripe, getStripePriceId, type PlanType, type BillingCycle } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  try {
    const user_id = await verifyAuth(req);
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: user_id },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If no subscription exists, create default starter plan
    if (!user.subscription) {
      const now = new Date();
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const subscription = await prisma.subscription.create({
        data: {
          userId: user_id,
          plan: 'starter',
          status: 'active',
          billingCycle: 'monthly',
          currentPeriodStart: now,
          currentPeriodEnd: nextMonth,
        },
      });

      return NextResponse.json(subscription);
    }

    return NextResponse.json(user.subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user_id = await verifyAuth(req);
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization' },
        { status: 401 }
      );
    }

    const { plan, billingCycle } = await req.json();

    if (!plan || !['starter', 'professional', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    if (billingCycle && !['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle' },
        { status: 400 }
      );
    }

    let subscription = await prisma.subscription.findUnique({
      where: { userId: user_id },
    });

    if (!subscription) {
      // Create default subscription if none exists
      const now = new Date();
      const nextPeriod = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      subscription = await prisma.subscription.create({
        data: {
          userId: user_id,
          plan,
          status: 'active',
          billingCycle: billingCycle || 'monthly',
          currentPeriodStart: now,
          currentPeriodEnd: nextPeriod,
        },
      });

      return NextResponse.json(subscription);
    }

    // If user has a Stripe subscription, update through Stripe
    if (subscription.stripeSubscriptionId) {
      try {
        const finalBillingCycle = (billingCycle || subscription.billingCycle) as BillingCycle;
        const newPriceId = getStripePriceId(plan as PlanType, finalBillingCycle);

        const stripeSubscription = await getStripe().subscriptions.retrieve(
          subscription.stripeSubscriptionId
        );

        await getStripe().subscriptions.update(subscription.stripeSubscriptionId, {
          items: [
            {
              id: stripeSubscription.items.data[0].id,
              price: newPriceId,
            },
          ],
          proration_behavior: 'create_prorations',
        });

        subscription = await prisma.subscription.update({
          where: { userId: user_id },
          data: {
            plan,
            billingCycle: finalBillingCycle,
          },
        });

        return NextResponse.json(subscription);
      } catch (stripeError) {
        console.error('Stripe update failed:', stripeError);
        return NextResponse.json(
          { error: 'Failed to update subscription through payment provider. Please use the billing page to change plans.' },
          { status: 400 }
        );
      }
    }

    // No Stripe subscription — update locally (e.g. starter/free tier)
    const finalBillingCycle = billingCycle || subscription.billingCycle;
    const now = new Date();
    const nextPeriod = new Date(
      finalBillingCycle === 'yearly'
        ? now.getTime() + 365 * 24 * 60 * 60 * 1000
        : now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    subscription = await prisma.subscription.update({
      where: { userId: user_id },
      data: {
        plan,
        billingCycle: finalBillingCycle,
        currentPeriodStart: now,
        currentPeriodEnd: nextPeriod,
        status: 'active',
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
