'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Cookie,
  Download,
  Trash2,
  Mail,
  Newspaper,
  Sparkles,
  Megaphone,
  AlertTriangle,
  Loader2,
  Check,
  ChevronRight,
} from 'lucide-react';
import * as Switch from '@radix-ui/react-switch';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/components/auth/auth-provider';
import { useToast } from '@/stores/ui-store';

interface CommunicationPreferences {
  productUpdates: boolean;
  writingTips: boolean;
  marketing: boolean;
}

export default function PrivacySettingsPage() {
  const { user } = useAuth();
  const { toast: showToast } = useToast();
  
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [communications, setCommunications] = useState<CommunicationPreferences>({
    productUpdates: true,
    writingTips: true,
    marketing: false,
  });
  const [isSavingComms, setIsSavingComms] = useState(false);

  const handleExportData = async () => {
    if (!user) return;
    
    setIsExporting(true);
    setExportSuccess(false);
    
    try {
      const response = await fetch('/api/privacy/export', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to export data');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ember-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportSuccess(true);
      showToast({
        type: 'success',
        title: 'Your data has been exported successfully.',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: error instanceof Error ? error.message : 'Failed to export data',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch('/api/privacy/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete account');
      }

      showToast({
        type: 'success',
        title: 'Account deletion scheduled. You will be signed out.',
      });

      // Redirect to home after short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      showToast({
        type: 'error',
        title: error instanceof Error ? error.message : 'Failed to delete account',
      });
      setIsDeleting(false);
    }
  };

  const handleCommunicationChange = async (
    key: keyof CommunicationPreferences,
    value: boolean
  ) => {
    const newPrefs = { ...communications, [key]: value };
    setCommunications(newPrefs);
    
    setIsSavingComms(true);
    
    try {
      // TODO: Save to backend when API is ready
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      showToast({
        type: 'success',
        title: 'Preferences updated',
      });
    } catch {
      // Revert on error
      setCommunications(communications);
      showToast({
        type: 'error',
        title: 'Failed to update preferences',
      });
    } finally {
      setIsSavingComms(false);
    }
  };

  const openCookieSettings = () => {
    // Clear cookie consent to re-show banner
    localStorage.removeItem('ember_cookie_consent');
    document.cookie = 'ember_cookie_consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
          Privacy Settings
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Manage your privacy preferences and data
        </p>
      </div>

      {/* Cookie Preferences */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30">
            <Cookie className="h-6 w-6 text-rose-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Cookie Preferences
            </h2>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Manage how we use cookies on your device
            </p>
          </div>
          <button
            onClick={openCookieSettings}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Manage Cookies
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </motion.section>

      {/* Data Export */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
            <Download className="h-6 w-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Data Export
            </h2>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Download a copy of all your data including projects, chapters, settings, and profile information.
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
              Note: You can request an export once per hour.
            </p>
          </div>
          <button
            onClick={handleExportData}
            disabled={isExporting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : exportSuccess ? (
              <>
                <Check className="h-4 w-4" />
                Downloaded
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download My Data
              </>
            )}
          </button>
        </div>
      </motion.section>

      {/* Communication Preferences */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
            <Mail className="h-6 w-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Communication Preferences
            </h2>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Choose what emails you&apos;d like to receive from us
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Product Updates */}
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <Newspaper className="h-5 w-5 text-zinc-400" />
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">
                  Product Updates
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  New features, improvements, and announcements
                </p>
              </div>
            </div>
            <Switch.Root
              checked={communications.productUpdates}
              onCheckedChange={(v) => handleCommunicationChange('productUpdates', v)}
              disabled={isSavingComms}
              className="relative h-6 w-11 cursor-pointer rounded-full bg-zinc-200 transition-colors data-[state=checked]:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-700"
            >
              <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-lg transition-transform data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
          </div>

          {/* Writing Tips */}
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-zinc-400" />
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">
                  Writing Tips
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Craft tips, inspiration, and author resources
                </p>
              </div>
            </div>
            <Switch.Root
              checked={communications.writingTips}
              onCheckedChange={(v) => handleCommunicationChange('writingTips', v)}
              disabled={isSavingComms}
              className="relative h-6 w-11 cursor-pointer rounded-full bg-zinc-200 transition-colors data-[state=checked]:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-700"
            >
              <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-lg transition-transform data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
          </div>

          {/* Marketing */}
          <div className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <Megaphone className="h-5 w-5 text-zinc-400" />
              <div>
                <p className="font-medium text-zinc-900 dark:text-white">
                  Marketing & Promotions
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Special offers, discounts, and partner content
                </p>
              </div>
            </div>
            <Switch.Root
              checked={communications.marketing}
              onCheckedChange={(v) => handleCommunicationChange('marketing', v)}
              disabled={isSavingComms}
              className="relative h-6 w-11 cursor-pointer rounded-full bg-zinc-200 transition-colors data-[state=checked]:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-700"
            >
              <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-lg transition-transform data-[state=checked]:translate-x-[22px]" />
            </Switch.Root>
          </div>
        </div>
      </motion.section>

      {/* Account Deletion */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-900/10"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
            <Trash2 className="h-6 w-6 text-red-500" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-100">
              Delete Account
            </h2>
            <p className="mt-1 text-red-700 dark:text-red-300">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              Your data will be scheduled for deletion in 30 days. You can cancel this during the grace period.
            </p>
          </div>
          <Dialog.Root open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
            <Dialog.Trigger asChild>
              <button className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30">
                <Trash2 className="h-4 w-4" />
                Delete My Account
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
              <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <Dialog.Title className="text-xl font-semibold text-zinc-900 dark:text-white">
                    Delete Account
                  </Dialog.Title>
                </div>

                <Dialog.Description className="mb-4 text-zinc-600 dark:text-zinc-400">
                  This action will permanently delete your account and all associated data including:
                </Dialog.Description>

                <ul className="mb-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    All projects and chapters
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Voice profiles and series bibles
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Account settings and preferences
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Subscription and billing history
                  </li>
                </ul>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Type <span className="font-mono text-red-500">DELETE</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    placeholder="DELETE"
                  />
                </div>

                <div className="flex gap-3">
                  <Dialog.Close asChild>
                    <button className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                    className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deleting...
                      </span>
                    ) : (
                      'Delete Account'
                    )}
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </motion.section>

      {/* Privacy Policy Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-4 text-sm text-zinc-500 dark:text-zinc-400"
      >
        <a
          href="/privacy"
          className="inline-flex items-center gap-1 hover:text-rose-500 hover:underline"
        >
          <Shield className="h-4 w-4" />
          Privacy Policy
        </a>
        <span>•</span>
        <a
          href="/terms"
          className="hover:text-rose-500 hover:underline"
        >
          Terms of Service
        </a>
        <span>•</span>
        <a
          href="mailto:privacy@88away.com"
          className="hover:text-rose-500 hover:underline"
        >
          Contact DPO
        </a>
      </motion.div>
    </div>
  );
}
