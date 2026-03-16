import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { hasFeature } from '@/lib/plan-features';
import { triggerScheduledSend } from '@/lib/automation-tracking';
import { inngest } from '@/lib/inngest';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const schedule = await prisma.campaignSchedule.findUnique({
      where: { campaignId: id },
    });

    return NextResponse.json(schedule || {});
  } catch (error) {
    console.error('Get schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { sendTime, timezone, recurring, recurringEnd, optimizeSendTime } = await req.json();

    // Check plan features
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const plan = subscription?.plan || 'starter';

    if (!hasFeature(plan as any, 'advancedScheduling')) {
      return NextResponse.json(
        {
          error: 'Advanced scheduling is not available on your plan',
        },
        { status: 403 }
      );
    }

    if (recurring && !hasFeature(plan as any, 'recurringCampaigns')) {
      return NextResponse.json(
        {
          error: 'Recurring campaigns are not available on your plan',
        },
        { status: 403 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const schedule = await prisma.campaignSchedule.upsert({
      where: { campaignId: id },
      create: {
        campaignId: id,
        sendTime: new Date(sendTime),
        timezone: timezone || 'UTC',
        recurring: recurring || null,
        recurringEnd: recurringEnd ? new Date(recurringEnd) : null,
        optimizeSendTime: optimizeSendTime || false,
      },
      update: {
        sendTime: new Date(sendTime),
        timezone: timezone || 'UTC',
        recurring: recurring || null,
        recurringEnd: recurringEnd ? new Date(recurringEnd) : null,
        optimizeSendTime: optimizeSendTime || false,
      },
    });

    // Trigger Inngest job to monitor this schedule
    await inngest.send({
      name: 'campaign/schedule.created',
      data: {
        campaignId: id,
        scheduleId: schedule.id,
        sendTime: schedule.sendTime.toISOString(),
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Create schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    await prisma.campaignSchedule.deleteMany({
      where: { campaignId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete schedule error:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}
