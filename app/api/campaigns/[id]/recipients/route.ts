import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { getPlanFeatures } from '@/lib/plan-features';

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
    const { searchParams } = new URL(req.url);
    const segment = searchParams.get('segment');
    const status = searchParams.get('status');

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const where: any = { campaignId: id };
    if (segment) where.segment = segment;
    if (status) where.status = status;

    const recipients = await prisma.campaignRecipient.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const total = await prisma.campaignRecipient.count({ where });

    return NextResponse.json({
      recipients,
      total,
      segments: await prisma.campaignRecipient.findMany({
        where: { campaignId: id, segment: { not: null } },
        distinct: ['segment'],
        select: { segment: true },
      }),
    });
  } catch (error) {
    console.error('Get recipients error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipients' },
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
    const { recipients, segment } = await req.json();

    // Get user's subscription plan
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const plan = subscription?.plan || 'starter';
    const features = getPlanFeatures(plan as any);

    // Check if user can add recipients
    if (!features.recipientManagement) {
      return NextResponse.json(
        { error: 'Recipient management not available on your plan' },
        { status: 403 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Get user's company for team-wide DNC and collision checks
    const userWithCompany = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!userWithCompany?.company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 });
    }

    const companyId = userWithCompany.company.id;

    // 1. Filter out Global Blacklist (DNC) emails
    const blacklistedEmails = await prisma.globalBlacklist.findMany({
      where: {
        companyId,
        email: { in: recipients.map((r: any) => r.email.toLowerCase()) },
      },
      select: { email: true },
    });

    const blacklistedSet = new Set(blacklistedEmails.map(b => b.email.toLowerCase()));

    // 2. Check for Team Collision (email already in another campaign for this company)
    // First, get all users in the same company
    const companyUsers = await prisma.teamMember.findMany({
      where: { companyId },
      select: { userId: true },
    });

    const userIds = companyUsers.map(u => u.userId);

    const existingCollisions = await prisma.campaignRecipient.findMany({
      where: {
        campaign: { userId: { in: userIds } },
        campaignId: { not: id }, // Exclude current campaign
        email: { in: recipients.map((r: any) => r.email.toLowerCase()) },
      },
      select: { email: true, campaign: { select: { name: true } } },
    });

    const collisionSet = new Set(existingCollisions.map(c => c.email.toLowerCase()));

    // Filter recipients: 
    // - Always skip blacklisted
    // - Optionally keep collisions but we'll flag them in the response
    const finalRecipients = recipients.filter((r: any) => !blacklistedSet.has(r.email.toLowerCase()));
    
    // Check recipient limit
    const existingCount = await prisma.campaignRecipient.count({
      where: { campaignId: id },
    });

    if (existingCount + finalRecipients.length > features.maxRecipients) {
      return NextResponse.json(
        {
          error: `Recipient limit exceeded. Your plan allows ${features.maxRecipients} recipients total.`,
        },
        { status: 400 }
      );
    }

    // Bulk create recipients
    const created = await prisma.campaignRecipient.createMany({
      data: finalRecipients.map((r: any) => ({
        campaignId: id,
        customerId: r.customerId || '',
        email: r.email,
        mergeData: r.mergeData || {},
        segment: segment || null,
        status: 'pending',
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      success: true,
      created: created.count,
      skippedBlacklisted: blacklistedSet.size,
      collisionsDetected: collisionSet.size,
      collisions: existingCollisions.slice(0, 10), // Send a sample of collisions
    });
  } catch (error) {
    console.error('Add recipients error:', error);
    return NextResponse.json(
      { error: 'Failed to add recipients' },
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
    const { recipientIds } = await req.json();

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const deleted = await prisma.campaignRecipient.deleteMany({
      where: {
        campaignId: id,
        id: { in: recipientIds },
      },
    });

    return NextResponse.json({
      success: true,
      deleted: deleted.count,
    });
  } catch (error) {
    console.error('Delete recipients error:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipients' },
      { status: 500 }
    );
  }
}
