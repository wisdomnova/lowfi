import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { inngest } from '@/lib/inngest';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const { id, action } = await params;
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    let updatedStatus = campaign.status;
    let updateData: any = {};

    switch (action) {
      case 'send':
        if (campaign.status !== 'draft' && campaign.status !== 'paused') {
          return NextResponse.json(
            { error: 'Campaign must be in draft or paused status to send' },
            { status: 400 }
          );
        }
        updatedStatus = 'sending';
        updateData = { status: 'sending' };
        
        // Queue campaign sending job
        try {
          // Fetch all customers to send to
          const customers = await prisma.customer.findMany({
            where: {
              userId,
              unsubscribed: false,
              emailInvalid: false,
            },
            select: { id: true, email: true },
          });

          // Queue send job for each customer
          for (const customer of customers) {
            await inngest.send({
              name: 'campaign/send',
              data: {
                campaignId: id,
                customerId: customer.id,
                userId,
              },
            });
          }

          console.log(`Queued ${customers.length} campaign sends for campaign ${id}`);

          // Log activity
          await prisma.activity.create({
            data: {
              userId,
              action: 'send',
              resourceType: 'campaign',
              resourceId: id,
              details: {
                recipientCount: customers.length,
              },
            },
          });
        } catch (queueError) {
          console.error('Failed to queue campaign sends:', queueError);
          return NextResponse.json(
            { error: 'Failed to queue campaign for sending' },
            { status: 500 }
          );
        }
        break;

      case 'schedule':
        const { scheduledAt } = body;
        if (!scheduledAt) {
          return NextResponse.json(
            { error: 'scheduledAt is required' },
            { status: 400 }
          );
        }
        updatedStatus = 'scheduled';
        updateData = { status: 'scheduled', scheduledAt: new Date(scheduledAt) };
        break;

      case 'pause':
        if (campaign.status !== 'sending' && campaign.status !== 'scheduled') {
          return NextResponse.json(
            { error: 'Campaign must be sending or scheduled to pause' },
            { status: 400 }
          );
        }
        updatedStatus = 'paused';
        updateData = { status: 'paused', pausedAt: new Date() };
        break;

      case 'resume':
        if (campaign.status !== 'paused') {
          return NextResponse.json(
            { error: 'Campaign must be paused to resume' },
            { status: 400 }
          );
        }
        updatedStatus = 'sending';
        updateData = { status: 'sending', pausedAt: null };
        break;

      case 'stop':
        updatedStatus = 'stopped';
        updateData = { status: 'stopped', stoppedAt: new Date() };
        break;

      case 'complete':
        updatedStatus = 'completed';
        updateData = { status: 'completed' };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        sequences: true,
        _count: { select: { sends: true } },
      },
    });

    // Log status change
    await prisma.campaignStatusHistory.create({
      data: {
        campaignId: id,
        status: updatedStatus,
        userId,
        reason: `Campaign ${action} action`,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId,
        action: action,
        resourceType: 'campaign',
        resourceId: id,
        details: { previousStatus: campaign.status, newStatus: updatedStatus },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Campaign action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform campaign action' },
      { status: 500 }
    );
  }
}
