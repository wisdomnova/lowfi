import { NextResponse, type NextRequest } from "next/server";
import { verifyTokenEdge, COOKIE_NAME } from "@/lib/auth";

// ─── Rate Limiting ───────────────────────────────────────────────
const RATE_LIMITS = {
  api: { requests: 1000, window: 60000 },     // 1000 req/min general
  auth: { requests: 10, window: 60000 },       // 10 req/min for auth — brute-force protection
  search: { requests: 30, window: 60000 },     // 30 req/min for search
};

// In-memory rate limit store. Works within a single edge instance.
// For multi-instance deployments, swap to Upstash Redis (@upstash/ratelimit).
const rateLimitStore = new Map<string, { count: number; reset: number }>();
let lastCleanup = Date.now();

function checkRateLimit(
  key: string,
  limit: { requests: number; window: number }
): boolean {
  const now = Date.now();

  // Periodic cleanup to prevent memory leak (every 60s)
  if (now - lastCleanup > 60000) {
    for (const [k, v] of rateLimitStore) {
      if (now > v.reset) rateLimitStore.delete(k);
    }
    lastCleanup = now;
  }

  const record = rateLimitStore.get(key);

  if (!record || now > record.reset) {
    rateLimitStore.set(key, { count: 1, reset: now + limit.window });
    return true;
  }

  if (record.count >= limit.requests) {
    return false;
  }

  record.count++;
  return true;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // ─── Rate limiting for API routes ──────────────────────────────
  if (path.startsWith("/api/")) {
    let limit = RATE_LIMITS.api;

    if (path.includes("/auth/")) {
      limit = RATE_LIMITS.auth;
    } else if (path.includes("/search")) {
      limit = RATE_LIMITS.search;
    }

    // Rate limit auth endpoints per-IP (NOT per-IP:per-path)
    // so attackers can't spray across /signin, /signup, /reset-password
    const key = path.includes("/auth/") ? `${ip}:auth` : `${ip}:${path}`;

    if (!checkRateLimit(key, limit)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": "60" },
        }
      );
    }
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // ─── Security Headers ─────────────────────────────────────────
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "0"); // Modern best practice: use CSP instead
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(self)"
  );
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.stripe.com https://*.supabase.co https://*.sentry.io",
      "frame-src 'self' https://js.stripe.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; ")
  );

  // ─── Auth — Protected routes ───────────────────────────────────
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyTokenEdge(token) : null;

  if (path.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (
    path.startsWith("/auth/signin") ||
    path.startsWith("/auth/signup")
  ) {
    if (user) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
