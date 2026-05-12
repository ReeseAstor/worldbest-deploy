'use client';

/**
 * Google Analytics Script Component
 * 
 * Renders GA4 script tags using next/script.
 * Only renders when NEXT_PUBLIC_GA_MEASUREMENT_ID is configured.
 */

import Script from 'next/script';

/**
 * Google Analytics component
 * 
 * Loads the Google Analytics 4 gtag.js script.
 * Uses strategy="afterInteractive" for optimal loading.
 * 
 * @example
 * ```tsx
 * // In your root layout
 * <GoogleAnalytics />
 * ```
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // Don't render if no measurement ID is configured
  if (!measurementId) {
    return null;
  }

  return (
    <>
      {/* Load the gtag.js library */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      {/* Initialize gtag with basic configuration */}
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              send_page_view: false
            });
          `,
        }}
      />
    </>
  );
}
