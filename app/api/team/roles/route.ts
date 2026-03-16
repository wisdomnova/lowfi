import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { hasFeature } from '@/lib/plan-features';

export async function GET(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roles = await prisma.teamRole.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Get roles error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { memberEmail, role, campaignIds } = await req.json();

    // Check plan features
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const plan = subscription?.plan || 'starter';

    if (!hasFeature(plan as any, 'teamCollaboration')) {
      return NextResponse.json(
        { error: 'Team collaboration is not available on your plan' },
        { status: 403 }
      );
    }

    if (role !== 'admin' && !hasFeature(plan as any, 'roleBasedAccess')) {
      return NextResponse.json(
        { error: 'Custom roles are not available on your plan' },
        { status: 403 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'member'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Create or update team role for the user (this endpoint manages the requesting user's role)
    const teamRole = await prisma.teamRole.create({
      data: {
        userId,
        role,
        permissions: getPermissionsForRole(role),
      },
    });

    return NextResponse.json(teamRole, { status: 201 });
  } catch (error) {
    console.error('Create role error:', error);
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    );
  }
}

function getPermissionsForRole(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    admin: [
      'create_campaign',
      'edit_campaign',
      'delete_campaign',
      'view_analytics',
      'manage_team',
      'manage_integrations',
      'view_billing',
    ],
    manager: [
      'create_campaign',
      'edit_campaign',
      'view_analytics',
      'view_team',
    ],
    member: ['create_campaign', 'edit_campaign'],
  };

  return rolePermissions[role] || [];
}

export async function PUT(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roleId, role } = await req.json();

    const teamRole = await prisma.teamRole.findUnique({
      where: { id: roleId },
    });

    if (!teamRole || teamRole.userId !== userId) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    const updated = await prisma.teamRole.update({
      where: { id: roleId },
      data: {
        role,
        permissions: getPermissionsForRole(role),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { roleId } = await req.json();

    const teamRole = await prisma.teamRole.findUnique({
      where: { id: roleId },
    });

    if (!teamRole || teamRole.userId !== userId) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    await prisma.teamRole.delete({
      where: { id: roleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete role error:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}
