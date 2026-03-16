import { prisma } from '@/lib/prisma';
import { PLANS, type PlanType } from '@/lib/plans';

export interface PlanGate {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
}

export async function checkDocumentLimit(
  userId: string,
  currentMonthUsage: number = 0
): Promise<PlanGate> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return {
        allowed: false,
        reason: 'No subscription found',
      };
    }

    const planType = subscription.plan as PlanType;
    if (!PLANS[planType]) {
      return {
        allowed: false,
        reason: 'Invalid plan type',
      };
    }

    const plan = PLANS[planType];
    const limit = plan.features.documentsPerMonth;
    const nextUsage = currentMonthUsage + 1;

    if (nextUsage > limit) {
      return {
        allowed: false,
        reason: `You've reached your ${limit} documents/month limit. Upgrade to process more.`,
        currentUsage: currentMonthUsage,
        limit,
      };
    }

    return {
      allowed: true,
      currentUsage: currentMonthUsage,
      limit,
    };
  } catch (error) {
    console.error('Error checking document limit:', error);
    return {
      allowed: false,
      reason: 'Error checking plan limits',
    };
  }
}

export async function checkTeamMemberLimit(
  userId: string,
  currentTeamSize: number = 0
): Promise<PlanGate> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return {
        allowed: false,
        reason: 'No subscription found',
      };
    }

    const planType = subscription.plan as PlanType;
    if (!PLANS[planType]) {
      return {
        allowed: false,
        reason: 'Invalid plan type',
      };
    }

    const plan = PLANS[planType];
    const limit = plan.features.teamMembers;
    const nextSize = currentTeamSize + 1;

    if (nextSize > limit) {
      return {
        allowed: false,
        reason: `Your plan allows up to ${limit} team members. Upgrade to add more.`,
        currentUsage: currentTeamSize,
        limit,
      };
    }

    return {
      allowed: true,
      currentUsage: currentTeamSize,
      limit,
    };
  } catch (error) {
    console.error('Error checking team member limit:', error);
    return {
      allowed: false,
      reason: 'Error checking plan limits',
    };
  }
}

export async function canAccessFeature(
  userId: string,
  feature: 'invoices' | 'followups' | 'tickets' | 'api' | 'customIntegrations'
): Promise<PlanGate> {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return {
        allowed: false,
        reason: 'No subscription found',
      };
    }

    const planType = subscription.plan as PlanType;
    if (!PLANS[planType]) {
      return {
        allowed: false,
        reason: 'Invalid plan type',
      };
    }

    const plan = PLANS[planType];
    const featureAccess: Record<string, boolean> = {
      invoices: true, // Available on all plans
      followups: true, // Available on all plans
      tickets: true, // Available on all plans
      api: plan.features.apiAccess,
      customIntegrations: plan.features.customIntegrations,
    };

    if (!featureAccess[feature]) {
      return {
        allowed: false,
        reason: `${feature} is not available on the ${plan.name} plan`,
      };
    }

    return {
      allowed: true,
    };
  } catch (error) {
    console.error('Error checking feature access:', error);
    return {
      allowed: false,
      reason: 'Error checking plan limits',
    };
  }
}

export async function getUserPlanInfo(userId: string) {
  try {
    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    // Create default subscription if none exists
    if (!subscription) {
      const now = new Date();
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      subscription = await prisma.subscription.create({
        data: {
          userId,
          plan: 'starter',
          status: 'active',
          billingCycle: 'monthly',
          currentPeriodStart: now,
          currentPeriodEnd: nextMonth,
        },
      });
    }

    const planType = subscription.plan as PlanType;
    if (!PLANS[planType]) {
      throw new Error(`Invalid plan type: ${subscription.plan}`);
    }

    const plan = PLANS[planType];

    return {
      subscription,
      plan,
      planName: plan.name,
      features: plan.features,
    };
  } catch (error) {
    console.error('Error getting user plan info:', error);
    return null;
  }
}
