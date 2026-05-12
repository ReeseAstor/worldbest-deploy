// Stripe library exports

// Config exports
export {
  PLANS,
  PLAN_LIMITS,
  FEATURE_COMPARISON,
  getPlanByPriceId,
  getPriceId,
  getIntervalByPriceId,
  getPlanLimits,
  isUnlimited,
  formatLimit,
  type PlanName,
  type BillingInterval,
  type PlanConfig,
  type PlanLimits,
} from './config';

// Client-side exports (use in 'use client' components)
export { getStripe, isStripeConfigured } from './client';

// Note: Server-side exports should be imported directly from './server'
// to avoid importing server code in client bundles
