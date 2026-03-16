import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// ─── Configuration ───────────────────────────────────────────────
if (!process.env.JWT_SECRET) {
  throw new Error(
    'FATAL: JWT_SECRET environment variable is not set. ' +
    'Generate one with: openssl rand -base64 64'
  );
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const COOKIE_NAME = 'lowfi-session';
const TOKEN_EXPIRY = '7d';

// Password policy — enforce across all auth flows
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
}

// ─── Password Hashing ───────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password meets security requirements.
 * Returns null if valid, or an error message string.
 */
export function validatePassword(password: string): string | null {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be no more than ${PASSWORD_MAX_LENGTH} characters`;
  }
  return null;
}

// ─── JWT Token Management ────────────────────────────────────────

/**
 * Create a signed JWT for session or purpose-scoped use.
 * @param user   Session user payload
 * @param options.purpose  Optional purpose claim (e.g. 'password-reset')
 * @param options.expiresIn  Override default expiry (e.g. '1h')
 */
export async function createToken(
  user: SessionUser,
  options?: { purpose?: string; expiresIn?: string }
): Promise<string> {
  const jwt = new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name || null,
    ...(options?.purpose && { purpose: options.purpose }),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setJti(crypto.randomUUID()) // unique token ID for revocation support
    .setExpirationTime(options?.expiresIn ?? TOKEN_EXPIRY);

  return jwt.sign(JWT_SECRET);
}

/**
 * Verify a JWT and optionally enforce a required purpose claim.
 * Session tokens have no purpose; reset tokens have purpose='password-reset'.
 * This prevents a session token from being used as a reset token (and vice versa).
 */
export async function verifyToken(
  token: string,
  requiredPurpose?: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.sub || !payload.email) return null;

    // Enforce purpose scope — a session token (no purpose) must not pass
    // when a specific purpose is required, and vice versa.
    const tokenPurpose = (payload.purpose as string) || undefined;
    if (requiredPurpose && tokenPurpose !== requiredPurpose) return null;
    if (!requiredPurpose && tokenPurpose) return null;

    return {
      id: payload.sub,
      email: payload.email as string,
      name: (payload.name as string) || null,
    };
  } catch {
    return null;
  }
}

// ─── Cookie-Based Session ────────────────────────────────────────
export async function createSession(user: SessionUser): Promise<void> {
  const token = await createToken(user);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

// ─── Edge-Compatible Token Verification (for middleware) ─────────
// This function doesn't use cookies() — it takes the raw token string.
// Safe for Edge Runtime.
export async function verifyTokenEdge(token: string): Promise<SessionUser | null> {
  return verifyToken(token);
}

// ─── Input Sanitization ──────────────────────────────────────────

/** Normalize and sanitize an email address. */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().slice(0, 254);
}

/** Basic email format validation. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

/** Sanitize a generic text input (names, company names, etc.) */
export function sanitizeText(input: string, maxLength = 255): string {
  return input.trim().slice(0, maxLength);
}

export { COOKIE_NAME };
