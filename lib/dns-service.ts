import { promises as dns } from 'dns';

export interface DNSStatus {
  spf: 'active' | 'invalid' | 'pending';
  dkim: 'active' | 'invalid' | 'pending';
  dmarc: 'active' | 'invalid' | 'pending';
  isVerified: boolean;
}

/**
 * Checks DNS records for a given domain to verify deliverability settings.
 */
export async function verifyDomainDNS(domain: string): Promise<DNSStatus> {
  const status: DNSStatus = {
    spf: 'pending',
    dkim: 'pending',
    dmarc: 'pending',
    isVerified: false,
  };

  try {
    // 1. Check SPF
    const txtRecords = await dns.resolveTxt(domain);
    const spfRecord = txtRecords.flat().find(record => record.startsWith('v=spf1'));
    if (spfRecord) {
      // Basic check, usually contains include:sendgrid.net or similar for platforms
      status.spf = spfRecord.includes('v=spf1') ? 'active' : 'invalid';
    } else {
      status.spf = 'invalid';
    }

    // 2. Check DMARC
    try {
      const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain}`);
      const dmarcRecord = dmarcRecords.flat().find(record => record.startsWith('v=DMARC1'));
      status.dmarc = dmarcRecord ? 'active' : 'invalid';
    } catch {
      status.dmarc = 'invalid';
    }

    // 3. Check DKIM (Generic SendGrid/Resend common selectors if we can guess, 
    // but usually DKIM requires a specific selector. We'll check common ones or 
    // just return pending if selector isn't provided. For LowFi, let's look for 'resend' or 's1')
    const commonSelectors = ['resend', 's1', 'smtp'];
    for (const selector of commonSelectors) {
      try {
        const dkimRecords = await dns.resolveTxt(`${selector}._domainkey.${domain}`);
        if (dkimRecords.length > 0) {
          status.dkim = 'active';
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (status.dkim === 'pending') status.dkim = 'invalid';

    // Domain is verified if SPF is active (basic requirement)
    status.isVerified = status.spf === 'active' && status.dkim === 'active';

    return status;
  } catch (error) {
    console.error('DNS Verification Error:', error);
    return {
      spf: 'invalid',
      dkim: 'invalid',
      dmarc: 'invalid',
      isVerified: false,
    };
  }
}
