import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template || template.userId !== userId) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Fetch template error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, subject, body: content, variables, category } = body;

    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template || template.userId !== userId) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const updated = await prisma.emailTemplate.update({
      where: { id },
      data: {
        name: name || template.name,
        subject: subject || template.subject,
        body: content || template.body,
        variables: variables !== undefined ? variables : template.variables,
        category: category || template.category,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update template error:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template || template.userId !== userId) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    await prisma.emailTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
