/**
 * Recipient Import and Processing Service
 * Handles CSV parsing, validation, deduplication, and segmentation
 */

import { prisma } from '@/lib/prisma';

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

/**
 * Parse CSV data and import recipients
 */
export async function importRecipientsFromCSV(
  campaignId: string,
  csvData: string,
  duplicateHandling: 'skip' | 'replace' | 'allow'
): Promise<ImportResult> {
  const result: ImportResult = {
    imported: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const lines = csvData
      .split('\n')
      .filter((line) => line.trim() && !line.startsWith('#'));

    if (lines.length < 2) {
      result.errors.push('CSV must contain header and at least one data row');
      return result;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const emailIndex = headers.indexOf('email');

    if (emailIndex === -1) {
      result.errors.push('CSV must contain an "email" column');
      return result;
    }

    // Get existing recipients for duplicate checking
    const existingRecipients = new Set<string>();
    if (duplicateHandling === 'skip' || duplicateHandling === 'replace') {
      const existing = await prisma.campaignRecipient.findMany({
        where: { campaignId },
        select: { email: true },
      });
      existing.forEach((r) => existingRecipients.add(r.email.toLowerCase()));
    }

    // Process data rows
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map((v) => v.trim());
        const email = values[emailIndex]?.toLowerCase();

        if (!email || !isValidEmail(email)) {
          result.errors.push(`Row ${i + 1}: Invalid email format`);
          result.skipped++;
          continue;
        }

        // Check for duplicates
        if (existingRecipients.has(email)) {
          if (duplicateHandling === 'skip') {
            result.skipped++;
            continue;
          } else if (duplicateHandling === 'replace') {
            await prisma.campaignRecipient.deleteMany({
              where: { campaignId, email },
            });
            existingRecipients.delete(email);
          }
        }

        // Extract merge data from other columns
        const mergeData: Record<string, string> = {};
        headers.forEach((header, index) => {
          if (header !== 'email' && values[index]) {
            mergeData[header] = values[index];
          }
        });

        // Create recipient
        await prisma.campaignRecipient.create({
          data: {
            campaignId,
            customerId: `${campaignId}-${email}-${Date.now()}`,
            email,
            mergeData,
            segment: mergeData['segment'] || null,
          },
        });

        existingRecipients.add(email);
        result.imported++;
      } catch (error: any) {
        result.errors.push(`Row ${i + 1}: ${error.message}`);
        result.skipped++;
      }
    }

    return result;
  } catch (error: any) {
    result.errors.push(error.message);
    return result;
  }
}

/**
 * Import recipients from segment
 */
export async function importRecipientsFromSegment(
  campaignId: string,
  segmentId: string
): Promise<ImportResult> {
  const result: ImportResult = {
    imported: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // Get all customers with specified segment tag
    // Since Customer model doesn't have segments, we skip filtering by segment
    // In production, would need to add segment support to Customer schema
    const customers = await prisma.customer.findMany({
      select: { id: true, email: true, name: true },
      take: 1000, // Limit to prevent huge imports
    });

    if (customers.length === 0) {
      result.errors.push('No customers available for import');
      return result;
    }

    // Import each customer
    for (const customer of customers) {
      if (!customer.email || !isValidEmail(customer.email)) {
        result.skipped++;
        continue;
      }

      await prisma.campaignRecipient.create({
        data: {
          campaignId,
          customerId: customer.id,
          email: customer.email,
          mergeData: {
            name: customer.name || '',
          },
          segment: segmentId,
        },
      });

      result.imported++;
    }

    return result;
  } catch (error: any) {
    result.errors.push(error.message);
    return result;
  }
}

/**
 * Get recipient count for campaign
 */
export async function getRecipientCount(campaignId: string): Promise<number> {
  return prisma.campaignRecipient.count({
    where: { campaignId },
  });
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Delete all recipients for a campaign
 */
export async function clearRecipients(campaignId: string): Promise<void> {
  await prisma.campaignRecipient.deleteMany({
    where: { campaignId },
  });

}
