import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

// GET /api/notifications - Get all notifications for user
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const unreadOnly = request.nextUrl.searchParams.get('unread') === 'true';

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(
      notifications.map((notif: any) => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        description: notif.description,
        read: notif.read,
        actionUrl: notif.actionUrl,
        createdAt: notif.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/notifications - Create a new notification (admin only)
export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId: targetUserId, type, title, description, actionUrl } = await request.json();

    if (!targetUserId || !title) {
      return NextResponse.json(
        { error: 'userId and title are required' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: type || 'info',
        title,
        description,
        actionUrl,
      },
    });

    return NextResponse.json({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      description: notification.description,
      read: notification.read,
      actionUrl: notification.actionUrl,
      createdAt: notification.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
