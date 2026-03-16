/**
 * Plan Feature Matrix
 * Defines what features are available for each plan.
 * 
 * NOTE: Pricing and high-level limits (documents, team members) are in lib/plans.ts.
 * This file defines granular boolean feature flags for campaign/advanced features.
 * Use plans.ts for billing and plan-features.ts for feature gating.
 */

import type { PlanType as BasePlanType } from '@/lib/plans';

export type PlanType = BasePlanType;

export interface PlanFeatures {
  // Campaign limits
  maxCampaigns: number;
  maxSequenceEmails: number;
  maxRecipients: number;

  // Core features
  recipientManagement: boolean;
  templateManagement: boolean;
  basicAnalytics: boolean;

  // Advanced features
  advancedScheduling: boolean;
  recurringCampaigns: boolean;
  sendTimeOptimization: boolean;

  // A/B Testing
  abTesting: boolean;
  multivariantTesting: boolean;

  // Content Editor
  richTextEditor: boolean;
  htmlEditor: boolean;
  dragDropBuilder: boolean;
  templateBlocks: boolean;

  // Analytics
  advancedAnalytics: boolean;
  customDateRanges: boolean;
  reportExport: boolean;
  deviceTracking: boolean;
  geoTracking: boolean;

  // Automation
  campaignAutomation: boolean;
  triggerBasedCampaigns: boolean;
  behaviorSequences: boolean;
  leadScoring: boolean;
  customWebhooks: boolean;

  // Integrations
  crmIntegrations: boolean;
  hubspotIntegration: boolean;
  salesforceIntegration: boolean;
  slackIntegration: boolean;
  zapierIntegration: boolean;

  // Compliance
  spfDkimVerification: boolean;
  warmupSequences: boolean;
  spamScoreChecker: boolean;
  gdprHelpers: boolean;

  // Team features
  teamCollaboration: boolean;
  roleBasedAccess: boolean;
  approvalWorkflows: boolean;
  campaignSharing: boolean;
  auditTrail: boolean;

  // Notifications
  advancedNotifications: boolean;
  slackNotifications: boolean;
  customAlerts: boolean;

  // API & Development
  apiAccess: boolean;
  webhookSupport: boolean;
}

