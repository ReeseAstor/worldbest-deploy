/**
 * Monitoring Utility
 * 
 * Provides a clean API for error tracking and performance monitoring
 * with Sentry integration. Gracefully handles cases where Sentry is
 * not configured.
 */

import * as Sentry from "@sentry/nextjs";

// Check if Sentry is configured
const isSentryEnabled = !!process.env.NEXT_PUBLIC_SENTRY_DSN;

/**
 * User context for error tracking
 */
export interface MonitoringUser {
  id: string;
  email?: string;
  username?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Additional context for error tracking
 */
export interface ErrorContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  level?: "fatal" | "error" | "warning" | "info" | "debug";
  fingerprint?: string[];
}

/**
 * Tags for performance tracking
 */
export interface PerformanceTags {
  [key: string]: string | number | boolean;
}

/**
 * Track an error and report it to Sentry
 * 
 * @param error - The error to track
 * @param context - Optional additional context
 * 
 * @example
 * ```ts
 * try {
 *   await someOperation();
 * } catch (error) {
 *   trackError(error, {
 *     tags: { component: 'UserProfile' },
 *     extra: { userId: '123' }
 *   });
 * }
 * ```
 */
export function trackError(
  error: Error | string | unknown,
  context?: ErrorContext
): void {
  // Always log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("[Monitoring] Error tracked:", error, context);
  }

  if (!isSentryEnabled) {
    return;
  }

  const errorToReport = error instanceof Error 
    ? error 
    : new Error(String(error));

  Sentry.withScope((scope) => {
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    if (context?.level) {
      scope.setLevel(context.level);
    }

    if (context?.fingerprint) {
      scope.setFingerprint(context.fingerprint);
    }

    Sentry.captureException(errorToReport);
  });
}

/**
 * Track a custom message/event
 * 
 * @param message - The message to track
 * @param level - Severity level
 * @param context - Optional additional context
 * 
 * @example
 * ```ts
 * trackMessage('User completed onboarding', 'info', {
 *   tags: { flow: 'onboarding' }
 * });
 * ```
 */
export function trackMessage(
  message: string,
  level: "fatal" | "error" | "warning" | "info" | "debug" = "info",
  context?: Omit<ErrorContext, "level">
): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Monitoring] ${level.toUpperCase()}: ${message}`, context);
  }

  if (!isSentryEnabled) {
    return;
  }

  Sentry.withScope((scope) => {
    scope.setLevel(level);

    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }

    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }

    Sentry.captureMessage(message);
  });
}

/**
 * Track performance metrics
 * 
 * @param name - Name of the operation being measured
 * @param duration - Duration in milliseconds
 * @param tags - Optional tags for categorization
 * 
 * @example
 * ```ts
 * const start = performance.now();
 * await loadData();
 * trackPerformance('data_load', performance.now() - start, {
 *   dataType: 'chapters',
 *   count: 50
 * });
 * ```
 */
export function trackPerformance(
  name: string,
  duration: number,
  tags?: PerformanceTags
): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Monitoring] Performance: ${name} took ${duration.toFixed(2)}ms`, tags);
  }

  if (!isSentryEnabled) {
    return;
  }

  // Use Sentry's performance API to track custom measurements
  Sentry.withScope((scope) => {
    scope.setTag("measurement_name", name);
    scope.setExtra("duration_ms", duration);

    if (tags) {
      Object.entries(tags).forEach(([key, value]) => {
        scope.setTag(key, String(value));
      });
    }

    // Create a breadcrumb for the performance measurement
    Sentry.addBreadcrumb({
      category: "performance",
      message: `${name}: ${duration.toFixed(2)}ms`,
      level: "info",
      data: tags,
    });
  });
}

/**
 * Set the current user context for error tracking
 * Call this after user authentication
 * 
 * @param user - User information
 * 
 * @example
 * ```ts
 * setUser({
 *   id: user.id,
 *   email: user.email,
 *   username: user.name,
 *   plan: user.subscription?.plan
 * });
 * ```
 */
export function setUser(user: MonitoringUser): void {
  if (process.env.NODE_ENV === "development") {
    console.log("[Monitoring] User set:", { id: user.id, email: user.email });
  }

  if (!isSentryEnabled) {
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
  });
}

/**
 * Clear the current user context
 * Call this on user logout
 * 
 * @example
 * ```ts
 * // In logout handler
 * clearUser();
 * ```
 */
export function clearUser(): void {
  if (process.env.NODE_ENV === "development") {
    console.log("[Monitoring] User cleared");
  }

  if (!isSentryEnabled) {
    return;
  }

  Sentry.setUser(null);
}

/**
 * Add a breadcrumb for debugging
 * Breadcrumbs are used to track user actions leading up to an error
 * 
 * @param category - Category of the breadcrumb (e.g., 'navigation', 'ui', 'http')
 * @param message - Description of the action
 * @param data - Optional additional data
 * 
 * @example
 * ```ts
 * addBreadcrumb('ui', 'Button clicked', { buttonId: 'save-draft' });
 * ```
 */
export function addBreadcrumb(
  category: string,
  message: string,
  data?: Record<string, unknown>
): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Monitoring] Breadcrumb: [${category}] ${message}`, data);
  }

  if (!isSentryEnabled) {
    return;
  }

  Sentry.addBreadcrumb({
    category,
    message,
    level: "info",
    data,
  });
}

/**
 * Create a performance span for measuring operations
 * Returns a function to end the span
 * 
 * @param name - Name of the operation
 * @param description - Optional description
 * @returns Function to call when operation completes
 * 
 * @example
 * ```ts
 * const endSpan = startSpan('api_call', 'Fetching user data');
 * const data = await fetchUserData();
 * endSpan();
 * ```
 */
export function startSpan(
  name: string,
  description?: string
): () => void {
  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    trackPerformance(name, duration, description ? { description } : undefined);
  };
}

/**
 * Wrap an async function with automatic error tracking
 * 
 * @param fn - The async function to wrap
 * @param context - Error context to add if the function throws
 * @returns The wrapped function
 * 
 * @example
 * ```ts
 * const safeFetch = withErrorTracking(
 *   async () => fetchData(),
 *   { tags: { operation: 'fetchData' } }
 * );
 * const data = await safeFetch();
 * ```
 */
export function withErrorTracking<T>(
  fn: () => Promise<T>,
  context?: ErrorContext
): () => Promise<T> {
  return async () => {
    try {
      return await fn();
    } catch (error) {
      trackError(error, context);
      throw error;
    }
  };
}

/**
 * Monitoring status check
 * Returns whether Sentry is enabled and configured
 */
export function isMonitoringEnabled(): boolean {
  return isSentryEnabled;
}

// Re-export Sentry for advanced usage
export { Sentry };
