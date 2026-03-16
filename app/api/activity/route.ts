import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

/**
 * GET /api/activity
 * Retrieve activity logs for the authenticated user with filtering and pagination
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const resourceType = searchParams.get('resourceType');
    const action = searchParams.get('action');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };
    if (resourceType) where.resourceType = resourceType;
    if (action) where.action = action;

    // Get total count for pagination
    const total = await prisma.activity.count({ where });

    // Get paginated results
    const activities = await prisma.activity.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip,
      take: limit,
    });

    return NextResponse.json({
      data: activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/activity
 * Log a new activity (requires authentication)
 */
export async function POST(req: NextRequest) {
  try {
    const authUserId = await verifyAuth(req);
    if (!authUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, resourceType, resourceId, details } = body;

    if (!action || !resourceType || !resourceId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, resourceType, resourceId' },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        userId: authUserId,
        action,
        resourceType,
        resourceId,
        details: details || {},
        timestamp: new Date(),
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Error logging activity:', error);
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}
