/**
 * Unified Analytics Interface
 * 
 * Wraps GA4 and optional Mixpanel integrations into a single API.
 * Gracefully degrades when analytics keys aren't configured.
 */

import {
  initGA4,
  trackGA4Event,
  trackGA4PageView,
  setGA4User,
  clearGA4User,
} from './ga4';

export * from './events';

// Analytics configuration
interface AnalyticsConfig {
  ga4MeasurementId?: string;
  mixpanelToken?: string;
  debug?: boolean;
}

// User traits for identification
export interface UserTraits {
  email?: string;
  name?: string;
  plan?: string;
  created_at?: string;
  [key: string]: string | number | boolean | undefined;
}

// Check if analytics are configured
const isAnalyticsEnabled = (): boolean => {
  return !!(
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ||
    process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
  );
};

// Track initialization state
let analyticsInitialized = false;

/**
 * Initialize all analytics providers
 * Call this once at app startup
 */
export function initAnalytics(config?: AnalyticsConfig): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (analyticsInitialized) {
    console.warn('[Analytics] Already initialized');
    return;
  }

  const ga4Id = config?.ga4MeasurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const mixpanelToken = config?.mixpanelToken || process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  const debug = config?.debug ?? process.env.NODE_ENV === 'development';

  // Initialize GA4
  if (ga4Id) {
    initGA4(ga4Id);
  }

  // Initialize Mixpanel (placeholder for future implementation)
  if (mixpanelToken) {
    if (debug) {
      console.log('[Analytics] Mixpanel token configured (integration pending)');
    }
    // TODO: Add Mixpanel initialization when needed
    // mixpanel.init(mixpanelToken);
  }

  analyticsInitialized = true;

  if (debug) {
    console.log('[Analytics] Initialized', {
      ga4: !!ga4Id,
      mixpanel: !!mixpanelToken,
    });
  }
}

/**
 * Track a custom event
 * Sends to all configured analytics providers
 * 
 * @param name - Event name
 * @param properties - Optional event properties
 * 
 * @example
 * ```ts
 * trackEvent('button_click', { button_id: 'cta_hero' });
 * ```
 */
export function trackEvent(
  name: string,
  properties?: Record<string, unknown>
): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (!isAnalyticsEnabled()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Event (disabled):', name, properties);
    }
    return;
  }

  // Track in GA4
  if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    trackGA4Event(name, properties);
  }

  // Track in Mixpanel (when implemented)
  // if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
  //   mixpanel.track(name, properties);
  // }
}

/**
 * Track a page view
 * Sends to all configured analytics providers
 * 
 * @param path - Page path (e.g., '/dashboard')
 * @param title - Optional page title
 * 
 * @example
 * ```ts
 * trackPageView('/dashboard', 'Dashboard');
 * ```
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (!isAnalyticsEnabled()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Page view (disabled):', path, title);
    }
    return;
  }

  // Track in GA4
  if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    trackGA4PageView(path, title);
  }

  // Track in Mixpanel (when implemented)
  // if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
  //   mixpanel.track('Page View', { path, title });
  // }
}

/**
 * Identify an authenticated user
 * Associates all future events with this user
 * 
 * @param userId - Unique user identifier
 * @param traits - Optional user traits/properties
 * 
 * @example
 * ```ts
 * identifyUser('user_123', {
 *   email: 'user@example.com',
 *   plan: 'pro',
 * });
 * ```
 */
export function identifyUser(userId: string, traits?: UserTraits): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (!isAnalyticsEnabled()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Identify (disabled):', userId, traits);
    }
    return;
  }

  // Identify in GA4
  if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    setGA4User(userId, traits as Record<string, string | number | boolean>);
  }

  // Identify in Mixpanel (when implemented)
  // if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
  //   mixpanel.identify(userId);
  //   mixpanel.people.set(traits);
  // }
}

/**
 * Clear user identity
 * Call this on user logout
 * 
 * @example
 * ```ts
 * // In logout handler
 * resetUser();
 * ```
 */
export function resetUser(): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (!isAnalyticsEnabled()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Reset user (disabled)');
    }
    return;
  }

  // Clear GA4 user
  if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    clearGA4User();
  }

  // Reset Mixpanel (when implemented)
  // if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
  //   mixpanel.reset();
  // }
}

/**
 * Check if analytics is enabled and configured
 */
export function isEnabled(): boolean {
  return isAnalyticsEnabled();
}

/**
 * Check if analytics has been initialized
 */
export function isInitialized(): boolean {
  return analyticsInitialized;
}
