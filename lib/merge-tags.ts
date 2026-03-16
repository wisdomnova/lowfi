/**
 * Merge Tags Support
 * Handles variable substitution in email content (e.g., {first_name}, {email})
 */

export interface MergeData {
  [key: string]: string | number | boolean | null;
}

// Standard merge tags
export const STANDARD_MERGE_TAGS = {
  first_name: 'Contact first name',
  last_name: 'Contact last name',
  email: 'Contact email address',
  phone: 'Contact phone number',
  company: 'Contact company name',
  custom_field_1: 'Custom field 1',
  custom_field_2: 'Custom field 2',
  custom_field_3: 'Custom field 3',
};

/**
 * Find all merge tags in content
 * Returns array of tag names, e.g., ['first_name', 'email', 'custom_field_1']
 */
export function extractMergeTags(content: string): string[] {
  const tagRegex = /\{(\w+)\}/g;
  const tags = new Set<string>();

  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    tags.add(match[1]);
  }

  return Array.from(tags);
}

/**
 * Validate that all merge tags in content exist in merge data
 */
export function validateMergeTags(content: string, mergeData: MergeData): boolean {
  const requiredTags = extractMergeTags(content);

  for (const tag of requiredTags) {
    if (!(tag in mergeData)) {
      return false;
    }
  }

  return true;
}

/**
 * Get missing merge tags from content that don't exist in merge data
 */
export function getMissingTags(content: string, mergeData: MergeData): string[] {
  const requiredTags = extractMergeTags(content);
  return requiredTags.filter((tag) => !(tag in mergeData));
}

/**
 * Substitute merge tags in content with actual values
 * Safe substitution - unmatched tags remain unchanged
 */
export function substituteMergeTags(content: string, mergeData: MergeData): string {
  return content.replace(/\{(\w+)\}/g, (match, tag) => {
    const value = mergeData[tag];

    if (value === null || value === undefined) {
      // Return empty string if tag not found (safe default)
      return '';
    }

    // Convert to string and sanitize
    return String(value).replace(/[<>\"']/g, (char) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return escapeMap[char] || char;
    });
  });
}

/**
 * Safe HTML escaping for merge tags (prevent XSS)
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Substitute merge tags with HTML escaping for email safety
 */
export function substituteMergeTagsSafe(content: string, mergeData: MergeData): string {
  return content.replace(/\{(\w+)\}/g, (match, tag) => {
    const value = mergeData[tag];

    if (value === null || value === undefined) {
      return '';
    }

    return escapeHtml(String(value));
  });
}

/**
 * Get list of available merge tags based on CSV headers or schema
 */
export function getAvailableMergeTags(
  headers?: string[],
  customFields?: string[]
): Record<string, string> {
  const tags: Record<string, string> = { ...STANDARD_MERGE_TAGS };

  // Add headers from CSV as custom fields
  if (headers) {
    headers.forEach((header, index) => {
      if (!header.toLowerCase().startsWith('first') && !header.toLowerCase().startsWith('last') && !header.toLowerCase().startsWith('email')) {
        const tagKey = header.toLowerCase().replace(/\s+/g, '_');
        tags[tagKey] = header;
      }
    });
  }

  // Add custom fields
  if (customFields) {
    customFields.forEach((field) => {
      const fieldKey = field.toLowerCase().replace(/\s+/g, '_');
      tags[fieldKey] = field;
    });
  }

  return tags;
}

/**
 * Create preview of email with sample merge data
 */
export function getEmailPreview(
  content: string,
  mergeData: Partial<MergeData> = {}
): string {
  const sampleData: MergeData = {
    first_name: mergeData.first_name || 'John',
    last_name: mergeData.last_name || 'Doe',
    email: mergeData.email || 'john@example.com',
    phone: mergeData.phone || '(555) 123-4567',
    company: mergeData.company || 'Acme Corp',
    ...mergeData,
  };

  return substituteMergeTags(content, sampleData);
}

/**
 * Validate email template merge tags
 */
export function validateTemplate(
  subject: string,
  content: string,
  availableTags: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const subjectTags = extractMergeTags(subject);
  const contentTags = extractMergeTags(content);
  const allTags = new Set([...subjectTags, ...contentTags]);

  for (const tag of allTags) {
    if (!availableTags.includes(tag) && !(tag in STANDARD_MERGE_TAGS)) {
      errors.push(`Unknown merge tag: {${tag}}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Replace merge tags for batch email sending
 * Returns map of customer IDs to personalized content
 */
export async function prepareBatchEmailContent(
  campaignId: string,
  baseContent: string,
  recipients: Array<{ customerId: string; mergeData: MergeData }>
): Promise<Map<string, string>> {
  const contentMap = new Map<string, string>();

  for (const recipient of recipients) {
    const personalized = substituteMergeTags(baseContent, recipient.mergeData);
    contentMap.set(recipient.customerId, personalized);
  }

  return contentMap;
}
