import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const isSequence = url.searchParams.get('isSequence') === 'true';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const where: any = { userId };
    if (status) where.status = status;
    if (isSequence !== undefined) where.isSequence = isSequence;

    const total = await prisma.campaign.count({ where });
    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        sequences: { orderBy: { sequenceNumber: 'asc' } },
        _count: { select: { sends: true } },
      },
    });

    return NextResponse.json({
      data: campaigns,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET campaigns error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, subject, body: campaignBody, isSequence, sequenceType } = body;

    if (!name || !subject || !campaignBody) {
      return NextResponse.json(
        { error: 'Missing required fields: name, subject, body' },
        { status: 400 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        userId,
        name,
        subject,
        body: campaignBody,
        isSequence: isSequence || false,
        sequenceType: isSequence ? sequenceType || 'sequential' : null,
        status: 'draft',
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
        action: 'create',
        resourceType: 'campaign',
        resourceId: campaign.id,
        details: { name, subject },
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error('POST campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
