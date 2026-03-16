import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  enabled: process.env.NODE_ENV === "production",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  debug: false,
});
