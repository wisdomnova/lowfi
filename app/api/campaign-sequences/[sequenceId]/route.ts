import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

// GET list of sequences for a campaign
// PUT to update a sequence
// DELETE to remove a sequence
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ sequenceId: string }> }
) {
  try {
    const { sequenceId } = await params;
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership by checking campaign
    const sequence = await prisma.campaignSequence.findUnique({
      where: { id: sequenceId },
      include: { campaign: true },
    });

    if (!sequence || sequence.campaign.userId !== userId) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { subject, body: seqBody, delayDays, enabled, sequenceNumber } = body;

    const updated = await prisma.campaignSequence.update({
      where: { id: sequenceId },
      data: {
        ...(subject && { subject }),
        ...(seqBody && { body: seqBody }),
        ...(typeof delayDays === 'number' && { delayDays }),
        ...(typeof enabled === 'boolean' && { enabled }),
        ...(typeof sequenceNumber === 'number' && { sequenceNumber }),
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId,
        action: 'update',
        resourceType: 'campaign_sequence',
        resourceId: updated.id,
        details: body,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT sequence error:', error);
    return NextResponse.json(
      { error: 'Failed to update sequence' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ sequenceId: string }> }
) {
  try {
    const { sequenceId } = await params;
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sequence = await prisma.campaignSequence.findUnique({
      where: { id: sequenceId },
      include: { campaign: true },
    });

    if (!sequence || sequence.campaign.userId !== userId) {
      return NextResponse.json(
        { error: 'Sequence not found' },
        { status: 404 }
      );
    }

    await prisma.campaignSequence.delete({
      where: { id: sequenceId },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId,
        action: 'delete',
        resourceType: 'campaign_sequence',
        resourceId: sequenceId,
        details: { campaignId: sequence.campaignId },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE sequence error:', error);
    return NextResponse.json(
      { error: 'Failed to delete sequence' },
      { status: 500 }
    );
  }
}
