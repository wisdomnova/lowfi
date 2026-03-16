import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        sequences: { orderBy: { sequenceNumber: 'asc' } },
        sends: { orderBy: { createdAt: 'desc' }, take: 50 },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('GET campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
    const { name, subject, body: campaignBody, isSequence, sequenceType, scheduledAt } = body;

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(subject && { subject }),
        ...(campaignBody && { body: campaignBody }),
        ...(typeof isSequence === 'boolean' && { isSequence }),
        ...(sequenceType && { sequenceType }),
        ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
      },
      include: {
        sequences: true,
        _count: { select: { sends: true } },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId,
        action: 'update',
        resourceType: 'campaign',
        resourceId: campaign.id,
        details: body,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    await prisma.campaign.delete({
      where: { id },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId,
        action: 'delete',
        resourceType: 'campaign',
        resourceId: id,
        details: { name: campaign.name },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}
