import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  verifyToken,
  hashPassword,
  createToken,
  validatePassword,
  sanitizeEmail,
  isValidEmail,
} from '@/lib/auth';
import { sendTransactionalEmail } from '@/lib/resend';
import { passwordResetEmail } from '@/lib/email-templates';

/**
 * POST /api/auth/reset-password
 * Two modes:
 *  1. { email } — sends a password reset email with a short-lived token
 *  2. { token, password } — verifies the token and updates the password
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // ─── Mode 2: Reset with token ────────────────────────────────
    if (body.token && body.password) {
      const { token, password } = body;

      const passwordError = validatePassword(password);
      if (passwordError) {
        return NextResponse.json({ error: passwordError }, { status: 400 });
      }

      // Enforce purpose scope — only tokens created for password-reset are valid
      const userData = await verifyToken(token, 'password-reset');
      if (!userData) {
        return NextResponse.json(
          { error: 'Invalid or expired reset link' },
          { status: 400 }
        );
      }

      const hashedPassword = await hashPassword(password);

      await prisma.user.update({
        where: { id: userData.id },
        data: { password: hashedPassword },
      });

      return NextResponse.json({ success: true });
    }

    // ─── Mode 1: Send reset email ────────────────────────────────
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = sanitizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ success: true }); // Don't reveal validation to attackers
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always return success to not reveal if email exists
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Create a purpose-scoped, short-lived reset token (1 hour)
    const resetToken = await createToken(
      { id: user.id, email: user.email, name: user.name },
      { purpose: 'password-reset', expiresIn: '1h' }
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lowfi.app';
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;

    const template = passwordResetEmail(resetUrl);

    await sendTransactionalEmail({
      to: user.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ success: true });
  }
}
