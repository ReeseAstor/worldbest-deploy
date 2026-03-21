import type { Metadata } from 'next';
import { OnboardingLayoutShell } from '@/components/onboarding/onboarding-layout-shell';

export const metadata: Metadata = {
  title: 'Getting Started',
  description: 'Set up your Ember account and writing preferences to get the most out of AI-powered writing tools.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingLayoutShell>{children}</OnboardingLayoutShell>;
}
