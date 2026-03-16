import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { hasFeature } from '@/lib/plan-features';
import { inngest } from '@/lib/inngest';

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

    const tests = await prisma.aBTest.findMany({
      where: { campaignId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(tests);
  } catch (error) {
    console.error('Get A/B tests error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch A/B tests' },
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
    const { name, testType, variantA, variantB, splitPercent } = await req.json();

    // Check plan features
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const plan = subscription?.plan || 'starter';

    if (!hasFeature(plan as any, 'abTesting')) {
      return NextResponse.json(
        {
          error: 'A/B testing is not available on your plan',
        },
        { status: 403 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    const test = await prisma.aBTest.create({
      data: {
        campaignId: id,
        userId,
        name,
        testType,
        variantA: JSON.stringify(variantA),
        variantB: JSON.stringify(variantB),
        splitPercent: splitPercent || 50,
        status: 'draft',
        startedAt: new Date(),
      },
    });

    // Trigger Inngest job to monitor this A/B test
    await inngest.send({
      name: 'campaign/abtest.created',
      data: {
        campaignId: id,
        testId: test.id,
        testType,
      },
    });

    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error('Create A/B test error:', error);
    return NextResponse.json(
      { error: 'Failed to create A/B test' },
      { status: 500 }
    );
  }
}
