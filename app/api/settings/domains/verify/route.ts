import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { verifyDomainDNS } from '@/lib/dns-service';

/**
 * GET /api/settings/domains
 * Fetch all domains for the user's company
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userWithCompany = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!userWithCompany?.company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 });
    }

    const companyId = userWithCompany.company.id;
    const domainsList = await prisma.domain.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(domainsList);
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/settings/domains/verify
 * Add or check a domain's DNS status
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let { domain } = await request.json();

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    // Standardize domain (remove protocol/www if present)
    domain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];

    const userWithCompany = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!userWithCompany?.company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 });
    }

    const companyId = userWithCompany.company.id;

    // Run verification
    const dnsStatus = await verifyDomainDNS(domain);

    // Save to DB
    const domainEntry = await prisma.domain.upsert({
      where: {
        companyId_domain: {
          companyId,
          domain,
        },
      },
      update: {
        isVerified: dnsStatus.isVerified,
        spfStatus: dnsStatus.spf,
        dkimStatus: dnsStatus.dkim,
        dmarcStatus: dnsStatus.dmarc,
        lastCheckedAt: new Date(),
      },
      create: {
        companyId,
        domain,
        isVerified: dnsStatus.isVerified,
        spfStatus: dnsStatus.spf,
        dkimStatus: dnsStatus.dkim,
        dmarcStatus: dnsStatus.dmarc,
        lastCheckedAt: new Date(),
      },
    });

    return NextResponse.json(domainEntry);
  } catch (error) {
    console.error('Error verifying domain:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/settings/domains/verify
 * Remove domain from the list
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = await verifyAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    const userWithCompany = await prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!userWithCompany?.company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 });
    }

    const companyId = userWithCompany.company.id;

    await prisma.domain.delete({
      where: {
        companyId_domain: {
          companyId,
          domain: domain.toLowerCase(),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing domain:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
