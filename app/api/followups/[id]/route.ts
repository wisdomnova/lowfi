import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

/**
 * GET /api/followups/[id]
 * Retrieve a specific follow-up
 */
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

    const followUp = await prisma.followUp.findUnique({
      where: { id },
    });

    if (!followUp) {
      return NextResponse.json({ error: 'Follow-up not found' }, { status: 404 });
    }

    if (followUp.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(followUp);
  } catch (error) {
    console.error('Error fetching follow-up:', error);
    return NextResponse.json(
      { error: 'Failed to fetch follow-up' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/followups/[id]
 * Update a follow-up (status, email content)
 */
export async function PUT(
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
    const { status, draftEmail } = body;

    // Verify ownership
    const followUp = await prisma.followUp.findUnique({ where: { id } });
    if (!followUp || followUp.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.followUp.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(draftEmail && { draftEmail }),
        ...(status === 'sent' && { sentAt: new Date() }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating follow-up:', error);
    return NextResponse.json(
      { error: 'Failed to update follow-up' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/followups/[id]
 * Delete a follow-up
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const followUp = await prisma.followUp.findUnique({ where: { id } });
    if (!followUp || followUp.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.followUp.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting follow-up:', error);
    return NextResponse.json(
      { error: 'Failed to delete follow-up' },
      { status: 500 }
    );
  }
}
