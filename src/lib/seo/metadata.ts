import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://88away.com';

interface PageMetadataOptions {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  ogImage?: string;
  keywords?: string[];
}

/**
 * Creates consistent metadata objects for any page
 * Handles title template, OG images, canonical URLs, and robots directives
 */
export function createPageMetadata({
  title,
  description,
  path = '/',
  noIndex = false,
  ogImage = '/og-image.png',
  keywords = [],
}: PageMetadataOptions): Metadata {
  const url = `${BASE_URL}${path}`;

  const metadata: Metadata = {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${title} | Ember`,
      description,
      url: path,
      siteName: 'Ember',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Ember`,
      description,
      images: [ogImage],
    },
  };

  // Add keywords if provided
  if (keywords.length > 0) {
    metadata.keywords = keywords;
  }

  // Handle noindex pages (dashboard, onboarding, etc.)
  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    };
  }

  return metadata;
}

/**
 * Pre-defined metadata for common pages
 */
export const pageMetadata = {
  login: createPageMetadata({
    title: 'Sign In',
    description: 'Sign in to your Ember account to continue your writing journey with AI-powered romantasy tools.',
    path: '/login',
    keywords: ['login', 'sign in', 'ember account', 'writing platform login'],
  }),

  signup: createPageMetadata({
    title: 'Create Account',
    description: 'Join Ember today and start writing your next bestseller with AI-powered tools for romance and fantasy authors.',
    path: '/signup',
    keywords: ['signup', 'create account', 'join ember', 'writing platform'],
  }),

  dashboard: createPageMetadata({
    title: 'Dashboard',
    description: 'Manage your writing projects, track progress, and access AI writing tools.',
    path: '/dashboard',
    noIndex: true,
  }),

  onboarding: createPageMetadata({
    title: 'Getting Started',
    description: 'Set up your Ember account and writing preferences.',
    path: '/onboarding',
    noIndex: true,
  }),

  blog: createPageMetadata({
    title: 'Blog',
    description: 'Writing tips, industry insights, and updates from the Ember team for romance and fantasy authors.',
    path: '/blog',
    keywords: ['writing blog', 'author tips', 'romantasy writing', 'publishing advice'],
  }),
};

export { BASE_URL };
