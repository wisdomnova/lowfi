import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

// GET /api/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile from database
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        location: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name || 'User',
      company: userProfile.company?.name ?? null,
      phone: userProfile.phone ?? null,
      location: userProfile.location ?? null,
      avatar_url: userProfile.avatarUrl ?? null,
      created_at: userProfile.createdAt.toISOString(),
      updated_at: userProfile.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, company, phone, location, avatar_url } = await request.json();

    // Update user profile fields
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
        ...(avatar_url !== undefined && { avatarUrl: avatar_url }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        location: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Update or create company if company name provided
    if (company !== undefined) {
      if (company) {
        await prisma.company.upsert({
          where: { ownerId: userId },
          update: { name: company },
          create: { ownerId: userId, name: company },
        });
      }
    }

    // Re-fetch to get updated company
    const finalUser = company !== undefined ? await prisma.user.findUnique({
      where: { id: userId },
      select: { company: { select: { name: true } } },
    }) : null;

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name || 'User',
      company: finalUser?.company?.name ?? updatedUser.company?.name ?? null,
      phone: updatedUser.phone ?? null,
      location: updatedUser.location ?? null,
      avatar_url: updatedUser.avatarUrl ?? null,
      created_at: updatedUser.createdAt.toISOString(),
      updated_at: updatedUser.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
