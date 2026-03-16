import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

/**
 * GET /api/settings/blacklist
 * Fetch all blacklisted emails for the user's company
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithCompany = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
      },
    });

    if (!userWithCompany?.company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 });
    }

    const companyId = userWithCompany.company.id;
    const blacklist = await prisma.globalBlacklist.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(blacklist);
  } catch (error) {
    console.error('Error fetching blacklist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/settings/blacklist
 * Add an email to the global blacklist
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, reason } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const userWithCompany = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!userWithCompany?.company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 });
    }

    const companyId = userWithCompany.company.id;

    const entry = await prisma.globalBlacklist.upsert({
      where: {
        companyId_email: {
          companyId,
          email: email.toLowerCase(),
        },
      },
      update: {
        reason: reason || 'Manual addition',
      },
      create: {
        companyId,
        email: email.toLowerCase(),
        reason: reason || 'Manual addition',
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Error adding to blacklist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/settings/blacklist
 * Remove email from global blacklist
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const userWithCompany = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!userWithCompany?.company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 });
    }

    const companyId = userWithCompany.company.id;

    await prisma.globalBlacklist.delete({
      where: {
        companyId_email: {
          companyId,
          email: email.toLowerCase(),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing from blacklist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
