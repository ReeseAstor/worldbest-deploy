/**
 * Deployment Runbook Utility for Ember
 * 
 * Contains checklists and procedures for deployment operations.
 */

export const DEPLOYMENT_CHECKLIST = {
  preDeployment: [
    'Run type-check: npm run type-check',
    'Run lint: npm run lint',
    'Run build: npm run build',
    'Review feature flag states for target environment',
    'Verify environment variables are set',
    'Check database migrations are up to date',
    'Review Sentry release version',
  ],
  postDeployment: [
    'Verify health endpoint: GET /api/health',
    'Check Sentry for new errors',
    'Verify critical user flows (signup, login, create project)',
    'Check analytics events are firing',
    'Monitor error rates for 15 minutes',
    'Verify Stripe webhook connectivity (if payments enabled)',
  ],
  rollbackProcedure: [
    'Revert to previous Vercel deployment',
    'Disable new feature flags via environment variables',
    'Monitor error rates post-rollback',
    'Notify team of rollback',
  ],
} as const;

export type DeploymentChecklistCategory = keyof typeof DEPLOYMENT_CHECKLIST;

/**
 * Get all checklist items for a specific category
 */
export function getChecklistByCategory(
  category: DeploymentChecklistCategory
): readonly string[] {
  return DEPLOYMENT_CHECKLIST[category];
}

/**
 * Get the full deployment checklist as a flat array with categories
 */
export function getFullChecklist(): Array<{
  category: DeploymentChecklistCategory;
  categoryLabel: string;
  items: readonly string[];
}> {
  return [
    {
      category: 'preDeployment',
      categoryLabel: 'Pre-Deployment',
      items: DEPLOYMENT_CHECKLIST.preDeployment,
    },
    {
      category: 'postDeployment',
      categoryLabel: 'Post-Deployment',
      items: DEPLOYMENT_CHECKLIST.postDeployment,
    },
    {
      category: 'rollbackProcedure',
      categoryLabel: 'Rollback Procedure',
      items: DEPLOYMENT_CHECKLIST.rollbackProcedure,
    },
  ];
}

/**
 * Feature flag environment variable reference
 */
export const FEATURE_FLAG_ENV_VARS = {
  NEW_LANDING_PAGE: 'NEXT_PUBLIC_FF_NEW_LANDING_PAGE',
  STRIPE_PAYMENTS: 'NEXT_PUBLIC_FF_STRIPE_PAYMENTS',
  AI_ASSISTANT_V2: 'NEXT_PUBLIC_FF_AI_ASSISTANT_V2',
  COLLABORATION: 'NEXT_PUBLIC_FF_COLLABORATION',
  DARK_MODE: 'NEXT_PUBLIC_FF_DARK_MODE',
  BETA_FEATURES: 'NEXT_PUBLIC_FF_BETA_FEATURES',
  EXPORT_EPUB: 'NEXT_PUBLIC_FF_EXPORT_EPUB',
  ONBOARDING_V2: 'NEXT_PUBLIC_FF_ONBOARDING_V2',
  ANALYTICS_DASHBOARD: 'NEXT_PUBLIC_FF_ANALYTICS_DASHBOARD',
  STEAM_CALIBRATION: 'NEXT_PUBLIC_FF_STEAM_CALIBRATION',
} as const;

/**
 * Deployment environments
 */
export const DEPLOYMENT_ENVIRONMENTS = {
  development: {
    name: 'Development',
    url: 'http://localhost:3000',
    healthEndpoint: 'http://localhost:3000/api/health',
  },
  preview: {
    name: 'Preview',
    url: 'https://preview.88away.com',
    healthEndpoint: 'https://preview.88away.com/api/health',
  },
  staging: {
    name: 'Staging',
    url: 'https://staging.88away.com',
    healthEndpoint: 'https://staging.88away.com/api/health',
  },
  production: {
    name: 'Production',
    url: 'https://88away.com',
    healthEndpoint: 'https://88away.com/api/health',
  },
} as const;

export type DeploymentEnvironment = keyof typeof DEPLOYMENT_ENVIRONMENTS;
