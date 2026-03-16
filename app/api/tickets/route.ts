import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

/**
 * GET /api/tickets
 * Retrieve all tickets for the authenticated user with optional filtering
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    const where: any = { userId };
    if (status) where.status = status;
    if (category) where.category = category;

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tickets
 * Create a new ticket
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { emailFrom, subject, body: ticketBody, category } = body;

    if (!emailFrom || !subject || !ticketBody) {
      return NextResponse.json(
        { error: 'Missing required fields: emailFrom, subject, body' },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.create({
      data: {
        userId,
        emailFrom,
        subject,
        body: ticketBody,
        category: category || 'other',
        status: 'open',
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}
