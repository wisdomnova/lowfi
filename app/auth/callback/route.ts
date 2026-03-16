import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * OAuth callback route — no longer used.
 * Redirects to signin in case any old links still point here.
 */
export async function GET(request: NextRequest) {
  return NextResponse.redirect(new URL('/auth/signin', request.url));
}
