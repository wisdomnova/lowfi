/**
 * Campaign Approval Workflow Service
 * TODO: Implement proper approval workflow with schema alignment
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ApprovalRequest {
  campaignId: string;
  requestedBy: string;
  comments?: string;
}

/**
 * Request approval for a campaign
 */
export async function requestApproval(request: ApprovalRequest) {
  const { campaignId, requestedBy, comments } = request;

  const approval = await prisma.campaignApproval.create({
    data: {
      campaignId,
      requestedBy,
      status: 'pending',
      comments,
    },
  });

  // TODO: Send notification to approver
  return approval;
}

/**
 * Approve a campaign
 */
export async function approveCampaign(approvalId: string, approverUserId: string, comments?: string) {
  const approval = await prisma.campaignApproval.findUnique({
    where: { id: approvalId },
  });

  if (!approval) {
    throw new Error('Approval request not found');
  }

  if (approval.status !== 'pending') {
    throw new Error('Approval request is no longer pending');
  }

  await prisma.campaignApproval.update({
    where: { id: approvalId },
    data: {
      status: 'approved',
      approvedBy: approverUserId,
      comments: comments || approval.comments,
    },
  });

  // TODO: Trigger campaign send
  return { success: true };
}

/**
 * Reject a campaign
 */
export async function rejectCampaign(approvalId: string, approverUserId: string, reason: string) {
  const approval = await prisma.campaignApproval.findUnique({
    where: { id: approvalId },
  });

  if (!approval) {
    throw new Error('Approval request not found');
  }

  if (approval.status !== 'pending') {
    throw new Error('Approval request is no longer pending');
  }

  await prisma.campaignApproval.update({
    where: { id: approvalId },
    data: {
      status: 'rejected',
      approvedBy: approverUserId,
      comments: reason,
    },
  });

  return { success: true };
}

/**
 * Get pending approvals
 */
export async function getPendingApprovals() {
  return prisma.campaignApproval.findMany({
    where: {
      status: 'pending',
    },
    include: {
      campaign: true,
    },
  });
}

/**
 * Get approval history for a campaign
 */
export async function getApprovalHistory(campaignId: string) {
  return prisma.campaignApproval.findMany({
    where: {
      campaignId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
