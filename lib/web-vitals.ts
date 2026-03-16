import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import * as Sentry from '@sentry/nextjs';

/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals and reports to Sentry
 */

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

function reportMetric(metric: WebVitalsMetric) {
  const { name, value, rating } = metric;

  // Send to Sentry
  Sentry.captureMessage(`Web Vital: ${name} = ${value.toFixed(2)}ms`, {
    level: rating === 'good' ? 'info' : rating === 'needs-improvement' ? 'warning' : 'error',
    tags: {
      'metric.name': name,
      'metric.rating': rating,
    },
    extra: {
      value,
      id: metric.id,
    },
  });

  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'web_vital', {
      metric_id: metric.id,
      metric_name: name,
      metric_value: Math.round(value),
      metric_category: 'Web Vitals',
      metric_rating: rating,
    });
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${name}: ${value.toFixed(2)}ms (${rating})`);
  }
}

/**
 * Initialize Web Vitals monitoring
 * Call this in your layout or page component
 */
export function initializeWebVitals() {
  if (typeof window === 'undefined') return;

  // Cumulative Layout Shift
  onCLS((metric) => reportMetric(metric as WebVitalsMetric));

  // First Contentful Paint
  onFCP((metric) => reportMetric(metric as WebVitalsMetric));

  // Interaction to Next Paint
  onINP((metric) => reportMetric(metric as WebVitalsMetric));

  // Largest Contentful Paint
  onLCP((metric) => reportMetric(metric as WebVitalsMetric));

  // Time to First Byte
  onTTFB((metric) => reportMetric(metric as WebVitalsMetric));
}

/**
 * Performance thresholds for alerting
 * Values in milliseconds
 */
export const PERFORMANCE_THRESHOLDS = {
  // Cumulative Layout Shift (CLS) - target < 0.1
  CLS_GOOD: 0.1,
  CLS_NEEDS_IMPROVEMENT: 0.25,

  // First Contentful Paint (FCP) - target < 1.8s
  FCP_GOOD: 1800,
  FCP_NEEDS_IMPROVEMENT: 3000,

  // Interaction to Next Paint (INP) - target < 200ms
  INP_GOOD: 200,
  INP_NEEDS_IMPROVEMENT: 500,

  // Largest Contentful Paint (LCP) - target < 2.5s
  LCP_GOOD: 2500,
  LCP_NEEDS_IMPROVEMENT: 4000,

  // Time to First Byte (TTFB) - target < 0.6s
  TTFB_GOOD: 600,
  TTFB_NEEDS_IMPROVEMENT: 1800,
};

/**
 * Alert thresholds - trigger alerts if exceeded
 */
export const ALERT_THRESHOLDS = {
  LCP: 4000, // Largest Contentful Paint over 4s
  FCP: 3000, // First Contentful Paint over 3s
  CLS: 0.25, // Layout Shift over 0.25
  INP: 500,  // Interaction to Next Paint over 500ms
  TTFB: 1800, // Time to First Byte over 1.8s
};
