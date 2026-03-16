import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

// GET /api/team - Get all team members for user's company
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's company
    const userWithCompany = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!userWithCompany?.company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 });
    }

    // Get all team members
    const teamMembers = await prisma.teamMember.findMany({
      where: { companyId: userWithCompany.company.id },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      teamMembers.map((member: any) => ({
        id: member.id,
        userId: member.userId,
        email: member.user.email,
        name: member.user.name || member.user.email.split('@')[0],
        role: member.role,
        status: member.status,
        joined_at: member.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/team - Invite a new team member
export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    // Get user's company
    const userWithCompany = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!userWithCompany?.company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 });
    }

    // Check if user already invited
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const existingTeamMember = await prisma.teamMember.findFirst({
        where: {
          userId: existingUser.id,
          companyId: userWithCompany.company.id,
        },
      });
      if (existingTeamMember) {
        return NextResponse.json({ error: 'User already in team' }, { status: 400 });
      }
    }

    // Create or get user
    let invitedUser = existingUser;
    if (!invitedUser) {
      invitedUser = await prisma.user.create({
        data: {
          email,
          password: '', // Will be set on first login
        },
      });
    }

    // Add to team
    const teamMember = await prisma.teamMember.create({
      data: {
        userId: invitedUser.id,
        companyId: userWithCompany.company.id,
        role,
        status: 'pending',
      },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId,
        action: 'create',
        resourceType: 'team_member',
        resourceId: teamMember.id,
        details: { email, role },
      },
    });

    // TODO: Send invitation email via email provider

    return NextResponse.json({
      id: teamMember.id,
      email: teamMember.user.email,
      name: teamMember.user.name || teamMember.user.email.split('@')[0],
      role: teamMember.role,
      status: teamMember.status,
      joined_at: teamMember.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error inviting team member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
