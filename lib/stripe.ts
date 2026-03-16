import Stripe from 'stripe';

// Initialize Stripe - will be undefined if keys not set at build time
// This is OK because these are only used at runtime in API routes
const stripeKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeKey 
  ? new Stripe(stripeKey, {
      // Use default API version
    })
  : null;

/**
 * Get a safe Stripe client, throwing a clear error if not configured.
 */
export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error(
      'Stripe is not configured. Set STRIPE_SECRET_KEY in environment variables.'
    );
  }
  return stripe;
}

// Stripe Price IDs - These must be created in Stripe Dashboard
// or via the Stripe API. Update these after creating prices in Stripe.
export const STRIPE_PRICES = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || '',
  },
  professional: {
    monthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_PROFESSIONAL_YEARLY || '',
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || '',
  },
};

export type PlanType = 'starter' | 'professional' | 'enterprise';
export type BillingCycle = 'monthly' | 'yearly';

/**
 * Get Stripe price ID for a given plan and billing cycle
 */
export function getStripePriceId(plan: PlanType, billingCycle: BillingCycle): string {
  const priceId = STRIPE_PRICES[plan][billingCycle];
  if (!priceId) {
    throw new Error(
      `Stripe price not configured for ${plan} ${billingCycle}. ` +
      `Add STRIPE_PRICE_${plan.toUpperCase()}_${billingCycle.toUpperCase()} to environment variables.`
    );
  }
  return priceId;
}

/**
 * Map Stripe subscription status to our status enum
 */
export function mapStripeStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'active': 'active',
    'past_due': 'past_due',
    'unpaid': 'past_due',
    'canceled': 'cancelled',
    'incomplete': 'past_due',
    'incomplete_expired': 'cancelled',
    'trialing': 'active',
    'paused': 'paused',
  };
  return statusMap[status] || 'past_due';
}

/**
 * Extract plan type from Stripe price ID
 * (Assumes price IDs follow a convention)
 */
export function extractPlanFromStripePrice(priceId: string): PlanType | null {
  for (const [plan, prices] of Object.entries(STRIPE_PRICES)) {
    if (Object.values(prices).includes(priceId)) {
      return plan as PlanType;
    }
  }
  return null;
}

/**
 * Extract billing cycle from Stripe subscription
 */
export function extractBillingCycleFromSubscription(
  subscription: Stripe.Subscription
): BillingCycle {
  if (!subscription.items.data[0]?.plan?.interval) {
    return 'monthly';
  }
  return subscription.items.data[0].plan.interval === 'year' ? 'yearly' : 'monthly';
}
