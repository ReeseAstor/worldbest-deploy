import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join Ember today and start writing your next bestseller with AI-powered tools for romance and fantasy authors.',
  keywords: ['signup', 'create account', 'join ember', 'writing platform registration'],
  alternates: {
    canonical: '/signup',
  },
  openGraph: {
    title: 'Create Account | Ember',
    description: 'Join Ember and start writing your next bestseller with AI-powered tools.',
    url: '/signup',
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
