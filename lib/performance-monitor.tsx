'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';

/**
 * Performance and Analytics Monitoring
 * Tracks Web Vitals, page navigation, and user interactions
 */

export function PerformanceMonitor() {
  const pathname = usePathname();

  useEffect(() => {
    // Track page view
    Sentry.captureMessage(`Page view: ${pathname}`, 'info');

    // Track Web Vitals
    if ('web-vital' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const value = entry.startTime + entry.duration;
          
          Sentry.captureMessage(
            `Performance: ${entry.name} = ${value.toFixed(2)}ms`,
            'info'
          );

          // Log to analytics if integrated
          if (window.gtag) {
            window.gtag('event', 'page_view', {
              page_path: pathname,
              page_title: document.title,
              performance_metric: entry.name,
              metric_value: value,
            });
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
      } catch (e) {
        // Ignore errors in observer
      }
    }
  }, [pathname]);

  return null;
}

/**
 * Track Core Web Vitals
 */
export function reportWebVitals(metric: any) {
  const { id, name, label, value } = metric;

  // Log to Sentry
  Sentry.captureMessage(`${label}: ${value}`, {
    level: 'info',
    tags: {
      'metric.name': name,
      'metric.id': id,
    },
    extra: {
      value,
    },
  });

  // Log to Google Analytics if available
  if (window.gtag) {
    window.gtag('event', 'web_vital', {
      metric_id: id,
      metric_value: value,
      metric_delta: value,
      metric_category: 'web_vitals',
      metric_label: label,
    });
  }
}
