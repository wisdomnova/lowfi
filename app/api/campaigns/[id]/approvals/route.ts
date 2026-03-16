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

    const approvals = await prisma.campaignApproval.findMany({
      where: { campaignId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(approvals);
  } catch (error) {
    console.error('Get approvals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch approvals' },
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
    const { approverId, notes } = await req.json();

    // Check plan features
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const plan = subscription?.plan || 'starter';

    if (!hasFeature(plan as any, 'approvalWorkflows')) {
      return NextResponse.json(
        { error: 'Approval workflows are not available on your plan' },
        { status: 403 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Check that approver is a team member of the user's company
    const company = await prisma.company.findUnique({
      where: { ownerId: userId },
    });

    if (!company) {
      return NextResponse.json(
        { error: 'You must have a company to use approval workflows' },
        { status: 400 }
      );
    }

    const approverMember = await prisma.teamMember.findFirst({
      where: { id: approverId, companyId: company.id },
    });

    if (!approverMember) {
      return NextResponse.json(
        { error: 'Approver is not a valid team member' },
        { status: 400 }
      );
    }

    // Create approval request
    const approval = await prisma.campaignApproval.create({
      data: {
        campaignId: id,
        requestedBy: userId,
        approvedBy: null,
        status: 'pending',
        comments: notes || null,
      },
    });

    // Trigger Inngest job to send approval notification
    await inngest.send({
      name: 'campaign/approval.requested',
      data: {
        approvalId: approval.id,
        campaignId: id,
        requestedBy: userId,
      },
    });

    return NextResponse.json(approval, { status: 201 });
  } catch (error) {
    console.error('Create approval error:', error);
    return NextResponse.json(
      { error: 'Failed to create approval request' },
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
    const { approvalId, status, feedback } = await req.json();

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Allow campaign owner or team members of the owner's company
    if (campaign.userId !== userId) {
      const ownerCompany = await prisma.company.findUnique({
        where: { ownerId: campaign.userId },
      });
      
      const isMember = ownerCompany ? await prisma.teamMember.findFirst({
        where: { companyId: ownerCompany.id, userId },
      }) : null;

      if (!isMember) {
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }
    }

    const approval = await prisma.campaignApproval.findUnique({
      where: { id: approvalId },
    });

    if (!approval || approval.campaignId !== id) {
      return NextResponse.json({ error: 'Approval not found' }, { status: 404 });
    }

    // The campaign owner check above ensures only someone associated with the campaign can access this.
    // But the person approving should NOT be the one who requested the approval.
    if (approval.requestedBy === userId) {
      return NextResponse.json(
        { error: 'You cannot approve your own request' },
        { status: 403 }
      );
    }

    const validStatuses = ['approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const updated = await prisma.campaignApproval.update({
      where: { id: approvalId },
      data: {
        status,
        comments: feedback || null,
        approvedBy: status === 'approved' ? userId : null,
      },
    });

    // TODO: Send approval response notification to requester

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update approval error:', error);
    return NextResponse.json(
      { error: 'Failed to update approval' },
      { status: 500 }
    );
  }
}
