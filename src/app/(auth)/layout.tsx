import type { Metadata } from 'next';
import { AuthLayoutShell } from '@/components/auth/auth-layout-shell';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Sign in or create an account to access Ember - AI-powered writing platform for romance and fantasy authors.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayoutShell>{children}</AuthLayoutShell>;
}
