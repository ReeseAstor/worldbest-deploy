<<<<<<< Local
import type { Metadata } from 'next';
import { Inter, Merriweather } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const merriweather = Merriweather({ 
  weight: ['400', '700'], 
  subsets: ['latin'], 
  variable: '--font-serif' 
});

export const metadata: Metadata = {
  title: {
    template: '%s | Ember',
    default: 'Ember - AI-Powered Romantasy Ghostwriting Platform',
  },
  description: 'The only AI writing platform built for steamy romantasy. Genre-tuned drafting, steam calibration, voice fingerprinting, beat sheets, and KDP-ready export.',
  keywords: [
    'romantasy',
    'romance writing',
    'AI ghostwriting',
    'steamy romance',
    'dark romance',
    'paranormal romance',
    'KDP publishing',
    'book writing software',
    'romance author tools',
    'story bible',
  ],
  authors: [{ name: '88Away LLC' }],
  creator: 'Ember',
  publisher: '88Away LLC',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Ember - AI-Powered Romantasy Ghostwriting Platform',
    description: 'The only AI writing platform built for steamy romantasy. Genre-tuned drafting, steam calibration, voice fingerprinting, beat sheets, and KDP-ready export.',
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
    description: 'The only AI writing platform built for steamy romantasy. Genre-tuned drafting, steam calibration, voice fingerprinting, beat sheets, and KDP-ready export.',
    images: ['/og-image.png'],
    creator: '@emberwriting',
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
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
=======
import type { Metadata } from 'next';
import { Inter, Merriweather } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const merriweather = Merriweather({ 
  weight: ['400', '700'], 
  subsets: ['latin'], 
  variable: '--font-serif' 
});

export const metadata: Metadata = {
  title: {
    template: '%s | Ember',
    default: 'Ember - AI-Powered Romantasy Ghostwriting Platform',
  },
  description: 'The only AI writing platform built for steamy romantasy. Genre-tuned drafting, steam calibration, voice fingerprinting, series bible, and indie publishing pipeline in one workspace.',
  keywords: [
    'romantasy',
    'romance writing',
    'AI ghostwriting',
    'steam calibration',
    'series bible',
    'indie author tools',
    'KDP publishing',
    'dark romance',
    'fantasy romance',
    'writing platform',
  ],
  authors: [{ name: '88Away LLC' }],
  creator: 'Ember',
  publisher: 'Ember',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Ember - AI-Powered Romantasy Ghostwriting Platform',
    description: 'The only AI writing platform built for steamy romantasy. Genre-tuned drafting, steam calibration, voice fingerprinting, and indie publishing pipeline.',
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
    description: 'The only AI writing platform built for steamy romantasy. Genre-tuned drafting, steam calibration, voice fingerprinting, and indie publishing pipeline.',
    images: ['/og-image.png'],
    creator: '@ember_writes',
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
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
>>>>>>> Remote
}