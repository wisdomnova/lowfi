import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { hasFeature } from '@/lib/plan-features';

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
    const { startDate, endDate, breakdown } = Object.fromEntries(
      new URL(req.url).searchParams.entries()
    );

    // Check plan features
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const plan = subscription?.plan || 'starter';

    if (!hasFeature(plan as any, 'advancedAnalytics')) {
      return NextResponse.json(
        { error: 'Advanced analytics not available on your plan' },
        { status: 403 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Parse date range
    const start = startDate ? new Date(startDate) : new Date(campaign.createdAt);
    const end = endDate ? new Date(endDate) : new Date();

    // Fetch metrics
    const metrics = await prisma.campaignAnalytics.findMany({
      where: {
        campaignId: id,
      },
      orderBy: { dateGenerated: 'asc' },
    });

    // Filter by date range if provided
    const filteredMetrics = metrics.filter((m) => {
      if (!startDate && !endDate) return true;
      const mDate = m.dateGenerated.getTime();
      if (startDate && mDate < start.getTime()) return false;
      if (endDate && mDate > end.getTime()) return false;
      return true;
    });

    // Aggregate summary
    const summary = {
      sent: filteredMetrics.reduce((sum, m) => sum + m.totalSent, 0),
      delivered: filteredMetrics.reduce((sum, m) => sum + m.totalDelivered, 0),
      opened: filteredMetrics.reduce((sum, m) => sum + m.totalOpened, 0),
      clicked: filteredMetrics.reduce((sum, m) => sum + m.totalClicked, 0),
      bounced: filteredMetrics.reduce((sum, m) => sum + m.totalBounced, 0),
      replied: filteredMetrics.reduce((sum, m) => sum + m.totalReplied, 0),
      openRate:
        filteredMetrics.reduce((sum, m) => sum + m.totalOpened, 0) /
        Math.max(1, filteredMetrics.reduce((sum, m) => sum + m.totalDelivered, 0)),
      clickRate:
        filteredMetrics.reduce((sum, m) => sum + m.totalClicked, 0) /
        Math.max(1, filteredMetrics.reduce((sum, m) => sum + m.totalOpened, 0)),
    };

    // Device breakdown (if available and allowed by plan)
    const deviceBreakdown = hasFeature(plan as any, 'deviceTracking')
      ? aggregateJsonBreakdown(filteredMetrics.map(m => m.topDevices))
      : {};

    // Geo breakdown (enterprise only)
    const geoBreakdown = hasFeature(plan as any, 'geoTracking')
      ? aggregateJsonBreakdown(filteredMetrics.map(m => m.topCountries))
      : {};

    const result = {
      summary,
      metrics: breakdown === 'daily' ? filteredMetrics : undefined,
      deviceBreakdown: breakdown === 'device' ? deviceBreakdown : undefined,
      geoBreakdown: breakdown === 'geo' ? geoBreakdown : undefined,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
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
    const { date, dailyStats, deviceBreakdown, geoBreakdown } = await req.json();

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const analytics = await prisma.campaignAnalytics.create({
      data: {
        campaignId: id,
        dateGenerated: new Date(date),
        totalSent: dailyStats?.sent || 0,
        totalDelivered: dailyStats?.delivered || 0,
        totalOpened: dailyStats?.opened || 0,
        totalClicked: dailyStats?.clicked || 0,
        totalBounced: dailyStats?.bounced || 0,
        totalReplied: dailyStats?.replied || 0,
        topDevices: deviceBreakdown || {},
        topCountries: geoBreakdown || {},
      },
    });

    return NextResponse.json(analytics, { status: 201 });
  } catch (error) {
    console.error('Create analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to create analytics' },
      { status: 500 }
    );
  }
}

function aggregateJsonBreakdown(jsonArray: any[]): Record<string, number> {
  const aggregate: Record<string, number> = {};

  jsonArray.forEach((jsonObj) => {
    const obj = typeof jsonObj === 'string' ? JSON.parse(jsonObj) : jsonObj;
    if (obj && typeof obj === 'object') {
      Object.entries(obj).forEach(([key, value]: [string, any]) => {
        aggregate[key] = (aggregate[key] || 0) + (Number(value) || 0);
      });
    }
  });

  return aggregate;
}
