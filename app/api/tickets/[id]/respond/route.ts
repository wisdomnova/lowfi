import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { sendTransactionalEmail } from '@/lib/resend';
import { ticketResponseEmail } from '@/lib/email-templates';

/**
 * POST /api/tickets/[id]/respond
 * Send a response to a ticket and update its status
 */
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
    const body = await req.json();
    const { response } = body;

    if (!response || !response.trim()) {
      return NextResponse.json({ error: 'Response cannot be empty' }, { status: 400 });
    }

    // Verify ownership
    const ticket = await prisma.ticket.findUnique({ 
      where: { id },
      include: { user: { select: { email: true } } }
    });

    if (!ticket || ticket.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update ticket status to resolved
    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        status: 'resolved',
        aiResponse: response,
        updatedAt: new Date(),
      },
    });

    // Send branded email notification via Resend
    try {
      const template = ticketResponseEmail(ticket.subject, response);
      await sendTransactionalEmail({
        to: ticket.emailFrom,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (emailError) {
      console.error('Error sending ticket response email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error responding to ticket:', error);
    return NextResponse.json(
      { error: 'Failed to respond to ticket' },
      { status: 500 }
    );
  }
}
