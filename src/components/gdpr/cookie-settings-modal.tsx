'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, BarChart3, Megaphone, Sliders } from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';
import type { CookiePreferences } from './cookie-consent';

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPreferences: CookiePreferences;
  onSave: (preferences: CookiePreferences) => void;
}

interface CookieCategory {
  id: keyof Omit<CookiePreferences, 'version' | 'timestamp'>;
  name: string;
  description: string;
  icon: React.ReactNode;
  required?: boolean;
}

const COOKIE_CATEGORIES: CookieCategory[] = [
  {
    id: 'necessary',
    name: 'Necessary',
    description: 'Essential cookies required for the website to function properly. These cannot be disabled.',
    icon: <Shield className="h-5 w-5" />,
    required: true,
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Help us understand how visitors interact with our website by collecting anonymous information.',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Used to deliver personalized advertisements and measure the effectiveness of ad campaigns.',
    icon: <Megaphone className="h-5 w-5" />,
  },
  {
    id: 'preferences',
    name: 'Preferences',
    description: 'Remember your settings and preferences for a more personalized experience.',
    icon: <Sliders className="h-5 w-5" />,
  },
];

export function CookieSettingsModal({
  isOpen,
  onClose,
  initialPreferences,
  onSave,
}: CookieSettingsModalProps) {
  const [preferences, setPreferences] = useState<CookiePreferences>(initialPreferences);

  const handleToggle = (categoryId: keyof Omit<CookiePreferences, 'version' | 'timestamp'>) => {
    if (categoryId === 'necessary') return; // Cannot toggle necessary cookies
    
    setPreferences((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleSave = () => {
    onSave(preferences);
  };

  const handleAcceptAll = () => {
    onSave({
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
      version: preferences.version,
      timestamp: new Date().toISOString(),
    });
  };

  const handleRejectAll = () => {
    onSave({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
      version: preferences.version,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                  Cookie Settings
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
                <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                  Manage your cookie preferences below. You can change these settings at any time.
                </p>

                <div className="space-y-4">
                  {COOKIE_CATEGORIES.map((category) => (
                    <div
                      key={category.id}
                      className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-500 dark:bg-rose-900/30">
                            {category.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-zinc-900 dark:text-white">
                                {category.name}
                              </h3>
                              {category.required && (
                                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                              {category.description}
                            </p>
                          </div>
                        </div>

                        <Switch.Root
                          checked={preferences[category.id]}
                          onCheckedChange={() => handleToggle(category.id)}
                          disabled={category.required}
                          className="relative h-6 w-11 shrink-0 cursor-pointer rounded-full bg-zinc-200 transition-colors data-[state=checked]:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-700"
                        >
                          <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-lg transition-transform data-[state=checked]:translate-x-[22px]" />
                        </Switch.Root>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-2 border-t border-zinc-200 px-6 py-4 dark:border-zinc-800 sm:flex-row sm:justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={handleRejectAll}
                    className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 sm:flex-none"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 sm:flex-none"
                  >
                    Accept All
                  </button>
                </div>
                <button
                  onClick={handleSave}
                  className="rounded-lg bg-rose-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-rose-600"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
