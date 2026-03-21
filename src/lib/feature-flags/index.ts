/**
 * Feature Flags System for Ember
 * 
 * Environment-based feature flag system with support for:
 * - Environment variable overrides (NEXT_PUBLIC_FF_{FLAG_KEY})
 * - Percentage-based rollouts with consistent user hashing
 * - Default values
 */

export interface FeatureFlag {
  key: string;
  description: string;
  defaultValue: boolean;
  rolloutPercentage?: number; // 0-100, for gradual rollout
}

export const FEATURE_FLAGS = {
  NEW_LANDING_PAGE: { 
    key: 'new_landing_page', 
    description: 'Use the new conversion-optimized landing page', 
    defaultValue: true 
  },
  STRIPE_PAYMENTS: { 
    key: 'stripe_payments', 
    description: 'Enable Stripe payment integration', 
    defaultValue: false 
  },
  AI_ASSISTANT_V2: { 
    key: 'ai_assistant_v2', 
    description: 'Use v2 AI assistant with enhanced prompts', 
    defaultValue: false 
  },
  COLLABORATION: { 
    key: 'collaboration', 
    description: 'Enable real-time collaboration features', 
    defaultValue: false 
  },
  DARK_MODE: { 
    key: 'dark_mode', 
    description: 'Enable dark mode toggle', 
    defaultValue: false 
  },
  BETA_FEATURES: { 
    key: 'beta_features', 
    description: 'Enable beta features for testing', 
    defaultValue: false 
  },
  EXPORT_EPUB: { 
    key: 'export_epub', 
    description: 'Enable ePub export functionality', 
    defaultValue: true 
  },
  ONBOARDING_V2: { 
    key: 'onboarding_v2', 
    description: 'Use new onboarding flow', 
    defaultValue: true 
  },
  ANALYTICS_DASHBOARD: { 
    key: 'analytics_dashboard', 
    description: 'Show admin analytics dashboard', 
    defaultValue: false 
  },
  STEAM_CALIBRATION: { 
    key: 'steam_calibration', 
    description: 'Enable 5-level steam calibration', 
    defaultValue: true 
  },
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

/**
 * Simple hash function to convert a string to a number between 0-100
 * Uses a consistent algorithm so the same userId always gets the same result
 */
function hashToPercentage(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to positive number and get 0-100
  return Math.abs(hash) % 101;
}

/**
 * Get the environment variable name for a flag key
 */
function getEnvVarName(flagKey: string): string {
  return `NEXT_PUBLIC_FF_${flagKey.toUpperCase()}`;
}

/**
 * Check if the env variable override exists and return its value
 */
function getEnvOverride(flagKey: string): boolean | null {
  const envVarName = getEnvVarName(flagKey);
  
  // Check if running in browser or server
  if (typeof window !== 'undefined') {
    // Client-side: use process.env (will be replaced at build time)
    const value = process.env[envVarName];
    if (value === 'true') return true;
    if (value === 'false') return false;
  } else {
    // Server-side
    const value = process.env[envVarName];
    if (value === 'true') return true;
    if (value === 'false') return false;
  }
  
  return null;
}

/**
 * Check if a feature flag is enabled
 * 
 * Order of precedence:
 * 1. Environment variable override (NEXT_PUBLIC_FF_{FLAG_KEY})
 * 2. Rollout percentage check (if userId provided and rolloutPercentage defined)
 * 3. Default value
 */
export function isFeatureEnabled(flagKey: FeatureFlagKey, userId?: string): boolean {
  const flag = FEATURE_FLAGS[flagKey] as FeatureFlag;
  
  if (!flag) {
    console.warn(`[FeatureFlags] Unknown flag key: ${flagKey}`);
    return false;
  }
  
  // 1. Check environment variable override
  const envOverride = getEnvOverride(flag.key);
  if (envOverride !== null) {
    return envOverride;
  }
  
  // 2. Check rollout percentage if applicable
  if (flag.rolloutPercentage !== undefined && userId) {
    const userPercentile = hashToPercentage(`${flag.key}:${userId}`);
    return userPercentile < flag.rolloutPercentage;
  }
  
  // 3. Fall back to default value
  return flag.defaultValue;
}

/**
 * Get all flag states
 */
export function getAllFlags(userId?: string): Record<FeatureFlagKey, boolean> {
  const result = {} as Record<FeatureFlagKey, boolean>;
  
  for (const key of Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]) {
    result[key] = isFeatureEnabled(key, userId);
  }
  
  return result;
}

/**
 * Get only enabled flags
 */
export function getEnabledFlags(userId?: string): FeatureFlagKey[] {
  return (Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]).filter(
    (key) => isFeatureEnabled(key, userId)
  );
}

/**
 * Get flag metadata for admin panel
 */
export function getFlagMetadata(): Array<{
  name: FeatureFlagKey;
  key: string;
  description: string;
  defaultValue: boolean;
  rolloutPercentage?: number;
  envVarName: string;
  envOverride: boolean | null;
}> {
  return (Object.keys(FEATURE_FLAGS) as FeatureFlagKey[]).map((name) => {
    const flag = FEATURE_FLAGS[name] as FeatureFlag;
    return {
      name,
      key: flag.key,
      description: flag.description,
      defaultValue: flag.defaultValue,
      rolloutPercentage: flag.rolloutPercentage,
      envVarName: getEnvVarName(flag.key),
      envOverride: getEnvOverride(flag.key),
    };
  });
}
