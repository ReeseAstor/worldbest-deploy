'use client';

/**
 * Analytics Provider
 * 
 * React context provider for analytics functionality.
 * Auto-tracks page views on route changes.
 */

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  initAnalytics,
  trackEvent as rawTrackEvent,
  trackPageView,
  identifyUser as rawIdentifyUser,
  resetUser,
  type UserTraits,
} from './index';

// Analytics context type
interface AnalyticsContextValue {
  trackEvent: (name: string, properties?: Record<string, unknown>) => void;
  identifyUser: (userId: string, traits?: UserTraits) => void;
  resetUser: () => void;
}

// Create context with default no-op functions
const AnalyticsContext = createContext<AnalyticsContextValue>({
  trackEvent: () => {},
  identifyUser: () => {},
  resetUser: () => {},
});

// Provider props
interface AnalyticsProviderProps {
  children: ReactNode;
}

/**
 * Analytics Provider Component
 * 
 * Wraps the application with analytics context and handles:
 * - Analytics initialization on mount
 * - Automatic page view tracking on route changes
 * - Provides trackEvent and identifyUser functions via context
 * 
 * @example
 * ```tsx
 * // In your root layout
 * <AnalyticsProvider>
 *   {children}
 * </AnalyticsProvider>
 * ```
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize analytics on mount
  useEffect(() => {
    initAnalytics();
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (pathname) {
      // Construct full URL with search params
      const url = searchParams?.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
      
      // Get page title from document
      const title = typeof document !== 'undefined' ? document.title : undefined;
      
      trackPageView(url, title);
    }
  }, [pathname, searchParams]);

  // Memoized track event function
  const trackEvent = useCallback(
    (name: string, properties?: Record<string, unknown>) => {
      rawTrackEvent(name, properties);
    },
    []
  );

  // Memoized identify user function
  const identifyUser = useCallback(
    (userId: string, traits?: UserTraits) => {
      rawIdentifyUser(userId, traits);
    },
    []
  );

  // Memoized reset user function
  const handleResetUser = useCallback(() => {
    resetUser();
  }, []);

  return (
    <AnalyticsContext.Provider
      value={{
        trackEvent,
        identifyUser,
        resetUser: handleResetUser,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

/**
 * Hook to access analytics functions
 * 
 * @returns Analytics context with trackEvent and identifyUser functions
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { trackEvent } = useAnalytics();
 *   
 *   const handleClick = () => {
 *     trackEvent('button_click', { button_id: 'cta' });
 *   };
 *   
 *   return <button onClick={handleClick}>Click me</button>;
 * }
 * ```
 */
export function useAnalytics(): AnalyticsContextValue {
  const context = useContext(AnalyticsContext);
  
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  
  return context;
}
