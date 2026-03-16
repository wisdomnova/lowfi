import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  hashPassword,
  createSession,
  validatePassword,
  sanitizeEmail,
  sanitizeText,
  isValidEmail,
} from '@/lib/auth';
import { sendTransactionalEmail } from '@/lib/resend';
import { welcomeEmail } from '@/lib/email-templates';

/**
 * POST /api/auth/signup
 * Create a new user account. Sets httpOnly session cookie.
 * Token is ONLY in the httpOnly cookie — never exposed in the response body.
 * Expects: { email, password, companyName }
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password, companyName } = await req.json();

    if (!email || !password || !companyName) {
      return NextResponse.json(
        { error: 'Email, password, and company name are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = sanitizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const safeName = sanitizeText(companyName);
    if (!safeName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Create user + company in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: safeName,
        },
      });

      await tx.company.create({
        data: {
          ownerId: newUser.id,
          name: safeName,
        },
      });

      return newUser;
    });

    // createSession sets the httpOnly cookie — no token in the response body
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // Send welcome email (don't block signup if this fails)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lowfi.app';
      const template = welcomeEmail(safeName, `${baseUrl}/dashboard`);
      await sendTransactionalEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
