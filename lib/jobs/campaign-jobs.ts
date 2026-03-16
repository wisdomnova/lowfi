import { inngest } from '@/lib/inngest';
import { sendEmail } from '@/lib/email-service';
import { prisma } from '@/lib/prisma';

export const sendCampaignJob = inngest.createFunction(
  {
    id: 'send-campaign',
    name: 'Send Campaign',
  },
  { event: 'campaign/send' },
  async ({ event, step }) => {
    const { campaignId, customerId, userId } = event.data;

    // Step 1: Fetch campaign with sequences
    const campaign = await step.run('fetch-campaign', async () => {
      return prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          sequences: { where: { enabled: true }, orderBy: { sequenceNumber: 'asc' } },
        },
      });
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    // Step 2: Fetch customer email
    const customer = await step.run('fetch-customer', async () => {
      return prisma.customer.findUnique({
        where: { id: customerId },
        select: { email: true, name: true },
      });
    });

    if (!customer?.email) {
      throw new Error(`Customer ${customerId} has no email`);
    }

    // Step 3: Send initial campaign email
    const sendResult = await step.run('send-initial-email', async () => {
      return sendEmail({
        to: customer.email,
        subject: campaign.subject,
        body: campaign.body,
        trackingId: campaignId,
        customHeaders: {
          'X-Customer-Id': customerId,
          'X-User-Id': userId,
        },
      });
    });

    if (!sendResult.success) {
      // Log failure but don't throw - this is handled separately
      await step.run('log-send-failure', async () => {
        console.error(`Failed to send campaign email:`, sendResult.error);
        
        // Create activity log
        await prisma.activity.create({
          data: {
            userId,
            action: 'send',
            resourceType: 'campaign',
            resourceId: campaignId,
            details: {
              customerId,
              error: sendResult.error,
              type: 'send_failed',
            },
          },
        });
      });

      return {
        success: false,
        error: sendResult.error,
        messageId: null,
      };
    }

    // Step 4: Update campaign metrics
    await step.run('update-campaign-metrics', async () => {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          sentCount: { increment: 1 },
          deliveredCount: { increment: 1 }, // Initially assume delivered
        },
      });
    });

    // Step 5: Create campaign send record
    const campaignSend = await step.run('create-campaign-send', async () => {
      return prisma.campaignSendUpdated.create({
        data: {
          campaignId,
          customerId,
          sentAt: new Date(),
          messageId: sendResult.messageId || '',
          status: 'sent',
        },
      });
    });

    // Step 6: Schedule follow-up emails if it's a sequence campaign
    if (campaign.isSequence && campaign.sequences.length > 0) {
      for (const sequence of campaign.sequences) {
        const delayMs = sequence.delayDays * 24 * 60 * 60 * 1000;
        
        await step.sendEvent('schedule-sequence-email', {
          name: 'campaign/send-sequence',
          data: {
            campaignId,
            sequenceId: sequence.id,
            customerId,
            userId,
            parentSendId: campaignSend.id,
          },
          ts: Date.now() + delayMs,
        });
      }
    }

    // Step 7: Log success
    await step.run('log-success', async () => {
      await prisma.activity.create({
        data: {
          userId,
          action: 'send',
          resourceType: 'campaign',
          resourceId: campaignId,
          details: {
            customerId,
            messageId: sendResult.messageId,
            campaignName: campaign.name,
          },
        },
      });
    });

    return {
      success: true,
      campaignId,
      customerId,
      messageId: sendResult.messageId,
      sequenceCount: campaign.sequences.length,
    };
  }
);

export const sendSequenceEmailJob = inngest.createFunction(
  {
    id: 'send-sequence-email',
    name: 'Send Sequence Email',
  },
  { event: 'campaign/send-sequence' },
  async ({ event, step }) => {
    const { campaignId, sequenceId, customerId, userId, parentSendId } = event.data;

    // Fetch sequence
    const sequence = await step.run('fetch-sequence', async () => {
      return prisma.campaignSequence.findUnique({
        where: { id: sequenceId },
      });
    });

    if (!sequence) {
      throw new Error(`Sequence ${sequenceId} not found`);
    }

    // Fetch customer
    const customer = await step.run('fetch-customer', async () => {
      return prisma.customer.findUnique({
        where: { id: customerId },
        select: { email: true },
      });
    });

    if (!customer?.email) {
      return { success: false, error: 'Customer email not found' };
    }

    // Check if recipient has replied (optional: don't send if they replied)
    const hasReplied = await step.run('check-reply-status', async () => {
      // This would be implementation-specific
      // For now, just return false
      return false;
    });

    if (hasReplied) {
      await step.run('log-skip', async () => {
        await prisma.activity.create({
          data: {
            userId,
            action: 'skip',
            resourceType: 'campaign',
            resourceId: campaignId,
            details: {
              sequenceId,
              customerId,
              reason: 'recipient_replied',
            },
          },
        });
      });

      return { success: false, reason: 'recipient_replied' };
    }

    // Send sequence email
    const sendResult = await step.run('send-sequence-email', async () => {
      return sendEmail({
        to: customer.email,
        subject: sequence.subject,
        body: sequence.body,
        trackingId: campaignId,
        customHeaders: {
          'X-Campaign-Id': campaignId,
          'X-Sequence-Id': sequenceId,
          'X-Customer-Id': customerId,
          'X-User-Id': userId,
        },
      });
    });

    if (!sendResult.success) {
      return { success: false, error: sendResult.error };
    }

    // Update campaign metrics
    await step.run('update-metrics', async () => {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          sentCount: { increment: 1 },
          deliveredCount: { increment: 1 },
        },
      });
    });

    // Create campaign send record
    await step.run('create-send-record', async () => {
      await prisma.campaignSendUpdated.create({
        data: {
          campaignId,
          sequenceId,
          customerId,
          sentAt: new Date(),
          messageId: sendResult.messageId || '',
          status: 'sent',
        },
      });
    });

    return {
      success: true,
      campaignId,
      sequenceId,
      customerId,
      messageId: sendResult.messageId,
    };
  }
);
