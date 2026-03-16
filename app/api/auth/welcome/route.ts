import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { sendTransactionalEmail } from '@/lib/resend';
import { welcomeEmail } from '@/lib/email-templates';

/**
 * POST /api/auth/welcome
 * Sends a branded welcome email via Resend.
 * Note: The signup route already sends this automatically.
 * This route remains for manual re-sends if needed.
 * Expects: { email, name }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email } = await req.json();
    const targetEmail = email || user.email;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lowfi.app';
    const template = welcomeEmail(name || 'there', `${baseUrl}/dashboard`);

    await sendTransactionalEmail({
      to: targetEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json({ success: false, error: 'Email send failed' }, { status: 200 });
  }
}
