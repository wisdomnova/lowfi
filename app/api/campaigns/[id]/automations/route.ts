import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { hasFeature } from '@/lib/plan-features';
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

    const automations = await prisma.campaignAutomation.findMany({
      where: { campaignId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(automations);
  } catch (error) {
    console.error('Get automations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch automations' },
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
    const { name, description, trigger, action, triggerData, actionData } =
      await req.json();

    // Check plan features
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const plan = subscription?.plan || 'starter';

    if (!hasFeature(plan as any, 'campaignAutomation')) {
      return NextResponse.json(
        { error: 'Campaign automation is not available on your plan' },
        { status: 403 }
      );
    }

    // Check specific automation trigger types
    if (
      trigger === 'webhook' &&
      !hasFeature(plan as any, 'triggerBasedCampaigns')
    ) {
      return NextResponse.json(
        { error: 'Webhook triggers are not available on your plan' },
        { status: 403 }
      );
    }

    if (
      action === 'leadScore' &&
      !hasFeature(plan as any, 'leadScoring')
    ) {
      return NextResponse.json(
        { error: 'Lead scoring is not available on your plan' },
        { status: 403 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const automation = await prisma.campaignAutomation.create({
      data: {
        campaignId: id,
        userId,
        name,
        description: description || undefined,
        trigger,
        action,
        triggerData: triggerData || {},
        actionData: actionData || {},
        enabled: true,
      },
    });

    // Trigger Inngest job to monitor this automation
    await inngest.send({
      name: 'campaign/automation.created',
      data: {
        campaignId: id,
        automationId: automation.id,
        trigger,
        action,
      },
    });

    return NextResponse.json(automation, { status: 201 });
  } catch (error) {
    console.error('Create automation error:', error);
    return NextResponse.json(
      { error: 'Failed to create automation' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { automationId, ...updateData } = await req.json();

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const automation = await prisma.campaignAutomation.findUnique({
      where: { id: automationId },
    });

    if (!automation || automation.campaignId !== id) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    const updated = await prisma.campaignAutomation.update({
      where: { id: automationId },
      data: {
        ...updateData,
        triggerData: updateData.triggerData
          ? updateData.triggerData
          : automation.triggerData,
        actionData: updateData.actionData
          ? updateData.actionData
          : automation.actionData,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update automation error:', error);
    return NextResponse.json(
      { error: 'Failed to update automation' },
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
    const { automationId } = await req.json();

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const automation = await prisma.campaignAutomation.findUnique({
      where: { id: automationId },
    });

    if (!automation || automation.campaignId !== id) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    await prisma.campaignAutomation.delete({
      where: { id: automationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete automation error:', error);
    return NextResponse.json(
      { error: 'Failed to delete automation' },
      { status: 500 }
    );
  }
}
