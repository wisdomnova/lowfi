import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const templates = await prisma.emailTemplate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Fetch templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
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

    const body = await req.json();
    const { name, subject, body: content, variables, category } = body;

    if (!name || !subject || !content) {
      return NextResponse.json(
        { error: 'Name, subject, and body are required' },
        { status: 400 }
      );
    }

    const template = await prisma.emailTemplate.create({
      data: {
        userId,
        name,
        subject,
        body: content,
        variables: variables || [],
        category: category || 'general',
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
