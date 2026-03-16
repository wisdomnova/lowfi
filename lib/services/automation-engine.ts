/**
 * Automation Execution Engine
 * Evaluates triggers and executes actions for campaign automations
 */

import { prisma } from '@/lib/prisma';
import { inngest } from '@/lib/inngest';

export interface TriggerContext {
  automationId: string;
  campaignId: string;
  customerId: string;
  trigger: string;
  triggerData?: Record<string, any>;
  eventData?: Record<string, any>;
}

export interface ActionContext extends TriggerContext {
  action: string;
  actionData?: Record<string, any>;
}

/**
 * Evaluate if a trigger condition is met
 */
export async function evaluateTrigger(context: TriggerContext): Promise<boolean> {
  const automation = await prisma.campaignAutomation.findUnique({
    where: { id: context.automationId },
  });

  if (!automation || !automation.enabled) {
    return false;
  }

  const triggerData = automation.triggerData as Record<string, any>;

  switch (automation.trigger) {
    case 'email_opened':
      return await checkEmailOpened(context.campaignId, context.customerId);

    case 'email_click':
      return await checkEmailClicked(context.campaignId, context.customerId);

    case 'no_response':
      const delayHours = triggerData.delayHours || 24;
      return await checkNoResponse(context.campaignId, context.customerId, delayHours);

    case 'form_submit':
      return await checkFormSubmitted(context.customerId, triggerData);

    case 'date':
      return checkDateTrigger(triggerData);

    case 'webhook':
      return checkWebhookTrigger(context.eventData || {}, triggerData);

    default:
      return false;
  }
}

/**
 * Execute automation action
 */
export async function executeAction(context: ActionContext): Promise<boolean> {
  const automation = await prisma.campaignAutomation.findUnique({
    where: { id: context.automationId },
  });

  if (!automation) {
    return false;
  }

  const actionData = automation.actionData as Record<string, any>;

  try {
    switch (automation.action) {
      case 'send_email':
        return await sendAutomationEmail(
          context.customerId,
          actionData.templateId || '',
          actionData
        );

      case 'send_campaign':
        return await sendFollowupCampaign(
          context.customerId,
          actionData.campaignId || '',
          actionData
        );

      case 'add_tag':
        return await addCustomerTag(context.customerId, actionData.tag || '');

      case 'update_field':
        return await updateCustomerField(
          context.customerId,
          actionData.field || '',
          actionData.value || ''
        );

      case 'lead_score':
        return await updateLeadScore(
          context.customerId,
          actionData.points || 0,
          actionData.reason || ''
        );

      case 'webhook':
        return await triggerWebhook(actionData.url || '', context);

      default:
        return false;
    }
  } catch (error: any) {
    console.error(`Failed to execute action ${automation.action}:`, error);
    return false;
  }
}

/**
 * Check if email was opened
 */
async function checkEmailOpened(campaignId: string, customerId: string): Promise<boolean> {
  const send = await prisma.campaignSendUpdated.findFirst({
    where: {
      campaignId,
      customerId,
      status: 'opened',
    },
  });
  return !!send;
}

/**
 * Check if email link was clicked
 */
async function checkEmailClicked(campaignId: string, customerId: string): Promise<boolean> {
  const send = await prisma.campaignSendUpdated.findFirst({
    where: {
      campaignId,
      customerId,
      status: 'clicked',
    },
  });
  return !!send;
}

/**
 * Check if no response received within delay period
 */
async function checkNoResponse(
  campaignId: string,
  customerId: string,
  delayHours: number
): Promise<boolean> {
  const cutoffTime = new Date(Date.now() - delayHours * 60 * 60 * 1000);

  const send = await prisma.campaignSendUpdated.findFirst({
    where: {
      campaignId,
      customerId,
      sentAt: { lte: cutoffTime },
      status: 'sent',
    },
  });

  return !!send;
}

/**
 * Check if form was submitted
 */
