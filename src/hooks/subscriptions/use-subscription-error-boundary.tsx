'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary for Real-time Subscription hooks
 * 
 * Catches errors from Supabase real-time subscriptions and provides
 * graceful degradation. The app continues to work without real-time
 * updates if subscriptions fail.
 * 
 * Usage:
 * ```tsx
 * <SubscriptionErrorBoundary>
 *   <ComponentWithSubscriptions />
 * </SubscriptionErrorBoundary>
 * ```
 */
export class SubscriptionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging
    console.error('Subscription Error:', error);
    console.error('Error Info:', errorInfo);
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return fallback UI or children (graceful degradation)
      return this.props.fallback ?? this.props.children;
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with subscription error boundary
 */
export function withSubscriptionErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithSubscriptionErrorBoundary(props: P) {
    return (
      <SubscriptionErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </SubscriptionErrorBoundary>
    );
  };
}
