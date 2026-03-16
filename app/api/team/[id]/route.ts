import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

// PUT /api/team/[id] - Update team member role or status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, status } = await request.json();
    const { id } = await params;

    // Verify the team member belongs to the same company as the requesting user
    const requestorCompany = await prisma.company.findUnique({
      where: { ownerId: userId },
    });
    const targetMember = await prisma.teamMember.findUnique({
      where: { id },
    });
    if (!requestorCompany || !targetMember || targetMember.companyId !== requestorCompany.id) {
      return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 });
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    const teamMember = await prisma.teamMember.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    return NextResponse.json({
      id: teamMember.id,
      email: teamMember.user.email,
      name: teamMember.user.name || teamMember.user.email.split('@')[0],
      role: teamMember.role,
      status: teamMember.status,
      joined_at: teamMember.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/team/[id] - Remove team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify the team member belongs to the same company as the requesting user
    const requestorCompany = await prisma.company.findUnique({
      where: { ownerId: userId },
    });
    const targetMember = await prisma.teamMember.findUnique({
      where: { id },
    });
    if (!requestorCompany || !targetMember || targetMember.companyId !== requestorCompany.id) {
      return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 });
    }

    await prisma.teamMember.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
