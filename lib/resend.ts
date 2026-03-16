import { Resend } from 'resend';

const resendKey = process.env.RESEND_API_KEY;

const resend = resendKey ? new Resend(resendKey) : null;

/**
 * Get a safe Resend client, throwing a clear error if not configured.
 */
export function getResend(): Resend {
  if (!resend) {
    throw new Error(
      'Resend is not configured. Set RESEND_API_KEY in environment variables.'
    );
  }
  return resend;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'LowFi <noreply@lowfi.app>';

/**
 * Send a transactional email from LowFi via Resend.
 * This is for platform emails (welcome, password reset, notifications) —
 * NOT for campaign emails sent on behalf of users (those use SendGrid).
 */
export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}) {
  const r = getResend();

  const { data, error } = await r.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
    ...(text && { text }),
    ...(replyTo && { replyTo }),
  });

  if (error) {
    console.error('[Resend] Failed to send email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }

  console.log(`[Resend] Email sent to ${to}: ${data?.id}`);
  return data;
}

export { resend };
