'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Settings, X } from 'lucide-react';
import Cookies from 'js-cookie';
import { CookieSettingsModal } from './cookie-settings-modal';

const CONSENT_COOKIE_NAME = 'ember_cookie_consent';
const CONSENT_VERSION = '1.0';

export interface CookiePreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  version: string;
  timestamp: string;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
  version: CONSENT_VERSION,
  timestamp: new Date().toISOString(),
};

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // Check if consent has been given
    const storedConsent = localStorage.getItem(CONSENT_COOKIE_NAME);
    const cookieConsent = Cookies.get(CONSENT_COOKIE_NAME);

    if (!storedConsent && !cookieConsent) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    } else if (storedConsent) {
      try {
        const parsed = JSON.parse(storedConsent) as CookiePreferences;
        setPreferences(parsed);
      } catch {
        // Invalid stored consent, show banner
        setShowBanner(true);
      }
    }
  }, []);

  const savePreferences = (newPreferences: CookiePreferences) => {
    const consentData = {
      ...newPreferences,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    };

    // Store in both localStorage and cookie
    localStorage.setItem(CONSENT_COOKIE_NAME, JSON.stringify(consentData));
    Cookies.set(CONSENT_COOKIE_NAME, JSON.stringify(consentData), {
      expires: 365,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    setPreferences(consentData);
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleAcceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    });
  };

  const handleNecessaryOnly = () => {
    savePreferences(DEFAULT_PREFERENCES);
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
          >
            <div className="mx-auto max-w-4xl">
              <div className="relative rounded-2xl border border-zinc-200 bg-white/95 p-6 shadow-2xl backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95">
                {/* Close button */}
                <button
                  onClick={handleNecessaryOnly}
                  className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
                  {/* Icon */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
                    <Cookie className="h-6 w-6 text-rose-500" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold text-zinc-900 dark:text-white">
                      We value your privacy
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                      By clicking &quot;Accept All&quot;, you consent to our use of cookies.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <button
                      onClick={handleOpenSettings}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      <Settings className="h-4 w-4" />
                      Cookie Settings
                    </button>
                    <button
                      onClick={handleNecessaryOnly}
                      className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      Necessary Only
                    </button>
                    <button
                      onClick={handleAcceptAll}
                      className="rounded-lg bg-rose-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-600"
                    >
                      Accept All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cookie Settings Modal */}
      <CookieSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        initialPreferences={preferences}
        onSave={savePreferences}
      />
    </>
  );
}

// Export hook to get current cookie preferences
export function useCookiePreferences(): CookiePreferences | null {
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const storedConsent = localStorage.getItem(CONSENT_COOKIE_NAME);
    if (storedConsent) {
      try {
        setPreferences(JSON.parse(storedConsent));
      } catch {
        setPreferences(null);
      }
    }
  }, []);

  return preferences;
}
