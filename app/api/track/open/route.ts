/**
 * Email Open Tracking Endpoint
 * Returns 1x1 transparent GIF
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { trackEmailOpen } from '@/lib/automation-tracking';

export async function GET(request: NextRequest) {
  try {
    const campaignId = request.nextUrl.searchParams.get('cid');
    const recipientId = request.nextUrl.searchParams.get('rid');

    if (campaignId && recipientId) {
      // Update campaign send record
      const send = await prisma.campaignSendUpdated.findFirst({
        where: {
          campaignId,
          customerId: recipientId,
        },
      });

      if (send && send.status === 'sent') {
        await prisma.campaignSendUpdated.update({
          where: { id: send.id },
          data: {
            status: 'opened',
            openedAt: new Date(),
          },
        });

        // Update campaign metrics
        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            openedCount: { increment: 1 },
          },
        });

        // Trigger automation workflows that listen for opens
        await trackEmailOpen(campaignId, recipientId);
      }
    }

    // Return 1x1 transparent GIF
    const gif = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new NextResponse(gif, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Open tracking error:', error);
    
    // Still return GIF even on error
    const gif = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new NextResponse(gif, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
      },
    });
  }
}
