'use client';

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { 
  FEATURE_FLAGS, 
  FeatureFlagKey, 
  isFeatureEnabled, 
  getAllFlags 
} from './index';

// Types
type FeatureFlagsState = Record<FeatureFlagKey, boolean>;

interface FeatureFlagContextValue {
  flags: FeatureFlagsState;
  isEnabled: (flagKey: FeatureFlagKey) => boolean;
}

interface FeatureFlagProviderProps {
  children: ReactNode;
  userId?: string;
}

interface FeatureGateProps {
  flag: FeatureFlagKey;
  children: ReactNode;
  fallback?: ReactNode;
}

// Context
const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

/**
 * Feature Flag Provider Component
 * 
 * Wraps children and provides feature flag state via context.
 * Optionally accepts a userId for percentage-based rollouts.
 * 
 * @example
 * <FeatureFlagProvider userId={user?.id}>
 *   <App />
 * </FeatureFlagProvider>
 */
export function FeatureFlagProvider({ children, userId }: FeatureFlagProviderProps) {
  // Compute all flag states once
  const flags = useMemo(() => getAllFlags(userId), [userId]);
  
  // Memoized context value
  const value = useMemo<FeatureFlagContextValue>(() => ({
    flags,
    isEnabled: (flagKey: FeatureFlagKey) => flags[flagKey] ?? false,
  }), [flags]);

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * Hook to check if a specific feature flag is enabled
 * 
 * @example
 * const isStripeEnabled = useFeatureFlag('STRIPE_PAYMENTS');
 * if (isStripeEnabled) {
 *   // Show payment UI
 * }
 */
export function useFeatureFlag(flagKey: FeatureFlagKey): boolean {
  const context = useContext(FeatureFlagContext);
  
  if (!context) {
    // If used outside provider, fall back to direct check
    console.warn('[FeatureFlags] useFeatureFlag used outside FeatureFlagProvider');
    return isFeatureEnabled(flagKey);
  }
  
  return context.isEnabled(flagKey);
}

/**
 * Hook to get all feature flags
 * 
 * @example
 * const flags = useFeatureFlags();
 * if (flags.DARK_MODE) {
 *   // Apply dark mode
 * }
 */
export function useFeatureFlags(): FeatureFlagsState {
  const context = useContext(FeatureFlagContext);
  
  if (!context) {
    // If used outside provider, fall back to direct check
    console.warn('[FeatureFlags] useFeatureFlags used outside FeatureFlagProvider');
    return getAllFlags();
  }
  
  return context.flags;
}

/**
 * Component for conditionally rendering children based on feature flag state
 * 
 * @example
 * // Basic usage
 * <FeatureGate flag="STRIPE_PAYMENTS">
 *   <PricingSection />
 * </FeatureGate>
 * 
 * // With fallback
 * <FeatureGate flag="DARK_MODE" fallback={<LightModeOnly />}>
 *   <DarkModeToggle />
 * </FeatureGate>
 */
export function FeatureGate({ flag, children, fallback = null }: FeatureGateProps) {
  const isEnabled = useFeatureFlag(flag);
  
  if (isEnabled) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
}

// Re-export types and constants for convenience
export { FEATURE_FLAGS, type FeatureFlagKey, type FeatureFlagsState };
