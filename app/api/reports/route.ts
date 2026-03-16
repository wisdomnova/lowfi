import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

/**
 * GET /api/reports
 * Retrieve analytics and reports for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'summary'; // summary, invoices, followups, tickets

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        invoices: true,
        followUps: true,
        tickets: true,
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build response based on type
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const invoices = user.invoices || [];
    const followUps = user.followUps || [];
    const tickets = user.tickets || [];

    const summary = {
      user: {
        name: user.name,
        email: user.email,
      },
      subscription: user.subscription || null,
      metrics: {
        totalInvoices: invoices.length,
        totalFollowUps: followUps.length,
        totalTickets: tickets.length,
        invoicesLast30Days: invoices.filter(
          (i) => new Date(i.createdAt) > thirtyDaysAgo
        ).length,
        followUpsLast30Days: followUps.filter(
          (f) => new Date(f.createdAt) > thirtyDaysAgo
        ).length,
        ticketsLast30Days: tickets.filter(
          (t) => new Date(t.createdAt) > thirtyDaysAgo
        ).length,
      },
      invoiceStatus: {
        pending: invoices.filter((i) => i.status === 'pending').length,
        reviewed: invoices.filter((i) => i.status === 'reviewed').length,
        approved: invoices.filter((i) => i.status === 'approved').length,
      },
      followUpStatus: {
        draft: followUps.filter((f) => f.status === 'draft').length,
        sent: followUps.filter((f) => f.status === 'sent').length,
        replied: followUps.filter((f) => f.status === 'replied').length,
      },
      ticketStatus: {
        open: tickets.filter((t) => t.status === 'open').length,
        inProgress: tickets.filter((t) => t.status === 'in_progress').length,
        resolved: tickets.filter((t) => t.status === 'resolved').length,
      },
    };

    if (type === 'summary') {
      return NextResponse.json(summary);
    } else if (type === 'invoices') {
      return NextResponse.json({
        ...summary,
        details: invoices,
      });
    } else if (type === 'followups') {
      return NextResponse.json({
        ...summary,
        details: followUps,
      });
    } else if (type === 'tickets') {
      return NextResponse.json({
        ...summary,
        details: tickets,
      });
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
