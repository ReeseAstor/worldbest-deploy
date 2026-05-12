'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { type PlanName, PLAN_LIMITS, type PlanLimits } from '@/lib/stripe/config';

export interface SubscriptionState {
  plan: PlanName;
  status: string;
  isActive: boolean;
  isPro: boolean;
  limits: PlanLimits;
  loading: boolean;
  error: string | null;
  stripeCustomerId: string | null;
  subscriptionId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  interval: 'monthly' | 'annual' | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing user subscription status
 * 
 * Usage:
 * ```tsx
 * const { plan, isPro, limits, loading } = useSubscription();
 * 
 * if (loading) return <Spinner />;
 * 
 * if (!isPro && limits.aiPromptsPerDay !== -1) {
 *   // Show upgrade prompt
 * }
 * ```
 */
export function useSubscription(): SubscriptionState {
  const [state, setState] = useState<Omit<SubscriptionState, 'refresh'>>({
    plan: 'spark',
    status: 'free',
    isActive: true,
    isPro: false,
    limits: PLAN_LIMITS.spark,
    loading: true,
    error: null,
    stripeCustomerId: null,
    subscriptionId: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    interval: null,
  });

  const fetchSubscription = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const supabase = createClient();
      
      // Get the current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Not authenticated',
        }));
        return;
      }

      // Fetch the user's profile with subscription data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          subscription_plan,
          subscription_status,
          subscription_interval,
          subscription_current_period_start,
          subscription_current_period_end,
          subscription_cancel_at_period_end,
          stripe_customer_id,
          stripe_subscription_id,
          is_pro
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        // If profile doesn't exist or has no subscription columns, default to free
        setState(prev => ({
          ...prev,
          loading: false,
        }));
        return;
      }

      const plan = (profile?.subscription_plan as PlanName) || 'spark';
      const status = profile?.subscription_status || 'free';
      const isActive = ['active', 'trialing', 'free'].includes(status);
      const isPro = isActive && plan !== 'spark';

      setState({
        plan,
        status,
        isActive,
        isPro,
        limits: PLAN_LIMITS[plan] || PLAN_LIMITS.spark,
        loading: false,
        error: null,
        stripeCustomerId: profile?.stripe_customer_id || null,
        subscriptionId: profile?.stripe_subscription_id || null,
        currentPeriodStart: profile?.subscription_current_period_start 
          ? new Date(profile.subscription_current_period_start) 
          : null,
        currentPeriodEnd: profile?.subscription_current_period_end 
          ? new Date(profile.subscription_current_period_end) 
          : null,
        cancelAtPeriodEnd: profile?.subscription_cancel_at_period_end || false,
        interval: profile?.subscription_interval as 'monthly' | 'annual' | null,
      });
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load subscription',
      }));
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    ...state,
    refresh: fetchSubscription,
  };
}

/**
 * Helper hook to check if user can perform an action based on their plan
 */
export function useCanPerformAction(
  action: keyof Pick<PlanLimits, 'projects' | 'aiPromptsPerDay' | 'voiceProfiles' | 'teamSeats'>,
  currentCount: number
): { canPerform: boolean; limit: number; isUnlimited: boolean; remaining: number } {
  const { limits } = useSubscription();
  const limit = limits[action];
  const isUnlimited = limit === -1;
  const canPerform = isUnlimited || currentCount < limit;
  const remaining = isUnlimited ? Infinity : Math.max(0, limit - currentCount);

  return { canPerform, limit, isUnlimited, remaining };
}

/**
 * Helper hook to check if user has access to a feature
 */
export function useHasFeature(
  feature: keyof Pick<PlanLimits, 'kdpExport' | 'apiAccess' | 'prioritySupport' | 'customVoiceProfiles'>
): boolean {
  const { limits } = useSubscription();
  return limits[feature];
}

/**
 * Helper hook to check if user has access to a steam level
 */
export function useCanUseSteamLevel(level: number): boolean {
  const { limits } = useSubscription();
  return limits.steamLevels.includes(level);
}

export default useSubscription;
