export type PlanType = 'starter' | 'professional' | 'enterprise';
export type BillingCycle = 'monthly' | 'yearly';

export interface PlanFeatures {
  tools: number | 'unlimited'; // Number of tools available
  documentsPerMonth: number;
  teamMembers: number;
  support: 'email' | 'priority' | 'dedicated';
  customIntegrations: boolean;
  apiAccess: boolean;
  sla: boolean;
  analytics: 'basic' | 'advanced' | 'full';
}

export interface Plan {
  id: PlanType;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: number; // 0.2 = 20% discount
  features: PlanFeatures;
  highlighted?: boolean;
}

export const PLANS: Record<PlanType, Plan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Everything you need to get going',
    monthlyPrice: 29,
    yearlyPrice: 29 * 12 * 0.8, // 20% discount
    yearlyDiscount: 0.2,
    features: {
      tools: 3,
      documentsPerMonth: 200,
      teamMembers: 3,
      support: 'email',
      customIntegrations: false,
      apiAccess: false,
      sla: false,
      analytics: 'basic',
    },
    highlighted: false,
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'For growing teams that need more',
    monthlyPrice: 79,
    yearlyPrice: 79 * 12 * 0.8, // 20% discount
    yearlyDiscount: 0.2,
    features: {
      tools: 'unlimited',
      documentsPerMonth: 2000,
      teamMembers: 10,
      support: 'priority',
      customIntegrations: true,
      apiAccess: false,
      sla: false,
      analytics: 'advanced',
    },
    highlighted: true,
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Unlimited power for large teams',
    monthlyPrice: 199,
    yearlyPrice: 199 * 12 * 0.8, // 20% discount
    yearlyDiscount: 0.2,
    features: {
      tools: 'unlimited',
      documentsPerMonth: Number.MAX_SAFE_INTEGER,
      teamMembers: Number.MAX_SAFE_INTEGER,
      support: 'dedicated',
      customIntegrations: true,
      apiAccess: true,
      sla: true,
      analytics: 'full',
    },
    highlighted: false,
  },
};

export function getPlan(planId: PlanType): Plan {
  return PLANS[planId];
}

export function getPlanPrice(planId: PlanType, cycle: BillingCycle): number {
  const plan = PLANS[planId];
  return cycle === 'yearly' ? Math.round(plan.yearlyPrice) : plan.monthlyPrice;
}

export function getMonthlyEquivalent(planId: PlanType, cycle: BillingCycle): number {
  const price = getPlanPrice(planId, cycle);
  return cycle === 'yearly' ? Math.round(price / 12) : price;
}

export function canAccessFeature(
  planId: PlanType,
  feature: keyof PlanFeatures
): boolean {
  const plan = PLANS[planId];
  const value = plan.features[feature];

  if (typeof value === 'boolean') {
    return value;
  }

  // For numeric and string features, just check they exist
  return true;
}

export function getFeatureLimit(
  planId: PlanType,
  feature: keyof PlanFeatures
): number | string | null {
  const plan = PLANS[planId];
  const value = plan.features[feature];

  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }

  return null;
}

export const PLAN_ORDER: PlanType[] = ['starter', 'professional', 'enterprise'];

export function canUpgradeTo(currentPlan: PlanType, targetPlan: PlanType): boolean {
  const currentIndex = PLAN_ORDER.indexOf(currentPlan);
  const targetIndex = PLAN_ORDER.indexOf(targetPlan);
  return targetIndex > currentIndex;
}

export function canDowngradeTo(currentPlan: PlanType, targetPlan: PlanType): boolean {
  const currentIndex = PLAN_ORDER.indexOf(currentPlan);
  const targetIndex = PLAN_ORDER.indexOf(targetPlan);
  return targetIndex < currentIndex;
}
