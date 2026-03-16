/**
 * Approval Notification Service
 * Sends approval request emails and reminders
 */

import { prisma } from '@/lib/prisma';
import { inngest } from '@/lib/inngest';

export interface ApprovalEmailData {
  approvalId: string;
  campaignId: string;
  campaignName: string;
  requestedBy: string;
  approverEmail: string;
  approverName: string;
  campaignSubject: string;
  campaignPreview: string;
  approvalLink: string;
}

/**
 * Send initial approval request email
 */
export async function sendApprovalRequest(approvalId: string): Promise<boolean> {
  try {
    const approval = await prisma.campaignApproval.findUnique({
      where: { id: approvalId },
    });

    if (!approval) {
      return false;
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: approval.campaignId },
    });

    if (!campaign) {
      return false;
    }

    const requester = await prisma.user.findUnique({
      where: { id: approval.requestedBy },
      select: { email: true, name: true },
    });

    // Get approver (team member or specified email)
    const approverEmail = approval.comments || 'approver@company.com'; // comments field used for approver email
    const approverName = approverEmail.split('@')[0];

    const approvalLink = `${process.env.NEXT_PUBLIC_APP_URL}/approvals/${approvalId}`;

    const emailData: ApprovalEmailData = {
      approvalId,
      campaignId: campaign.id,
      campaignName: campaign.name,
      requestedBy: requester?.name || requester?.email || 'Unknown User',
      approverEmail,
      approverName,
      campaignSubject: campaign.subject,
      campaignPreview: campaign.body?.substring(0, 100) || 'Campaign preview not available',
      approvalLink,
    };

    // Send email via Inngest
    await inngest.send({
      name: 'approval/request_email',
      data: emailData,
    });

    // Update notification timestamp
    await prisma.campaignApproval.update({
      where: { id: approvalId },
      data: { updatedAt: new Date() },
    });

    return true;
  } catch (error) {
    console.error('Failed to send approval request:', error);
    return false;
  }
}

/**
 * Send approval reminder email
 */
export async function sendApprovalReminder(approvalId: string): Promise<boolean> {
  try {
    const approval = await prisma.campaignApproval.findUnique({
      where: { id: approvalId },
    });

    if (!approval || approval.status !== 'pending') {
      return false;
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: approval.campaignId },
    });

    if (!campaign) {
      return false;
    }

    const approverEmail = approval.comments || 'approver@company.com';
    const approverName = approverEmail.split('@')[0];
    const approvalLink = `${process.env.NEXT_PUBLIC_APP_URL}/approvals/${approvalId}`;

    const emailData = {
      approvalId,
      campaignId: campaign.id,
      campaignName: campaign.name,
      approverEmail,
      approverName,
      campaignSubject: campaign.subject,
      approvalLink,
      reminder: true,
    };

    // Send reminder via Inngest
    await inngest.send({
      name: 'approval/reminder_email',
      data: emailData,
    });

    // Update reminder timestamp
    await prisma.campaignApproval.update({
      where: { id: approvalId },
      data: { updatedAt: new Date() },
    });

    return true;
  } catch (error) {
    console.error('Failed to send approval reminder:', error);
    return false;
  }
}

/**
 * Send approval status notification (approved/rejected)
 */
export async function sendApprovalStatusNotification(
  approvalId: string,
  status: 'approved' | 'rejected',
  approverEmail: string
): Promise<boolean> {
  try {
    const approval = await prisma.campaignApproval.findUnique({
      where: { id: approvalId },
    });

    if (!approval) {
      return false;
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: approval.campaignId },
    });

    const requester = await prisma.user.findUnique({
      where: { id: approval.requestedBy },
      select: { email: true, name: true },
    });

    if (!campaign || !requester?.email) {
      return false;
    }

    const emailData = {
      to: requester.email,
      campaignName: campaign.name,
      status,
      approverEmail,
      approvalComments: approval.comments,
    };

    // Send status notification
    await inngest.send({
      name: 'approval/status_email',
      data: emailData,
    });

    return true;
  } catch (error) {
    console.error('Failed to send approval status notification:', error);
    return false;
  }
}

/**
 * Get pending approvals for a user
 */
export async function getPendingApprovals(approverEmail: string) {
  try {
    const approvals = await prisma.campaignApproval.findMany({
      where: {
        status: 'pending',
        comments: approverEmail, // comments field stores approver email
      },
      include: {
        campaign: {
          select: { id: true, name: true, subject: true, body: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return approvals;
  } catch (error) {
    console.error('Failed to get pending approvals:', error);
    return [];
  }
}

/**
 * Check for approvals that need reminders
 */
export async function checkForPendingReminders(): Promise<string[]> {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Find approvals pending for over 1 hour
    const pendingApprovals = await prisma.campaignApproval.findMany({
      where: {
        status: 'pending',
        updatedAt: { lte: oneHourAgo },
      },
      select: { id: true },
    });

    return pendingApprovals.map((a) => a.id);
  } catch (error) {
    console.error('Failed to check for pending reminders:', error);
    return [];
  }
}

/**
 * Update approval status
 */
export async function updateApprovalStatus(
  approvalId: string,
  status: 'approved' | 'rejected',
  approverEmail: string,
  approverComments?: string
): Promise<boolean> {
  try {
    const approval = await prisma.campaignApproval.findUnique({
      where: { id: approvalId },
    });

    if (!approval) {
      return false;
    }

    // Update approval record
    await prisma.campaignApproval.update({
      where: { id: approvalId },
      data: {
        status,
        approvedBy: approverEmail,
        comments: approverComments || approval.comments,
        updatedAt: new Date(),
      },
    });

    // Send status notification to requester
    await sendApprovalStatusNotification(approvalId, status, approverEmail);

    // If approved, trigger campaign send
    if (status === 'approved') {
      await inngest.send({
        name: 'campaign/approved_send',
        data: { approvalId, campaignId: approval.campaignId },
      });
    }

    return true;
  } catch (error) {
    console.error('Failed to update approval status:', error);
    return false;
  }
}
