/**
 * Form validation utilities for Phase 2 modals
 */

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateSchedule(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.sendTime) {
    errors.sendTime = "Send time is required";
  } else if (new Date(data.sendTime) < new Date()) {
    errors.sendTime = "Send time must be in the future";
  }

  if (!data.timezone) {
    errors.timezone = "Timezone is required";
  }

  if (data.recurring && !data.recurringEnd) {
    errors.recurringEnd = "Recurrence end date is required for recurring campaigns";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateABTest(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.testType) {
    errors.testType = "Test type is required";
  }

  if (data.testType === "subject" && (!data.subjectA || !data.subjectB)) {
    errors.subjects = "Both subject lines are required";
  }

  if (data.testType === "content" && (!data.contentA || !data.contentB)) {
    errors.content = "Both content versions are required";
  }

  if (!data.testSize || data.testSize <= 0 || data.testSize > 100) {
    errors.testSize = "Test size must be between 1 and 100%";
  }

  if (!data.testDuration || data.testDuration <= 0) {
    errors.testDuration = "Test duration must be greater than 0 hours";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateAutomation(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.triggerType) {
    errors.triggerType = "Trigger type is required";
  }

  if (!data.actionType) {
    errors.actionType = "Action type is required";
  }

  if (!data.workflowName || data.workflowName.trim().length === 0) {
    errors.workflowName = "Workflow name is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateEmailContent(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.subject || data.subject.trim().length === 0) {
    errors.subject = "Email subject is required";
  } else if (data.subject.length > 100) {
    errors.subject = "Subject must be less than 100 characters";
  }

  if (!data.content || data.content.trim().length === 0) {
    errors.content = "Email content is required";
  }

  if (!data.fromName || data.fromName.trim().length === 0) {
    errors.fromName = "From name is required";
  }

  if (!data.fromEmail || !isValidEmail(data.fromEmail)) {
    errors.fromEmail = "Valid email address is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRecipients(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.recipientSource) {
    errors.recipientSource = "Recipient source is required";
  }

  if (data.recipientSource === "csv" && !data.csvData) {
    errors.csvData = "CSV data is required";
  }

  if (data.recipientSource === "segment" && !data.segmentId) {
    errors.segmentId = "Segment is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateIntegration(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.provider) {
    errors.provider = "Provider is required";
  }

  if (!data.apiKey || data.apiKey.trim().length === 0) {
    errors.apiKey = "API key is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateCompliance(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.domain) {
    errors.domain = "Domain is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateApproval(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.approverEmail || !isValidEmail(data.approverEmail)) {
    errors.approverEmail = "Valid approver email is required";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
