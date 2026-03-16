import { NextRequest, NextResponse } from 'next/server';
import { getStripe, mapStripeStatus, extractPlanFromStripePrice, extractBillingCycleFromSubscription } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { sendTransactionalEmail } from '@/lib/resend';
import { subscriptionConfirmationEmail } from '@/lib/email-templates';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  // Will be caught at runtime if not set
  console.warn('STRIPE_WEBHOOK_SECRET is not set - webhooks will not work');
}

const secret: string = webhookSecret || '';

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json(
      { error: 'Stripe webhook not configured' },
      { status: 400 }
    );
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = getStripe().webhooks.constructEvent(body, signature, secret);
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`Processing Stripe webhook: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed
 * Triggered when payment succeeds
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan;
  const billingCycle = session.metadata?.billingCycle;

  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }

  const subscriptionId = session.subscription as string;

  if (!subscriptionId) {
    console.error('No subscription created in checkout session');
    return;
  }

  // Fetch the subscription from Stripe
  const stripeSubscription = (await getStripe().subscriptions.retrieve(
    subscriptionId
  )) as any; // Stripe API response

  // Update our database
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: plan || 'starter',
      status: mapStripeStatus(stripeSubscription.status),
      billingCycle: billingCycle || 'monthly',
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscriptionId,
      currentPeriodStart: new Date((stripeSubscription.current_period_start as number) * 1000),
      currentPeriodEnd: new Date((stripeSubscription.current_period_end as number) * 1000),
    },
    update: {
      plan: plan || undefined,
      status: mapStripeStatus(stripeSubscription.status),
      billingCycle: billingCycle || undefined,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscriptionId,
      currentPeriodStart: new Date((stripeSubscription.current_period_start as number) * 1000),
      currentPeriodEnd: new Date((stripeSubscription.current_period_end as number) * 1000),
      cancelledAt: null,
    },
  });

  console.log(`✓ Subscription created for user ${userId}: ${subscriptionId}`);

  // Send branded subscription confirmation email
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (user?.email) {
      const planNames: Record<string, string> = { starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise' };
      const planAmounts: Record<string, string> = { starter: '$29', professional: '$79', enterprise: '$199' };
      const planKey = plan || 'starter';
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lowfi.app';
      const template = subscriptionConfirmationEmail(
        planNames[planKey] || planKey,
        planAmounts[planKey] || '$29',
        `${baseUrl}/dashboard`,
      );
      await sendTransactionalEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    }
  } catch (emailError) {
    console.error('Subscription confirmation email failed:', emailError);
  }
}

/**
 * Handle customer.subscription.updated
 * Triggered when subscription plan/billing changes
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  const plan = extractPlanFromStripePrice(subscription.items.data[0]?.price?.id || '');
  const billingCycle = extractBillingCycleFromSubscription(subscription);

  const sub = subscription as any;
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan: plan || 'starter',
      status: mapStripeStatus(subscription.status),
      billingCycle,
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      currentPeriodStart: new Date((sub.current_period_start as number) * 1000),
      currentPeriodEnd: new Date((sub.current_period_end as number) * 1000),
    },
    update: {
      plan: plan || undefined,
      status: mapStripeStatus(subscription.status),
      billingCycle: billingCycle || undefined,
      currentPeriodStart: new Date((sub.current_period_start as number) * 1000),
      currentPeriodEnd: new Date((sub.current_period_end as number) * 1000),
    },
  });

  console.log(`✓ Subscription updated for user ${userId}: ${subscription.id}`);
}

/**
 * Handle customer.subscription.deleted
 * Triggered when subscription is cancelled
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'cancelled',
      cancelledAt: new Date(),
    },
  });

  console.log(`✓ Subscription cancelled for user ${userId}`);
}

/**
 * Handle invoice.payment_succeeded
 * Triggered on successful recurring payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string | undefined;

  if (!subscriptionId) {
    console.log('Invoice not associated with subscription');
    return;
  }

  // Fetch subscription to get user
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Update subscription status
  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'active',
    },
  });

  console.log(`✓ Invoice paid for user ${userId}: ${invoice.id}`);
}

/**
 * Handle invoice.payment_failed
 * Triggered when recurring payment fails
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string | undefined;

  if (!subscriptionId) {
    console.log('Invoice not associated with subscription');
    return;
  }

  // Fetch subscription to get user
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Update subscription status
  await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'past_due',
    },
  });

  console.log(`✗ Invoice payment failed for user ${userId}: ${invoice.id}`);
}
