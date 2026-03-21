import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Writing tips, industry insights, and updates from the Ember team for romance and fantasy authors.',
  keywords: ['writing blog', 'author tips', 'romantasy writing', 'publishing advice', 'indie author', 'writing tips'],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'Blog | Ember',
    description: 'Writing tips, industry insights, and updates from the Ember team.',
    url: '/blog',
    type: 'website',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
