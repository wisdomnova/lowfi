import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { hasFeature } from '@/lib/plan-features';

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

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const contents = await prisma.emailContent.findMany({
      where: { campaignId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(contents);
  } catch (error) {
    console.error('Get email content error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email content' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { name, subject, contentType, rawContent, placeholders } = await req.json();

    // Check plan features based on content type
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const plan = subscription?.plan || 'starter';

    // Determine which editor was used and check feature access
    if (contentType === 'html' && !hasFeature(plan as any, 'htmlEditor')) {
      return NextResponse.json(
        { error: 'HTML editor is not available on your plan' },
        { status: 403 }
      );
    }

    if (contentType === 'rich_text' && !hasFeature(plan as any, 'richTextEditor')) {
      return NextResponse.json(
        { error: 'Rich text editor is not available on your plan' },
        { status: 403 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Validate placeholders
    const validPlaceholders = ['firstName', 'lastName', 'email', 'customField1'];
    const invalidPlaceholders = (placeholders || []).filter(
      (p: string) => !validPlaceholders.includes(p)
    );

    if (invalidPlaceholders.length > 0) {
      return NextResponse.json(
        { error: `Invalid placeholders: ${invalidPlaceholders.join(', ')}` },
        { status: 400 }
      );
    }

    const content = await prisma.emailContent.create({
      data: {
        campaignId: id,
        contentType: contentType || 'plaintext',
        rawContent,
        placeholders: placeholders || [],
      },
    });

    return NextResponse.json(content, { status: 201 });
  } catch (error) {
    console.error('Create email content error:', error);
    return NextResponse.json(
      { error: 'Failed to create email content' },
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
    const { contentId, contentType, rawContent, placeholders } = await req.json();

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const content = await prisma.emailContent.findUnique({
      where: { id: contentId },
    });

    if (!content || content.campaignId !== id) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    const updated = await prisma.emailContent.update({
      where: { id: contentId },
      data: {
        contentType: contentType || content.contentType,
        rawContent: rawContent || content.rawContent,
        placeholders: placeholders || content.placeholders,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update email content error:', error);
    return NextResponse.json(
      { error: 'Failed to update email content' },
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
    const { contentId } = await req.json();

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const content = await prisma.emailContent.findUnique({
      where: { id: contentId },
    });

    if (!content || content.campaignId !== id) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    await prisma.emailContent.delete({
      where: { id: contentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete email content error:', error);
    return NextResponse.json(
      { error: 'Failed to delete email content' },
      { status: 500 }
    );
  }
}