async function checkFormSubmitted(
  customerId: string,
  triggerData: Record<string, any>
): Promise<boolean> {
  if (!triggerData.formId) {
    return false;
  }

  // Would check form submission tracking
  // For now, return false - requires form submission tracking system
  return false;
}

/**
 * Check if date trigger condition is met
 */
function checkDateTrigger(triggerData: Record<string, any>): boolean {
  if (!triggerData.date) {
    return false;
  }

  const triggerDate = new Date(triggerData.date);
  const now = new Date();

  // Trigger if current time is past the date
  return now >= triggerDate;
}

/**
 * Check webhook trigger condition
 */
function checkWebhookTrigger(
  eventData: Record<string, any>,
  triggerData: Record<string, any>
): boolean {
  if (!triggerData.condition) {
    return false;
  }

  // Simple condition matching for webhook events
  const condition = triggerData.condition as Record<string, any>;

  for (const [key, value] of Object.entries(condition)) {
    if (eventData[key] !== value) {
      return false;
    }
  }

  return true;
}

/**
 * Send automation email
 */
async function sendAutomationEmail(
  customerId: string,
  templateId: string,
  actionData: Record<string, any>
): Promise<boolean> {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { email: true, name: true },
    });

    if (!customer?.email) {
      return false;
    }

    // Trigger Inngest job to send email
    await inngest.send({
      name: 'campaign/automation.send_email',
      data: {
        customerId,
        email: customer.email,
        templateId,
        mergeData: {
          first_name: customer.name?.split(' ')[0] || '',
          last_name: customer.name?.split(' ')[1] || '',
        },
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to send automation email:', error);
    return false;
  }
}

/**
 * Send follow-up campaign
 */
async function sendFollowupCampaign(
  customerId: string,
  campaignId: string,
  actionData: Record<string, any>
): Promise<boolean> {
  try {
    if (!campaignId) {
      return false;
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { email: true },
    });

    if (!customer?.email) {
      return false;
    }

    // Create recipient in follow-up campaign
    await prisma.campaignRecipient.create({
      data: {
        campaignId,
        customerId,
        email: customer.email,
        mergeData: {},
      },
    });

    return true;
  } catch (error) {
    console.error('Failed to send follow-up campaign:', error);
    return false;
  }
}

/**
 * Add tag to customer
 */
async function addCustomerTag(customerId: string, tag: string): Promise<boolean> {
  try {
    // For now, tags not supported in Customer schema
    // In future: store as JSON array or separate tags table
    console.log(`[AutomationEngine] Tag action: add "${tag}" to customer ${customerId}`);
    return true;
  } catch (error) {
    console.error('Failed to add tag:', error);
    return false;
  }
}

/**
 * Update customer field value
 */
async function updateCustomerField(
  customerId: string,
  field: string,
  value: string
): Promise<boolean> {
  try {
    // Only allow updates to specific safe fields
    const allowedFields = ['company', 'name'];
    if (!allowedFields.includes(field)) {
      console.log(`[AutomationEngine] Field update: ${field} not allowed`);
      return false;
    }

    const updateData: Record<string, any> = {};
    updateData[field] = value;

    await prisma.customer.update({
      where: { id: customerId },
      data: updateData,
    });

    return true;
  } catch (error) {
    console.error('Failed to update customer field:', error);
    return false;
  }
}

/**
 * Update customer lead score
 */
async function updateLeadScore(
  customerId: string,
  points: number,
  reason: string
): Promise<boolean> {
  try {
    // Lead score not currently in Customer schema
    // Would require migration to add leadScore field
    console.log(`[AutomationEngine] Lead score action: +${points} for customer ${customerId} (${reason})`);
    return true;
  } catch (error) {
    console.error('Failed to update lead score:', error);
    return false;
  }
}

/**
 * Trigger external webhook
 */
async function triggerWebhook(
  webhookUrl: string,
  context: ActionContext
): Promise<boolean> {
  try {
    if (!webhookUrl.startsWith('http')) {
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('Failed to trigger webhook:', error);
    return false;
  }
}
