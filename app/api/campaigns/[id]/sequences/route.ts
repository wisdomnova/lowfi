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
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const sequences = await prisma.campaignSequence.findMany({
      where: { campaignId: id },
      orderBy: { sequenceNumber: 'asc' },
    });

    return NextResponse.json(sequences);
  } catch (error) {
    console.error('GET sequences error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sequences' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    if (!campaign.isSequence) {
      return NextResponse.json(
        { error: 'Campaign is not a sequence type' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { subject, body: sequenceBody, delayDays } = body;

    if (!subject || !sequenceBody) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, body' },
        { status: 400 }
      );
    }

    // Get max sequence number
    const lastSequence = await prisma.campaignSequence.findFirst({
      where: { campaignId: id },
      orderBy: { sequenceNumber: 'desc' },
    });

    const sequenceNumber = (lastSequence?.sequenceNumber || 0) + 1;

    const sequence = await prisma.campaignSequence.create({
      data: {
        campaignId: id,
        sequenceNumber,
        subject,
        body: sequenceBody,
        delayDays: delayDays || 0,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId,
        action: 'create',
        resourceType: 'campaign_sequence',
        resourceId: sequence.id,
        details: { campaignId: id, sequenceNumber },
      },
    });

    return NextResponse.json(sequence, { status: 201 });
  } catch (error) {
    console.error('POST sequence error:', error);
    return NextResponse.json(
      { error: 'Failed to create sequence' },
      { status: 500 }
    );
  }
}
