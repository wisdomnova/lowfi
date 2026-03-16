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

    // Get invoices grouped by day of week
    const invoices = await prisma.invoice.findMany({
      where: { userId: user_id },
      select: { createdAt: true },
    });

    // Get follow-ups grouped by day of week
    const followups = await prisma.followUp.findMany({
      where: { userId: user_id },
      select: { createdAt: true },
    });

    // Get campaigns grouped by day of week
    const campaigns = await prisma.campaign.findMany({
      where: { userId: user_id },
      select: { createdAt: true },
    });

    // Group data by day of week
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayIndices = [1, 2, 3, 4, 5, 6, 0]; // Monday=1, ..., Sunday=0

    // Revenue data (invoice and campaign count)
    const revenueByDay = days.map(() => 0);
    invoices.forEach((inv) => {
      const dayOfWeek = new Date(inv.createdAt).getDay();
      const dayIndex = dayIndices.indexOf(dayOfWeek);
      if (dayIndex !== -1) {
        revenueByDay[dayIndex] += 100; // Each invoice counted as 100 units
      }
    });
    campaigns.forEach((camp) => {
      const dayOfWeek = new Date(camp.createdAt).getDay();
      const dayIndex = dayIndices.indexOf(dayOfWeek);
      if (dayIndex !== -1) {
        revenueByDay[dayIndex] += 150; // Each campaign counted as 150 units
      }
    });

    // Volume data (follow-ups and campaigns count)
    const volumeByDay = days.map(() => 0);
    followups.forEach((fu) => {
      const dayOfWeek = new Date(fu.createdAt).getDay();
      const dayIndex = dayIndices.indexOf(dayOfWeek);
      if (dayIndex !== -1) {
        volumeByDay[dayIndex] += 1;
      }
    });
    campaigns.forEach((camp) => {
      const dayOfWeek = new Date(camp.createdAt).getDay();
      const dayIndex = dayIndices.indexOf(dayOfWeek);
      if (dayIndex !== -1) {
        volumeByDay[dayIndex] += 5; // Campaigns contribute more to volume
      }
    });

    // Build chart data
    const revenueData = days.map((day, idx) => ({
      name: day,
      value: Math.round(revenueByDay[idx] || 0),
    }));

    const volumeData = days.map((day, idx) => ({
      name: day,
      value: Math.round(volumeByDay[idx] || 0),
    }));

    return NextResponse.json({
      revenue: revenueData,
      volume: volumeData,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
