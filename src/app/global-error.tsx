"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-950">
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <svg
                className="mx-auto h-20 w-20 text-rose-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Something went wrong!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              We apologize for the inconvenience. A critical error has occurred 
              and our team has been automatically notified.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => reset()}
                className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-colors"
              >
                Try Again
              </button>
              <a
                href="/"
                className="w-full inline-flex items-center justify-center px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Go to Homepage
              </a>
            </div>
            {error.digest && (
              <p className="mt-6 text-xs text-gray-400">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
