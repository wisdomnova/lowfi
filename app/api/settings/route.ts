import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

// GET /api/settings - Get user settings
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
        },
      });
    }

    return NextResponse.json({
      email_notifications: settings.emailNotifications,
      notification_frequency: settings.notificationFrequency,
      marketing_emails: settings.marketingEmails,
      product_updates: settings.productUpdates,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/settings - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      email_notifications,
      notification_frequency,
      marketing_emails,
      product_updates,
    } = await request.json();

    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId,
          emailNotifications: email_notifications ?? true,
          notificationFrequency: notification_frequency ?? 'daily',
          marketingEmails: marketing_emails ?? false,
          productUpdates: product_updates ?? true,
        },
      });
    } else {
      settings = await prisma.userSettings.update({
        where: { userId },
        data: {
          ...(email_notifications !== undefined && { emailNotifications: email_notifications }),
          ...(notification_frequency && { notificationFrequency: notification_frequency }),
          ...(marketing_emails !== undefined && { marketingEmails: marketing_emails }),
          ...(product_updates !== undefined && { productUpdates: product_updates }),
        },
      });
    }

    // Log activity
    await prisma.activity.create({
      data: {
        userId,
        action: 'update',
        resourceType: 'settings',
        resourceId: userId,
        details: {
          email_notifications,
          notification_frequency,
          marketing_emails,
          product_updates,
        },
      },
    });

    return NextResponse.json({
      email_notifications: settings.emailNotifications,
      notification_frequency: settings.notificationFrequency,
      marketing_emails: settings.marketingEmails,
      product_updates: settings.productUpdates,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
