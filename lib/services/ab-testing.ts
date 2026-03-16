/**
 * A/B Testing Service
 * Handles A/B test creation, recipient allocation, result calculation, and winner selection
 */

import { prisma } from '@/lib/prisma';
import { inngest } from '@/lib/inngest';

export interface ABTestConfig {
  campaignId: string;
  userId: string;
  name: string;
  testType: 'subject' | 'content' | 'sendtime';
  variantA: Record<string, any>;
  variantB: Record<string, any>;
  splitPercent: number; // Percentage for test group (rest get winning variant)
  testDuration?: number; // Hours to run test before determining winner
}

/**
 * Create and initialize A/B test
 */
export async function createABTest(config: ABTestConfig) {
  const { campaignId, name, testType, variantA, variantB, splitPercent, testDuration = 24, userId } = config;

  // Create A/B test record
  const abTest = await prisma.aBTest.create({
    data: {
      campaignId,
      userId,
      name,
      testType,
      variantA: JSON.stringify(variantA),
      variantB: JSON.stringify(variantB),
      splitPercent,
      status: 'active',
      startedAt: new Date(),
    },
  });

  // Allocate recipients to variants
  await allocateRecipientsToVariants(campaignId, abTest.id, splitPercent);

  return abTest;
}

/**
 * Allocate recipients to A/B test variants
 * TODO: Create ABTestAllocation table or use CampaignSendUpdated for tracking
 */
async function allocateRecipientsToVariants(
  campaignId: string,
  testId: string,
  splitPercent: number
) {
  // Placeholder - allocation will be done at send time
  // based on splitPercent
  return;
}


/**
 * Legacy - replaced by proper implementation below
 * Kept for reference
 */

// Commented out - needs proper schema support
// async function getVariantStats(campaignId: string, testId: string, variant: 'A' | 'B') {
//   // TODO: Implement with CampaignSendUpdated tracking
//   return { sent: 0, opened: 0, clicked: 0 };
// }

// async function sendWinningVariantToControlGroup(
//   campaignId: string,
//   testId: string,
//   winner: 'A' | 'B'
// ) {
//   // TODO: Implement winning variant distribution
// }

/**
 * Monitor active A/B tests
 */
export async function monitorActiveTests() {
  const now = new Date();

  const activeTests = await prisma.aBTest.findMany({
    where: {
      status: 'active',
      startedAt: {
        lte: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 24 hours ago
      },
    },
  });

  for (const test of activeTests) {
    try {
      const hasData = await hasEnoughTestData(test.id, 50);
      if (hasData) {
        await finalizeABTest(test.id);
      }
    } catch (error) {
      console.error(`Failed to complete A/B test ${test.id}:`, error);
    }
  }
}

/**
 * Calculate A/B test metrics and determine winner
 */
export interface ABTestMetrics {
  variant: string;
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
  bounced: number;
}

export interface ABTestResults {
  testId: string;
  variantA: ABTestMetrics;
  variantB: ABTestMetrics;
  winner: 'A' | 'B' | null;
  confidence: number;
  winningMetric: 'open_rate' | 'click_rate';
}

/**
 * Calculate metrics for a variant group
 */
async function getVariantMetrics(
  campaignId: string,
  customerIds: string[]
): Promise<ABTestMetrics> {
  if (customerIds.length === 0) {
    return {
      variant: 'empty',
      sent: 0,
      opened: 0,
      clicked: 0,
      openRate: 0,
      clickRate: 0,
      bounced: 0,
    };
  }

  const sends = await prisma.campaignSendUpdated.findMany({
    where: {
      campaignId,
      customerId: { in: customerIds },
    },
  });

  const sent = customerIds.length;
  const opened = sends.filter((s) => s.status === 'opened').length;
  const clicked = sends.filter((s) => s.status === 'clicked').length;
  const bounced = sends.filter((s) => s.status === 'bounced').length;

  return {
    variant: 'test',
    sent,
    opened,
    clicked,
    openRate: sent > 0 ? (opened / sent) * 100 : 0,
    clickRate: sent > 0 ? (clicked / sent) * 100 : 0,
    bounced,
  };
}

/**
 * Calculate statistical confidence (chi-squared approximation)
 */
