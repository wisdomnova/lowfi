import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

/**
 * GET /api/followups
 * Retrieve all follow-ups for the authenticated user with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = { userId };
    if (status) where.status = status;

    const followUps = await prisma.followUp.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(followUps);
  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch follow-ups' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/followups
 * Create a new follow-up
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { customerId, draftEmail, invoiceId } = body;

    if (!customerId || !draftEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, draftEmail' },
        { status: 400 }
      );
    }

    const followUp = await prisma.followUp.create({
      data: {
        userId,
        customerId,
        draftEmail,
        invoiceId: invoiceId || null,
        status: 'draft',
      },
    });

    return NextResponse.json(followUp, { status: 201 });
  } catch (error) {
    console.error('Error creating follow-up:', error);
    return NextResponse.json(
      { error: 'Failed to create follow-up' },
      { status: 500 }
    );
  }
}
