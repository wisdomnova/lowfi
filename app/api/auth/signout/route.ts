import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

/**
 * POST /api/auth/signout
 * Clears the session cookie.
 */
export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign out error:', error);
    return NextResponse.json({ success: true });
  }
}
