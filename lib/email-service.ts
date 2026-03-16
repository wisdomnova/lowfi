import sgMail from '@sendgrid/mail';

// Initialize SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  from?: string;
  replyTo?: string;
  html?: boolean;
  trackingId?: string;
  customHeaders?: Record<string, string>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send a single email via SendGrid
 */
export async function sendEmail(payload: EmailPayload): Promise<SendEmailResult> {
  try {
    if (!SENDGRID_API_KEY) {
      console.warn('SENDGRID_API_KEY not configured');
      return {
        success: false,
        error: 'Email service not configured',
      };
    }

    const msg: any = {
      to: payload.to,
      from: payload.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@lowfi.app',
      subject: payload.subject,
      replyTo: payload.replyTo || process.env.SENDGRID_REPLY_TO,
      headers: {
        ...payload.customHeaders,
        // Add tracking header for webhook correlation
        ...(payload.trackingId && { 'X-Campaign-Id': payload.trackingId }),
      },
    };

    if (payload.html) {
      msg.html = payload.body;
    } else {
      msg.text = payload.body;
    }

    const response = await sgMail.send(msg);
    const messageId = (response[0].headers as any)['x-message-id'];

    console.log(`Email sent successfully to ${payload.to}`, { messageId, trackingId: payload.trackingId });

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to send email to ${payload.to}:`, errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Send multiple emails via SendGrid with batch API
 */
export async function sendEmailBatch(payloads: EmailPayload[]): Promise<SendEmailResult[]> {
  try {
    if (!SENDGRID_API_KEY) {
      return payloads.map(() => ({
        success: false,
        error: 'Email service not configured',
      }));
    }

    const msgs = payloads.map((payload) => {
      const msg: any = {
        to: payload.to,
        from: payload.from || process.env.SENDGRID_FROM_EMAIL || 'noreply@lowfi.app',
        subject: payload.subject,
        replyTo: payload.replyTo || process.env.SENDGRID_REPLY_TO,
        headers: {
          ...payload.customHeaders,
          ...(payload.trackingId && { 'X-Campaign-Id': payload.trackingId }),
        },
      };

      if (payload.html) {
        msg.html = payload.body;
      } else {
        msg.text = payload.body;
      }

      return msg;
    });

    const response = await sgMail.send(msgs as any);

    // For batch sends, response is an array with headers in each element
    const results = (Array.isArray(response) ? response : [response]).map((resp: any) => ({
      success: true,
      messageId: resp?.headers?.['x-message-id'] || resp?.['x-message-id'],
    }));

    console.log(`Batch email sent: ${payloads.length} emails`);
    return results;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Batch email send failed:', errorMessage);

    return payloads.map(() => ({
      success: false,
      error: errorMessage,
    }));
  }
}

/**
 * Send a templated email with variable substitution
 */
export async function sendTemplateEmail(
  to: string,
  subject: string,
  template: string,
  variables?: Record<string, string>
): Promise<SendEmailResult> {
  let body = template;

  // Replace variables in template
  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
  }

  return sendEmail({
    to,
    subject,
    body,
  });
}

export default {
  sendEmail,
  sendEmailBatch,
  sendTemplateEmail,
};
