import type { Metadata } from 'next';
import { Inter, Merriweather } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';
import { CookieConsent } from '@/components/gdpr';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const merriweather = Merriweather({ 
  weight: ['400', '700'], 
  subsets: ['latin'], 
  variable: '--font-serif' 
});

export const metadata: Metadata = {
  title: {
    template: '%s | Ember - AI Writing Platform',
    default: 'Ember - AI-Powered Romantasy Ghostwriting Platform',
  },
  description: 'AI-powered writing platform for romance & fantasy authors. Steam calibration, voice fingerprinting, series bible & KDP export.',
  keywords: [
    'romantasy',
    'romance writing',
    'AI ghostwriting',
    'steamy romance',
    'dark romance',
    'paranormal romance',
    'steam calibration',
    'series bible',
    'KDP publishing',
    'book writing software',
    'romance author tools',
    'indie author tools',
    'AI writing assistant',
    'fiction writing software',
  ],
  authors: [{ name: '88Away LLC' }],
  creator: 'Ember',
  publisher: '88Away LLC',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://88away.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Ember - AI-Powered Romantasy Ghostwriting Platform',
    description: 'AI-powered writing platform for romance & fantasy authors. Steam calibration, voice fingerprinting, series bible & KDP export.',
    siteName: 'Ember',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ember - AI-Powered Romantasy Ghostwriting Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ember - AI-Powered Romantasy Ghostwriting Platform',
    description: 'AI-powered writing platform for romance & fantasy authors. Steam calibration, voice fingerprinting, series bible & KDP export.',
    images: ['/og-image.png'],
    creator: '@88away',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body 
        className={`${inter.variable} ${merriweather.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <GoogleAnalytics />
        <Providers>
          {children}
          <Toaster />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