function calculateConfidence(
  variantA: ABTestMetrics,
  variantB: ABTestMetrics
): number {
  const totalA = variantA.sent;
  const totalB = variantB.sent;

  if (totalA === 0 || totalB === 0) {
    return 0;
  }

  const rateA = variantA.openRate / 100;
  const rateB = variantB.openRate / 100;
  const diffRate = Math.abs(rateA - rateB);

  const pooledP = (variantA.opened + variantB.opened) / (totalA + totalB);
  const se = Math.sqrt(pooledP * (1 - pooledP) * (1 / totalA + 1 / totalB));

  if (se === 0) {
    return 0;
  }

  const z = diffRate / se;

  // 95% = z > 1.96, 90% = z > 1.645, 80% = z > 1.282
  if (z > 1.96) return 95;
  if (z > 1.645) return 90;
  if (z > 1.282) return 80;

  return Math.min(z * 10, 75);
}

/**
 * Calculate A/B test results
 */
export async function calculateABTestResults(testId: string): Promise<ABTestResults | null> {
  try {
    const test = await prisma.aBTest.findUnique({
      where: { id: testId },
    });

    if (!test) {
      return null;
    }

    // Get recipients with variant info
    const recipients = await prisma.campaignRecipient.findMany({
      where: { campaignId: test.campaignId },
    });

    const variantARecipients = recipients.filter(
      (r) => (r.mergeData as Record<string, any>)?.variant === 'A'
    );
    const variantBRecipients = recipients.filter(
      (r) => (r.mergeData as Record<string, any>)?.variant === 'B'
    );

    // Get metrics for each variant
    const variantAMetrics = await getVariantMetrics(
      test.campaignId,
      variantARecipients.map((r) => r.customerId)
    );

    const variantBMetrics = await getVariantMetrics(
      test.campaignId,
      variantBRecipients.map((r) => r.customerId)
    );

    // Determine winner based on test type
    const metric = (test.testType as string) || 'open_rate';
    const scoreA = metric === 'click_rate' ? variantAMetrics.clickRate : variantAMetrics.openRate;
    const scoreB = metric === 'click_rate' ? variantBMetrics.clickRate : variantBMetrics.openRate;

    let winner: 'A' | 'B' | null = null;
    if (scoreA > scoreB) {
      winner = 'A';
    } else if (scoreB > scoreA) {
      winner = 'B';
    }

    const confidence = calculateConfidence(variantAMetrics, variantBMetrics);

    return {
      testId,
      variantA: variantAMetrics,
      variantB: variantBMetrics,
      winner,
      confidence,
      winningMetric: metric as 'open_rate' | 'click_rate',
    };
  } catch (error) {
    console.error('Failed to calculate A/B test metrics:', error);
    return null;
  }
}

/**
 * Finalize A/B test and mark winner
 */
export async function finalizeABTest(testId: string): Promise<boolean> {
  try {
    const results = await calculateABTestResults(testId);

    if (!results) {
      return false;
    }

    // Update test with winner
    await prisma.aBTest.update({
      where: { id: testId },
      data: {
        winner: results.winner || undefined,
        status: 'completed',
        endedAt: new Date(),
      },
    });

    // Trigger Inngest job to send winning variant to remaining customers
    if (results.winner) {
      await inngest.send({
        name: 'campaign/abtest.winner_send',
        data: {
          testId,
          winner: results.winner,
          confidence: results.confidence,
        },
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to finalize A/B test:', error);
    return false;
  }
}

/**
 * Get test results for display
 */
export async function getABTestResults(testId: string): Promise<ABTestResults | null> {
  return calculateABTestResults(testId);
}

/**
 * Check if test has enough data
 */
export async function hasEnoughTestData(testId: string, minSamples: number = 50): Promise<boolean> {
  try {
    const test = await prisma.aBTest.findUnique({
      where: { id: testId },
    });

    if (!test) {
      return false;
    }

    const sends = await prisma.campaignSendUpdated.findMany({
      where: { campaignId: test.campaignId },
    });

    return sends.length >= minSamples;
  } catch (error) {
    console.error('Failed to check test data:', error);
    return false;
  }
}
