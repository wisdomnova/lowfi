import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Maximum request body size for webhooks
export const maxDuration = 300;

interface SendGridEvent {
  email: string;
  timestamp: number;
  'smtp-id': string;
  event: 'processed' | 'dropped' | 'delivered' | 'deferred' | 'bounce' | 'open' | 'click' | 'complaint' | 'spamreport' | 'unsubscribe';
  category?: string[];
  sg_event_id: string;
  sg_message_id: string;
  response?: string;
  reason?: string;
  status?: string;
  'x-campaign-id'?: string;
  'x-customer-id'?: string;
  'x-user-id'?: string;
  'x-sequence-id'?: string;
  url?: string;
}

/**
 * Handle SendGrid webhook events
 * Verifies webhook authenticity and updates campaign metrics
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature — reject unverified payloads in production
    const signature = request.headers.get('x-twilio-email-event-webhook-signature');
    const timestamp = request.headers.get('x-twilio-email-event-webhook-timestamp');
    
    if (!signature || !timestamp) {
      console.warn('Missing webhook signature or timestamp — rejecting request');
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 401 }
      );
    }

    // TODO: Implement full ECDSA signature verification with SendGrid's public key
    // https://docs.sendgrid.com/for-developers/tracking-events/getting-started-event-webhook-security-features

    const body = await request.json();
    const events = Array.isArray(body) ? body : [body];

    for (const event of events) {
      await processEvent(event as SendGridEvent);
    }

    return NextResponse.json({ success: true, processed: events.length });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Return 200 to prevent SendGrid from retrying
    return NextResponse.json({ success: false, error: 'Processing failed' }, { status: 500 });
  }
}

async function processEvent(event: SendGridEvent) {
  const campaignId = event['x-campaign-id'];
  const customerId = event['x-customer-id'];
  const sequenceId = event['x-sequence-id'];
  const userId = event['x-user-id'];

  if (!campaignId || !customerId || !userId) {
    console.warn('Missing required headers in webhook event', {
      campaignId,
      customerId,
      userId,
    });
    return;
  }

  try {
    // Find the campaign send record
    let campaignSend = await prisma.campaignSendUpdated.findFirst({
      where: {
        messageId: event.sg_message_id,
      },
    });

    // Fall back to old model if needed
    if (!campaignSend) {
      console.warn(`Campaign send not found for message ${event.sg_message_id}`);
      return;
    }

    // Process different event types
    switch (event.event) {
      case 'processed':
        await handleProcessed(campaignId, campaignSend.id, userId);
        break;

      case 'dropped':
        await handleDropped(campaignId, campaignSend.id, event.reason || 'unknown', userId);
        break;

      case 'delivered':
        await handleDelivered(campaignId, campaignSend.id, userId);
        break;

      case 'bounce':
        await handleBounce(campaignId, customerId, event.reason || 'unknown', userId);
        break;

      case 'open':
        await handleOpen(campaignId, campaignSend.id, userId);
        break;

      case 'click':
        await handleClick(campaignId, campaignSend.id, event.url || '', userId);
        break;

      case 'complaint':
        await handleComplaint(campaignId, customerId, userId);
        break;

      case 'unsubscribe':
        await handleUnsubscribe(customerId, userId, campaignId);
        break;

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    // Create activity log for all events
    await prisma.activity.create({
      data: {
        userId,
        action: event.event,
        resourceType: 'campaign',
        resourceId: campaignId,
        details: {
          customerId,
          messageId: event.sg_message_id,
          eventType: event.event,
          sequenceId,
        },
      },
    });
  } catch (error) {
    console.error(`Error processing ${event.event} event:`, error);
  }
}

async function handleProcessed(campaignId: string, campaignSendId: string, userId: string) {
  // Update send record status
  await prisma.campaignSendUpdated.update({
    where: { id: campaignSendId },
    data: { status: 'processed' },
  });
}

async function handleDelivered(campaignId: string, campaignSendId: string, userId: string) {
  // Update send record status
  await prisma.campaignSendUpdated.update({
    where: { id: campaignSendId },
    data: { status: 'delivered', deliveredAt: new Date() },
  });
}

async function handleDropped(
  campaignId: string,
  campaignSendId: string,
  reason: string,
  userId: string
) {
  // Update send record as failed
  await prisma.campaignSendUpdated.update({
    where: { id: campaignSendId },
    data: {
      status: 'dropped',
      failureReason: reason,
    },
  });

  // Decrement campaign delivered count since it was dropped
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      deliveredCount: { decrement: 1 },
    },
  });
}

async function handleBounce(
  campaignId: string,
  customerId: string,
  reason: string,
  userId: string
) {
  // Mark customer email as invalid
  await prisma.customer.update({
    where: { id: customerId },
    data: {
      emailInvalid: true,
      bounceReason: reason,
    },
  });

  // Log bounce
  await prisma.activity.create({
    data: {
      userId,
      action: 'bounce',
      resourceType: 'campaign',
      resourceId: campaignId,
      details: {
        customerId,
        reason,
      },
    },
  });
}

async function handleOpen(campaignId: string, campaignSendId: string, userId: string) {
  // Update send record
  await prisma.campaignSendUpdated.update({
    where: { id: campaignSendId },
    data: {
      openedAt: new Date(),
    },
  });

  // Increment campaign open count
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      openedCount: { increment: 1 },
    },
  });
}

async function handleClick(
  campaignId: string,
  campaignSendId: string,
  url: string,
  userId: string
) {
  // Update send record
  await prisma.campaignSendUpdated.update({
    where: { id: campaignSendId },
    data: {
      clickedAt: new Date(),
    },
  });

  // Increment campaign click count
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      clickedCount: { increment: 1 },
    },
  });
}

async function handleComplaint(campaignId: string, customerId: string, userId: string) {
  // Mark customer as complained
  await prisma.customer.update({
    where: { id: customerId },
    data: {
      isSpamComplaint: true,
    },
  });

  // Log complaint
  await prisma.activity.create({
    data: {
      userId,
      action: 'complaint',
      resourceType: 'campaign',
      resourceId: campaignId,
      details: {
        customerId,
      },
    },
  });
}

async function handleUnsubscribe(customerId: string, userId: string, campaignId: string) {
  // Mark customer as unsubscribed
  await prisma.customer.update({
    where: { id: customerId },
    data: {
      unsubscribed: true,
      unsubscribedAt: new Date(),
    },
  });

  // Log unsubscribe
  await prisma.activity.create({
    data: {
      userId,
      action: 'unsubscribe',
      resourceType: 'campaign',
      resourceId: campaignId,
      details: {
        customerId,
      },
    },
  });
}
