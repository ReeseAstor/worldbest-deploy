/**
 * Stripe Plan Configuration
 * Defines pricing tiers, features, and limits for the subscription plans
 */

export type PlanName = 'spark' | 'flame' | 'inferno';
export type BillingInterval = 'monthly' | 'annual';

export interface PlanConfig {
  name: string;
  displayName: string;
  description: string;
  features: string[];
  monthlyPrice: number;
  annualPrice: number;
  annualSavings: number;
  priceIds: {
    monthly: string | null;
    annual: string | null;
  };
}

export interface PlanLimits {
  projects: number;
  aiPromptsPerDay: number;
  steamLevels: number[];
  voiceProfiles: number;
  teamSeats: number;
  exportFormats: string[];
  kdpExport: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
  customVoiceProfiles: boolean;
}

// Plan configurations with Stripe price IDs from environment variables
export const PLANS: Record<PlanName, PlanConfig> = {
  spark: {
    name: 'spark',
    displayName: 'Spark',
    description: 'Perfect for trying Ember',
    features: [
      '2 projects',
      '10 AI prompts/day',
      'Basic steam levels (1-2)',
      'Community support',
    ],
    monthlyPrice: 0,
    annualPrice: 0,
    annualSavings: 0,
    priceIds: {
      monthly: null, // Free tier - no Stripe product
      annual: null,
    },
  },
  flame: {
    name: 'flame',
    displayName: 'Flame',
    description: 'Solo Author',
    features: [
      '10 projects',
      'Unlimited AI prompts',
      'All 5 steam levels',
      'Voice fingerprinting',
      'KDP export',
      'Email support',
    ],
    monthlyPrice: 39,
    annualPrice: 23, // Per month when billed annually
    annualSavings: 192, // (39-23) * 12
    priceIds: {
      monthly: process.env.STRIPE_FLAME_MONTHLY_PRICE_ID || null,
      annual: process.env.STRIPE_FLAME_ANNUAL_PRICE_ID || null,
    },
  },
  inferno: {
    name: 'inferno',
    displayName: 'Inferno',
    description: 'Pro Creator',
    features: [
      'Unlimited projects',
      'Everything in Flame',
      'Team seats (up to 5)',
      'Custom voice profiles',
      'Priority support',
      'API access',
    ],
    monthlyPrice: 79,
    annualPrice: 63, // Per month when billed annually
    annualSavings: 192, // (79-63) * 12
    priceIds: {
      monthly: process.env.STRIPE_INFERNO_MONTHLY_PRICE_ID || null,
      annual: process.env.STRIPE_INFERNO_ANNUAL_PRICE_ID || null,
    },
  },
};

// Plan limits for each tier
export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  spark: {
    projects: 2,
    aiPromptsPerDay: 10,
    steamLevels: [1, 2],
    voiceProfiles: 0,
    teamSeats: 1,
    exportFormats: ['docx'],
    kdpExport: false,
    apiAccess: false,
    prioritySupport: false,
    customVoiceProfiles: false,
  },
  flame: {
    projects: 10,
    aiPromptsPerDay: -1, // Unlimited
    steamLevels: [1, 2, 3, 4, 5],
    voiceProfiles: 3,
    teamSeats: 1,
    exportFormats: ['docx', 'epub', 'pdf', 'kdp'],
    kdpExport: true,
    apiAccess: false,
    prioritySupport: false,
    customVoiceProfiles: false,
  },
  inferno: {
    projects: -1, // Unlimited
    aiPromptsPerDay: -1, // Unlimited
    steamLevels: [1, 2, 3, 4, 5],
    voiceProfiles: -1, // Unlimited
    teamSeats: 5,
    exportFormats: ['docx', 'epub', 'pdf', 'kdp', 'mobi'],
    kdpExport: true,
    apiAccess: true,
    prioritySupport: true,
    customVoiceProfiles: true,
  },
};

// Helper functions
export function getPlanByPriceId(priceId: string): PlanName | null {
  for (const [planName, config] of Object.entries(PLANS)) {
    if (config.priceIds.monthly === priceId || config.priceIds.annual === priceId) {
      return planName as PlanName;
    }
  }
  return null;
}

export function getPriceId(plan: PlanName, interval: BillingInterval): string | null {
  return PLANS[plan]?.priceIds[interval] || null;
}

export function getIntervalByPriceId(priceId: string): BillingInterval | null {
  for (const config of Object.values(PLANS)) {
    if (config.priceIds.monthly === priceId) return 'monthly';
    if (config.priceIds.annual === priceId) return 'annual';
  }
  return null;
}

export function getPlanLimits(plan: PlanName): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.spark;
}

export function isUnlimited(value: number): boolean {
  return value === -1;
}

export function formatLimit(value: number): string {
  return isUnlimited(value) ? 'Unlimited' : value.toString();
}

// Feature comparison for pricing table
export const FEATURE_COMPARISON = [
  { feature: 'Projects', spark: '2', flame: '10', inferno: 'Unlimited' },
  { feature: 'AI Prompts', spark: '10/day', flame: 'Unlimited', inferno: 'Unlimited' },
  { feature: 'Steam Levels', spark: '1-2', flame: 'All 5', inferno: 'All 5' },
  { feature: 'Voice Fingerprinting', spark: false, flame: true, inferno: true },
  { feature: 'KDP Export', spark: false, flame: true, inferno: true },
  { feature: 'Team Seats', spark: '1', flame: '1', inferno: 'Up to 5' },
  { feature: 'Custom Voice Profiles', spark: false, flame: false, inferno: true },
  { feature: 'API Access', spark: false, flame: false, inferno: true },
  { feature: 'Priority Support', spark: false, flame: false, inferno: true },
];
