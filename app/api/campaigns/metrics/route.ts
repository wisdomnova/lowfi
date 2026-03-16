import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all campaigns for the user
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
    });

    // Calculate metrics
    const totalCampaigns = campaigns.length;
    const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
    const totalOpened = campaigns.reduce((sum, c) => sum + c.openedCount, 0);
    const totalClicked = campaigns.reduce((sum, c) => sum + c.clickedCount, 0);
    const totalReplied = campaigns.reduce((sum, c) => sum + c.repliedCount, 0);

    // Calculate average rates
    const averageOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const averageClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;

    // Get top campaigns (by open rate)
    const topCampaigns = campaigns
      .filter((c) => c.sentCount > 0)
      .sort((a, b) => {
        const rateA = a.openedCount / a.sentCount;
        const rateB = b.openedCount / b.sentCount;
        return rateB - rateA;
      })
      .slice(0, 5)
      .map((campaign) => ({
        id: campaign.id,
        name: campaign.name,
        sentCount: campaign.sentCount,
        openedCount: campaign.openedCount,
        clickedCount: campaign.clickedCount,
      }));

    return NextResponse.json({
      totalCampaigns,
      totalSent,
      totalOpened,
      totalClicked,
      totalReplied,
      averageOpenRate,
      averageClickRate,
      topCampaigns,
    });
  } catch (error) {
    console.error('Campaign metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign metrics' },
      { status: 500 }
    );
  }
}
