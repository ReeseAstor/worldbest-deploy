import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Ember account to continue your writing journey with AI-powered romantasy tools.',
  keywords: ['login', 'sign in', 'ember account', 'writing platform login'],
  alternates: {
    canonical: '/login',
  },
  openGraph: {
    title: 'Sign In | Ember',
    description: 'Sign in to your Ember account to continue your writing journey.',
    url: '/login',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
