/**
 * Automation Trigger Tracking Service
 * Monitors campaign events and triggers automation workflows via Inngest
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { inngest } from '@/lib/inngest';

/**
 * Track email open events and trigger automation
 */
export async function trackEmailOpen(campaignId: string, customerId: string) {
  try {
    // Trigger automation workflows that listen for opens
    await inngest.send({
      name: 'campaign/email.opened',
      data: {
        campaignId,
        customerId,
        timestamp: new Date().toISOString(),
      },
    });

    // Log the event for debugging
    console.log(`Email opened: campaign=${campaignId}, customer=${customerId}`);
  } catch (error) {
    console.error('Failed to track email open:', error);
  }
}

/**
 * Track email click events and trigger automation
 */
export async function trackEmailClick(campaignId: string, customerId: string, url: string) {
  try {
    // Trigger automation workflows that listen for clicks
    await inngest.send({
      name: 'campaign/email.clicked',
      data: {
        campaignId,
        customerId,
        url,
        timestamp: new Date().toISOString(),
      },
    });

    // Log the event for debugging
    console.log(`Email clicked: campaign=${campaignId}, customer=${customerId}, url=${url}`);
  } catch (error) {
    console.error('Failed to track email click:', error);
  }
}

/**
 * Track bounce events and trigger automation
 */
export async function trackEmailBounce(campaignId: string, customerId: string, bounceType: 'hard' | 'soft') {
  try {
    // Trigger automation workflows that listen for bounces
    await inngest.send({
      name: 'campaign/email.bounced',
      data: {
        campaignId,
        customerId,
        bounceType,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`Email bounced: campaign=${campaignId}, customer=${customerId}, type=${bounceType}`);
  } catch (error) {
    console.error('Failed to track email bounce:', error);
  }
}

/**
 * Trigger scheduled campaign send
 */
export async function triggerScheduledSend(campaignId: string, scheduleId: string) {
  try {
    await inngest.send({
      name: 'campaign/scheduled.send',
      data: {
        campaignId,
        scheduleId,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`Scheduled send triggered: campaign=${campaignId}, schedule=${scheduleId}`);
  } catch (error) {
    console.error('Failed to trigger scheduled send:', error);
  }
}

/**
 * Trigger A/B test evaluation
 */
export async function triggerABTestEvaluation(testId: string) {
  try {
    await inngest.send({
      name: 'campaign/abtest.evaluate',
      data: {
        testId,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`A/B test evaluation triggered: test=${testId}`);
  } catch (error) {
    console.error('Failed to trigger A/B test evaluation:', error);
  }
}

/**
 * Trigger automation workflow execution
 */
export async function triggerAutomationExecution(automationId: string, customerId: string) {
  try {
    const automation = await prisma.campaignAutomation.findUnique({
      where: { id: automationId },
    });

    if (!automation) {
      throw new Error(`Automation ${automationId} not found`);
    }

    await inngest.send({
      name: 'campaign/automation.execute',
      data: {
        automationId,
        customerId,
        trigger: automation.trigger,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`Automation execution triggered: automation=${automationId}, customer=${customerId}`);
  } catch (error) {
    console.error('Failed to trigger automation execution:', error);
  }
}

/**
 * Trigger compliance check
 */
export async function triggerComplianceCheck(campaignId: string, domain: string) {
  try {
    await inngest.send({
      name: 'campaign/compliance.check',
      data: {
        campaignId,
        domain,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`Compliance check triggered: campaign=${campaignId}, domain=${domain}`);
  } catch (error) {
    console.error('Failed to trigger compliance check:', error);
  }
}

/**
 * Trigger approval notification
 */
export async function triggerApprovalNotification(approvalId: string, campaignId: string) {
  try {
    await inngest.send({
      name: 'campaign/approval.requested',
      data: {
        approvalId,
        campaignId,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`Approval notification triggered: approval=${approvalId}, campaign=${campaignId}`);
  } catch (error) {
    console.error('Failed to trigger approval notification:', error);
  }
}
