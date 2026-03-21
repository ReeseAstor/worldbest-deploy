/**
 * Google Analytics 4 Integration
 * 
 * Handles GA4 script loading and event tracking via gtag.
 */

// Extend Window interface for gtag
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

// Track initialization state
let isInitialized = false;

/**
 * Initialize Google Analytics 4
 * Loads the gtag.js script and configures it with the measurement ID
 * 
 * @param measurementId - GA4 Measurement ID (e.g., "G-XXXXXXXXXX")
 */
export function initGA4(measurementId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (isInitialized) {
    console.warn('[GA4] Already initialized');
    return;
  }

  if (!measurementId) {
    console.warn('[GA4] No measurement ID provided');
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  
  // Define gtag function
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer.push(args);
  };

  // Initialize gtag with timestamp
  window.gtag('js', new Date());
  
  // Configure the measurement ID
  window.gtag('config', measurementId, {
    page_path: window.location.pathname,
    send_page_view: false, // We'll manually send page views for better control
  });

  isInitialized = true;

  if (process.env.NODE_ENV === 'development') {
    console.log('[GA4] Initialized with measurement ID:', measurementId);
  }
}

/**
 * Track a custom event in GA4
 * 
 * @param eventName - Name of the event
 * @param params - Event parameters
 */
export function trackGA4Event(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', eventName, params);

  if (process.env.NODE_ENV === 'development') {
    console.log('[GA4] Event tracked:', eventName, params);
  }
}

/**
 * Track a page view in GA4
 * 
 * @param path - Page path
 * @param title - Optional page title
 */
export function trackGA4PageView(path: string, title?: string): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) {
    return;
  }

  window.gtag('config', measurementId, {
    page_path: path,
    page_title: title,
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('[GA4] Page view tracked:', path, title);
  }
}

/**
 * Set user properties in GA4
 * 
 * @param userId - User ID to associate with analytics
 * @param userProperties - Additional user properties
 */
export function setGA4User(
  userId: string,
  userProperties?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  // Set the user ID
  window.gtag('set', { user_id: userId });

  // Set user properties if provided
  if (userProperties) {
    window.gtag('set', 'user_properties', userProperties);
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[GA4] User set:', userId, userProperties);
  }
}

/**
 * Clear user identity from GA4
 */
export function clearGA4User(): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('set', { user_id: null });

  if (process.env.NODE_ENV === 'development') {
    console.log('[GA4] User cleared');
  }
}

/**
 * Check if GA4 is initialized
 */
export function isGA4Initialized(): boolean {
  return isInitialized;
}
