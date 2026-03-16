import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

/**
 * GET /api/auth/session
 * Returns the current user session from the httpOnly cookie.
 * Used by the frontend AuthProvider to check login state.
 */
export async function GET() {
  try {
    const user = await getSession();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ user: null });
  }
}