const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  starter: {
    // Limits (generous for $29/month)
    maxCampaigns: 10,
    maxSequenceEmails: 3,
    maxRecipients: 1000,

    // Core features - All plans get these
    recipientManagement: true,
    templateManagement: true,
    basicAnalytics: true,

    // Advanced features - Limited in Starter
    advancedScheduling: false,
    recurringCampaigns: false,
    sendTimeOptimization: false,

    // A/B Testing - NOT in Starter
    abTesting: false,
    multivariantTesting: false,

    // Content Editor - Basic in Starter
    richTextEditor: true,
    htmlEditor: false,
    dragDropBuilder: false,
    templateBlocks: false,

    // Analytics
    advancedAnalytics: false,
    customDateRanges: false,
    reportExport: false,
    deviceTracking: false,
    geoTracking: false,

    // Automation
    campaignAutomation: false,
    triggerBasedCampaigns: false,
    behaviorSequences: false,
    leadScoring: false,
    customWebhooks: false,

    // Integrations
    crmIntegrations: false,
    hubspotIntegration: false,
    salesforceIntegration: false,
    slackIntegration: false,
    zapierIntegration: false,

    // Compliance
    spfDkimVerification: true,
    warmupSequences: false,
    spamScoreChecker: true,
    gdprHelpers: true,

    // Team features
    teamCollaboration: true,
    roleBasedAccess: false,
    approvalWorkflows: false,
    campaignSharing: false,
    auditTrail: false,

    // Notifications
    advancedNotifications: false,
    slackNotifications: false,
    customAlerts: false,

    // API & Development
    apiAccess: false,
    webhookSupport: false,
  },

  professional: {
    // Limits (generous - $79/month)
    maxCampaigns: 50,
    maxSequenceEmails: 10,
    maxRecipients: 50000,

    // Core features - All plans get these
    recipientManagement: true,
    templateManagement: true,
    basicAnalytics: true,

    // Advanced features
    advancedScheduling: true,
    recurringCampaigns: true,
    sendTimeOptimization: true,

    // A/B Testing
    abTesting: true,
    multivariantTesting: false, // Enterprise only

    // Content Editor
    richTextEditor: true,
    htmlEditor: true,
    dragDropBuilder: true,
    templateBlocks: true,

    // Analytics
    advancedAnalytics: true,
    customDateRanges: true,
    reportExport: true,
    deviceTracking: true,
    geoTracking: false, // Enterprise only

    // Automation
    campaignAutomation: true,
    triggerBasedCampaigns: true,
    behaviorSequences: true,
    leadScoring: false, // Enterprise only
    customWebhooks: true,

    // Integrations
    crmIntegrations: true,
    hubspotIntegration: true,
    salesforceIntegration: false, // Enterprise only
    slackIntegration: true,
    zapierIntegration: false, // Enterprise only

    // Compliance
    spfDkimVerification: true,
    warmupSequences: true,
    spamScoreChecker: true,
    gdprHelpers: true,

    // Team features
    teamCollaboration: true,
    roleBasedAccess: true,
    approvalWorkflows: true,
    campaignSharing: true,
    auditTrail: true,

    // Notifications
    advancedNotifications: true,
    slackNotifications: true,
    customAlerts: true,

    // API & Development
    apiAccess: false,
    webhookSupport: false,
  },

  enterprise: {
    // Limits (unlimited - $199+/month)
    maxCampaigns: Infinity,
    maxSequenceEmails: Infinity,
    maxRecipients: Infinity,

    // Core features - All plans get these
    recipientManagement: true,
    templateManagement: true,
    basicAnalytics: true,

    // Advanced features
    advancedScheduling: true,
    recurringCampaigns: true,
    sendTimeOptimization: true,

    // A/B Testing
    abTesting: true,
    multivariantTesting: true, // Enterprise only

    // Content Editor
    richTextEditor: true,
    htmlEditor: true,
    dragDropBuilder: true,
    templateBlocks: true,

    // Analytics
    advancedAnalytics: true,
    customDateRanges: true,
    reportExport: true,
    deviceTracking: true,
    geoTracking: true, // Enterprise only

    // Automation
    campaignAutomation: true,
    triggerBasedCampaigns: true,
    behaviorSequences: true,
    leadScoring: true,
    customWebhooks: true,

    // Integrations
    crmIntegrations: true,
    hubspotIntegration: true,
    salesforceIntegration: true,
    slackIntegration: true,
    zapierIntegration: true,

    // Compliance
    spfDkimVerification: true,
    warmupSequences: true,
    spamScoreChecker: true,
    gdprHelpers: true,

    // Team features
    teamCollaboration: true,
    roleBasedAccess: true,
    approvalWorkflows: true,
    campaignSharing: true,
    auditTrail: true,

    // Notifications
    advancedNotifications: true,
    slackNotifications: true,
    customAlerts: true,

    // API & Development
    apiAccess: true,
    webhookSupport: true,
  },
};

export function getPlanFeatures(plan: PlanType): PlanFeatures {
  return PLAN_FEATURES[plan] || PLAN_FEATURES.starter;
}

export function hasFeature(plan: PlanType, feature: keyof PlanFeatures): boolean {
  const features = getPlanFeatures(plan);
  const value = features[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  return false;
}

export function checkFeatureAccess(plan: PlanType, feature: keyof PlanFeatures): {
  allowed: boolean;
  message?: string;
} {
  if (hasFeature(plan, feature)) {
    return { allowed: true };
  }

  const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
  return {
    allowed: false,
    message: `This feature is not available on the ${planName} plan. Please upgrade to access it.`,
  };
}

export function getUpgradePrompt(currentPlan: PlanType, feature: keyof PlanFeatures): string {
  const planFeatures = PLAN_FEATURES;
  
  // Find the minimum plan that has this feature
  for (const plan of ['professional', 'enterprise'] as const) {
    if (plan !== currentPlan && hasFeature(plan, feature)) {
      return `Upgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan to unlock this feature`;
    }
  }

  return 'This feature is not available on your plan';
}
