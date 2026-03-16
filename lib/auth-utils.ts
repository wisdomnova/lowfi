import { NextRequest } from 'next/server';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';

/**
 * Verify auth from httpOnly session cookie or Authorization header.
 * Returns the authenticated user ID or null.
 */
export async function verifyAuth(req: NextRequest): Promise<string | null> {
  try {
    // 1. Try httpOnly session cookie first (preferred for browser requests)
    const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
    if (cookieToken) {
      const user = await verifyToken(cookieToken);
      if (user) return user.id;
    }

    // 2. Fall back to Authorization: Bearer header (for programmatic/API calls)
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token && token.split('.').length === 3) {
        const user = await verifyToken(token);
        if (user) return user.id;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Extract and verify user ID from JWT token.
 */
export async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    if (!token || token.split('.').length !== 3) {
      return null;
    }

    const user = await verifyToken(token);
    return user?.id ?? null;
  } catch {
    return null;
  }
}
