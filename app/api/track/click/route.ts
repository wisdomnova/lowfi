/**
 * Email Click Tracking Endpoint
 * Redirects to original URL and tracks click
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { trackEmailClick } from '@/lib/automation-tracking';

export async function GET(request: NextRequest) {
  try {
    const campaignId = request.nextUrl.searchParams.get('cid');
    const recipientId = request.nextUrl.searchParams.get('rid');
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    if (campaignId && recipientId) {
      // Update campaign send record
      const send = await prisma.campaignSendUpdated.findFirst({
        where: {
          campaignId,
          customerId: recipientId,
        },
      });

      if (send) {
        await prisma.campaignSendUpdated.update({
          where: { id: send.id },
          data: {
            status: 'clicked',
            clickedAt: new Date(),
          },
        });

        // Update campaign metrics
        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            clickedCount: { increment: 1 },
          },
        });

        // Trigger automation workflows that listen for clicks
        await trackEmailClick(campaignId, recipientId, url);
      }
    }

    // Redirect to original URL
    return NextResponse.redirect(decodeURIComponent(url));
  } catch (error) {
    console.error('Click tracking error:', error);
    
    // Still redirect even on error
    const url = request.nextUrl.searchParams.get('url');
    if (url) {
      return NextResponse.redirect(decodeURIComponent(url));
    }

    return NextResponse.json({ error: 'Tracking failed' }, { status: 500 });
  }
}

