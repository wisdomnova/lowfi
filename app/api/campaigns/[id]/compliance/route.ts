import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { hasFeature } from '@/lib/plan-features';
import dns from 'dns';
import { promisify } from 'util';
import { inngest } from '@/lib/inngest';

const resolveMx = promisify(dns.resolveMx);
const resolveTxt = promisify(dns.resolveTxt);

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

    const checks = await prisma.complianceCheck.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(checks);
  } catch (error) {
    console.error('Get compliance checks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance checks' },
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
    const { senderEmail, senderDomain } = await req.json();

    // Check plan features
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const plan = subscription?.plan || 'starter';

    if (!hasFeature(plan as any, 'spfDkimVerification')) {
      return NextResponse.json(
        { error: 'Compliance checks are not available on your plan' },
        { status: 403 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign || campaign.userId !== userId) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Run compliance checks
    const results = await runComplianceChecks(senderDomain, senderEmail);

    const check = await prisma.complianceCheck.create({
      data: {
        userId,
        checkType: 'spf_dkim_dmarc',
        domain: senderDomain,
        status: results.spfValid && results.dkimValid ? 'passed' : 'failed',
        result: results,
      },
    });

    // Trigger Inngest job for compliance monitoring
    await inngest.send({
      name: 'campaign/compliance.checked',
      data: {
        campaignId: id,
        domain: senderDomain,
        checkId: check.id,
        status: check.status,
      },
    });

    return NextResponse.json(check, { status: 201 });
  } catch (error) {
    console.error('Create compliance check error:', error);
    return NextResponse.json(
      { error: 'Failed to create compliance check' },
      { status: 500 }
    );
  }
}

async function runComplianceChecks(
  domain: string,
  senderEmail: string
): Promise<any> {
  const results = {
    spfValid: false,
    dkimValid: false,
    dmarcValid: false,
    spamScore: 0,
    details: [] as string[],
  };

  try {
    // Check SPF record
    const txtRecords = await resolveTxt(domain);
    const spfRecord = txtRecords.find((record) =>
      record.join('').startsWith('v=spf1')
    );

    if (spfRecord) {
      results.spfValid = true;
      results.details.push('SPF record found and valid');
    } else {
      results.details.push('SPF record not found');
      results.spamScore += 20;
    }

    // Check DMARC record
    const dmarcRecords = await resolveTxt(`_dmarc.${domain}`);
    if (dmarcRecords.length > 0) {
      results.dmarcValid = true;
      results.details.push('DMARC record found and valid');
    } else {
      results.details.push('DMARC record not found');
      results.spamScore += 25;
    }

    // Check MX records
    const mxRecords = await resolveMx(domain);
    if (mxRecords && mxRecords.length > 0) {
      results.details.push(`${mxRecords.length} MX records found`);
    } else {
      results.details.push('No MX records found');
      results.spamScore += 50;
    }

    // Check for common spam triggers
    if (senderEmail.includes('noreply') || senderEmail.includes('no-reply')) {
      results.spamScore += 5;
      results.details.push('Email appears to be no-reply address');
    }

    // DKIM typically requires manual verification
    results.dkimValid = false;
    results.details.push('DKIM requires manual verification');

  } catch (error) {
    console.error('DNS lookup error:', error);
    results.spamScore = 100;
    results.details.push('Unable to verify domain records');
  }

  return results;
}
