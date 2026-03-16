/**
 * Branded email templates for LowFi transactional emails.
 * Matches the LowFi visual identity: #FAFAF8 cream, #1F2937 slate, clean/minimal.
 */

const BRAND = {
  bg: '#FAFAF8',
  slate: '#1F2937',
  muted: '#6B7280',
  border: '#E5E7EB',
  white: '#FFFFFF',
  accent: '#4ADE80',
};

function layout(content: string, preheader?: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LowFi</title>
  ${preheader ? `<span style="display:none;font-size:1px;color:${BRAND.bg};max-height:0;overflow:hidden;">${preheader}</span>` : ''}
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:32px;height:32px;background-color:${BRAND.slate};border-radius:6px;" align="center" valign="middle">
                    <div style="width:16px;height:16px;background-color:${BRAND.bg};border-radius:2px;"></div>
                  </td>
                  <td style="padding-left:10px;font-size:18px;font-weight:700;color:${BRAND.slate};letter-spacing:-0.02em;">
                    LowFi
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Card -->
          <tr>
            <td style="background-color:${BRAND.white};border:1px solid ${BRAND.border};border-radius:24px;padding:48px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:${BRAND.muted};letter-spacing:0.05em;text-transform:uppercase;font-weight:600;">
                &copy; ${new Date().getFullYear()} LowFi &middot; Modern email infrastructure
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:${BRAND.muted};">
                You received this because you have a LowFi account.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(text: string, href: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0;">
      <tr>
        <td style="background-color:${BRAND.slate};border-radius:12px;padding:14px 32px;">
          <a href="${href}" style="color:${BRAND.white};text-decoration:none;font-size:12px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;display:inline-block;">
            ${text}
          </a>
        </td>
      </tr>
    </table>`;
}

// ─── Templates ───────────────────────────────────────────

export function welcomeEmail(userName: string, dashboardUrl: string) {
  const html = layout(`
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:${BRAND.slate};letter-spacing:-0.02em;">
      Welcome to LowFi
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.6;">
      Hey ${userName || 'there'}, your account is live. You're ready to send campaigns, track invoices, and manage follow-ups — all from one place.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;background-color:${BRAND.bg};border-radius:12px;border:1px solid ${BRAND.border};">
          <p style="margin:0 0 4px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.15em;color:${BRAND.muted};">Quick Start</p>
          <p style="margin:0;font-size:14px;color:${BRAND.slate};line-height:1.6;">
            <strong>1.</strong> Create your first campaign<br/>
            <strong>2.</strong> Upload an invoice for AI extraction<br/>
            <strong>3.</strong> Set up your team members
          </p>
        </td>
      </tr>
    </table>

    ${button('Go to Dashboard', dashboardUrl)}

    <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.6;">
      Questions? Just reply to this email — we read every message.
    </p>
  `, 'Your LowFi account is ready. Start sending campaigns today.');

  return {
    subject: 'Welcome to LowFi — your account is live',
    html,
    text: `Welcome to LowFi, ${userName || 'there'}! Your account is live. Go to your dashboard: ${dashboardUrl}`,
  };
}

export function passwordResetEmail(resetUrl: string) {
  const html = layout(`
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:${BRAND.slate};letter-spacing:-0.02em;">
      Reset Your Password
    </h1>
    <p style="margin:0 0 8px;font-size:15px;color:${BRAND.muted};line-height:1.6;">
      We received a request to reset your password. Click the button below to choose a new one.
    </p>
    <p style="margin:0 0 24px;font-size:13px;color:${BRAND.muted};line-height:1.6;">
      This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
    </p>

    ${button('Reset Password', resetUrl)}

    <p style="margin:0;font-size:12px;color:${BRAND.muted};word-break:break-all;">
      Or copy this link: <a href="${resetUrl}" style="color:${BRAND.slate};">${resetUrl}</a>
    </p>
  `, 'Reset your LowFi password');

  return {
    subject: 'Reset your LowFi password',
    html,
    text: `Reset your LowFi password by visiting: ${resetUrl}`,
  };
}

export function emailConfirmationEmail(confirmUrl: string) {
  const html = layout(`
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:${BRAND.slate};letter-spacing:-0.02em;">
      Confirm Your Email
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.6;">
      Please confirm your email address to activate your LowFi account.
    </p>

    ${button('Confirm Email', confirmUrl)}

    <p style="margin:0;font-size:12px;color:${BRAND.muted};word-break:break-all;">
      Or copy this link: <a href="${confirmUrl}" style="color:${BRAND.slate};">${confirmUrl}</a>
    </p>
  `, 'Confirm your LowFi email address');

  return {
    subject: 'Confirm your LowFi email address',
    html,
    text: `Confirm your LowFi email by visiting: ${confirmUrl}`,
  };
}

export function ticketResponseEmail(ticketSubject: string, responseText: string) {
  const html = layout(`
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:${BRAND.slate};letter-spacing:-0.02em;">
      Re: ${ticketSubject}
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.6;">
      Thank you for reaching out. Here's our response:
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding:24px;background-color:${BRAND.bg};border-radius:16px;border:1px solid ${BRAND.border};">
          <p style="margin:0;font-size:14px;color:${BRAND.slate};line-height:1.7;white-space:pre-wrap;">${responseText}</p>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0;font-size:13px;color:${BRAND.muted};line-height:1.6;">
      If you have further questions, simply reply to this email.
    </p>
  `, `Response to: ${ticketSubject}`);

  return {
    subject: `Re: ${ticketSubject}`,
    html,
    text: `Re: ${ticketSubject}\n\n${responseText}\n\nIf you have further questions, reply to this email.`,
  };
}

export function subscriptionConfirmationEmail(planName: string, amount: string, dashboardUrl: string) {
  const html = layout(`
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:${BRAND.slate};letter-spacing:-0.02em;">
      Subscription Confirmed
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${BRAND.muted};line-height:1.6;">
      You're now on the <strong style="color:${BRAND.slate};">${planName}</strong> plan.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
      <tr>
        <td style="padding:20px 24px;background-color:${BRAND.bg};border-radius:12px;border:1px solid ${BRAND.border};">
          <table role="presentation" width="100%">
            <tr>
              <td style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.15em;color:${BRAND.muted};padding-bottom:8px;">Plan</td>
              <td style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.15em;color:${BRAND.muted};padding-bottom:8px;" align="right">Amount</td>
            </tr>
            <tr>
              <td style="font-size:16px;font-weight:700;color:${BRAND.slate};">${planName}</td>
              <td style="font-size:16px;font-weight:700;color:${BRAND.slate};" align="right">${amount}/mo</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${button('Go to Dashboard', dashboardUrl)}
  `, `Your ${planName} subscription is confirmed`);

  return {
    subject: `LowFi ${planName} — subscription confirmed`,
    html,
    text: `Your ${planName} subscription ($${amount}/mo) is confirmed. Visit your dashboard: ${dashboardUrl}`,
  };
}
