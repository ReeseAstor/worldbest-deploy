import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://88away.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/projects',
          '/projects/*',
          '/onboarding',
          '/onboarding/*',
          '/settings',
          '/settings/*',
          '/api/',
          '/api/*',
          '/auth/callback',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
