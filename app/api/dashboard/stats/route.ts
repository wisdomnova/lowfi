import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const user_id = await verifyAuth(req);
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization' },
        { status: 401 }
      );
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: user_id },
      include: { company: true },
    });

    if (!user || !user.company) {
      return NextResponse.json(
        { error: 'User or company not found' },
        { status: 404 }
      );
    }

    // Count invoices for this user
    const invoiceCount = await prisma.invoice.count({
      where: { userId: user_id },
    });

    // Count follow-ups for this user
    const followUpCount = await prisma.followUp.count({
      where: { userId: user_id },
    });

    // Count tickets for this user
    const ticketCount = await prisma.ticket.count({
      where: { userId: user_id },
    });

    // Count campaigns for this user
    const campaignCount = await prisma.campaign.count({
      where: { userId: user_id },
    });

    return NextResponse.json({
      invoices: invoiceCount,
      followups: followUpCount,
      tickets: ticketCount,
      campaigns: campaignCount,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
