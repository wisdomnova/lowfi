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

    // Count invoices, follow-ups, and tickets
    const invoiceCount = await prisma.invoice.count({
      where: { userId: user_id },
    });

    const followUpCount = await prisma.followUp.count({
      where: { userId: user_id },
    });

    const ticketCount = await prisma.ticket.count({
      where: { userId: user_id },
    });

    const campaignCount = await prisma.campaign.count({
      where: { userId: user_id },
    });

    // Generate CSV content
    const timestamp = new Date().toISOString();
    const csvContent = [
      ['Dashboard Export', timestamp],
      [],
      ['Metric', 'Count', 'Status'],
      ['Total Invoices', invoiceCount.toString(), invoiceCount > 0 ? 'Active' : 'None'],
      ['Active Follow-ups', followUpCount.toString(), followUpCount > 0 ? 'Active' : 'None'],
      ['Support Tickets', ticketCount.toString(), ticketCount > 0 ? 'Open' : 'None'],
      ['Live Campaigns', campaignCount.toString(), campaignCount > 0 ? 'Active' : 'None'],
      [],
      ['Total Active Items', (invoiceCount + followUpCount + ticketCount + campaignCount).toString(), 'Summary'],
      ['Export Date', timestamp, 'Timestamp'],
      ['Company', user.company.name || 'N/A', 'Account Info'],
    ]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Return CSV as file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="dashboard-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
