import * as Sentry from '@sentry/nextjs';

/**
 * Analytics Tracking Utility
 * Tracks user actions and business metrics
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
}

class AnalyticsTracker {
  /**
   * Track a custom event
   */
  trackEvent(event: AnalyticsEvent) {
    const { name, properties = {}, userId } = event;

    // Send to Sentry for performance monitoring
    Sentry.captureMessage(`Analytics: ${name}`, {
      level: 'info',
      tags: {
        'event.name': name,
        'user.id': userId,
      },
      extra: properties,
    });

    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, {
        ...properties,
        user_id: userId,
      });
    }

    // Local logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${name}`, properties);
    }
  }

  /**
   * Track user signup/registration
   */
  trackSignup(userId: string, email: string) {
    Sentry.setUser({ id: userId, email });
    this.trackEvent({
      name: 'user_signup',
      properties: { email },
      userId,
    });
  }

  /**
   * Track user login
   */
  trackLogin(userId: string, email: string) {
    Sentry.setUser({ id: userId, email });
    this.trackEvent({
      name: 'user_login',
      properties: { email },
      userId,
    });
  }

  /**
   * Track user logout
   */
  trackLogout(userId?: string) {
    this.trackEvent({
      name: 'user_logout',
      userId,
    });
    Sentry.setUser(null);
  }

  /**
   * Track campaign creation
   */
  trackCampaignCreated(userId: string, campaignId: string, type: string) {
    this.trackEvent({
      name: 'campaign_created',
      properties: {
        campaign_id: campaignId,
        campaign_type: type,
      },
      userId,
    });
  }

  /**
   * Track campaign sent
   */
  trackCampaignSent(userId: string, campaignId: string, recipientCount: number) {
    this.trackEvent({
      name: 'campaign_sent',
      properties: {
        campaign_id: campaignId,
        recipient_count: recipientCount,
      },
      userId,
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(userId: string, featureName: string, metadata?: Record<string, any>) {
    this.trackEvent({
      name: 'feature_used',
      properties: {
        feature_name: featureName,
        ...metadata,
      },
      userId,
    });
  }

  /**
   * Track errors
   */
  trackError(userId: string, errorName: string, errorMessage: string, severity: 'low' | 'medium' | 'high' = 'medium') {
    Sentry.captureException(new Error(errorMessage), {
      level: severity === 'high' ? 'fatal' : severity === 'medium' ? 'error' : 'warning',
      tags: {
        'error.name': errorName,
        'user.id': userId,
      },
    });

    this.trackEvent({
      name: 'error_occurred',
      properties: {
        error_name: errorName,
        error_message: errorMessage,
        severity,
      },
      userId,
    });
  }

  /**
   * Set user context for all subsequent events
   */
  setUser(userId: string, email?: string, metadata?: Record<string, any>) {
    Sentry.setUser({
      id: userId,
      email,
      ...metadata,
    });

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('set', { 'user_id': userId });
    }
  }

  /**
   * Clear user context
   */
  clearUser() {
    Sentry.setUser(null);
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('set', { 'user_id': null });
    }
  }
}

export const analytics = new AnalyticsTracker();
