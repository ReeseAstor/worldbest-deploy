import Script from 'next/script';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://88away.com';

// Type definitions for JSON-LD schemas
interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Generic JSON-LD component for injecting structured data
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Organization schema for 88Away LLC
 */
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '88Away LLC',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'AI-powered writing platform for romance and fantasy authors',
    sameAs: [
      'https://twitter.com/88away',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@88away.com',
      contactType: 'customer support',
    },
  };

  return <JsonLd data={data} />;
}

/**
 * WebApplication schema for Ember
 */
export function WebApplicationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Ember',
    url: BASE_URL,
    description: 'AI-powered writing platform for romance and fantasy authors. Features steam calibration, voice fingerprinting, series bible, and KDP export.',
    applicationCategory: 'Writing Tool',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        name: 'Spark',
        description: 'Free tier with 2 projects and 10 AI prompts/day',
      },
      {
        '@type': 'Offer',
        price: '39',
        priceCurrency: 'USD',
        name: 'Flame',
        description: 'Solo Author tier with 10 projects and unlimited AI prompts',
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '39',
          priceCurrency: 'USD',
          billingIncrement: 'P1M',
        },
      },
      {
        '@type': 'Offer',
        price: '79',
        priceCurrency: 'USD',
        name: 'Inferno',
        description: 'Pro Creator tier with unlimited projects and team collaboration',
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: '79',
          priceCurrency: 'USD',
          billingIncrement: 'P1M',
        },
      },
    ],
    featureList: [
      'AI-powered writing assistance',
      'Steam level calibration (1-5)',
      'Voice fingerprinting',
      'Series bible management',
      'KDP-ready export',
      'Real-time collaboration',
    ],
    screenshot: `${BASE_URL}/og-image.png`,
    softwareVersion: '1.0',
    author: {
      '@type': 'Organization',
      name: '88Away LLC',
    },
  };

  return <JsonLd data={data} />;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQPageJsonLdProps {
  faqs: FAQItem[];
}

/**
 * FAQPage schema for FAQ sections
 */
export function FAQPageJsonLd({ faqs }: FAQPageJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return <JsonLd data={data} />;
}

interface WebsiteJsonLdProps {
  name?: string;
  description?: string;
}

/**
 * Website schema
 */
export function WebsiteJsonLd({ 
  name = 'Ember', 
  description = 'AI-powered writing platform for romance and fantasy authors' 
}: WebsiteJsonLdProps = {}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url: BASE_URL,
    description,
    publisher: {
      '@type': 'Organization',
      name: '88Away LLC',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLd data={data} />;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

/**
 * BreadcrumbList schema for navigation
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };

  return <JsonLd data={data} />;
}

/**
 * Pre-built FAQ data from the landing page
 */
export const landingPageFAQs: FAQItem[] = [
  {
    question: 'How does the AI writing assistant work?',
    answer: 'Ember uses three specialized AI personas to help you write. Muse assists with drafting new content, generating ideas, and overcoming writer\'s block. Editor helps polish your prose, fix grammar, and improve flow. Coach provides structural guidance on pacing, character arcs, and story beats. Each persona is trained specifically for romantasy and steamy romance genres.',
  },
  {
    question: 'Can I export my work?',
    answer: 'Absolutely! On Solo (Flame) and Pro (Inferno) tiers, you can export your manuscripts in ePub, PDF, and JSON formats. Our exports are specifically formatted for Amazon KDP upload, making self-publishing seamless. Free tier users can copy their text, but direct export features require an upgrade.',
  },
  {
    question: 'Is my writing data secure?',
    answer: 'Security is our top priority. All your manuscripts and personal data are protected with end-to-end encryption. Our infrastructure is SOC 2 compliant, and we never use your writing to train AI models without explicit consent. Your stories remain yours—always.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel anytime with no questions asked. There are no long-term contracts or cancellation fees. When you cancel, you\'ll retain access to all premium features until the end of your current billing period. Your projects and data remain accessible even after downgrading.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee, no questions asked. If Ember isn\'t the right fit for your writing workflow, simply contact our support team within 30 days of purchase for a full refund. We want you to be completely satisfied with your investment.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) through Stripe\'s secure payment processing. We also support Apple Pay and Google Pay for quick checkout. All transactions are encrypted and PCI-compliant.',
  },
  {
    question: 'Can I collaborate with other writers?',
    answer: 'Yes! Our Pro (Inferno) tier includes real-time collaboration features. You can invite up to 5 team members to work on projects together with real-time co-editing, inline comments, and full change tracking. Perfect for writing partners, editors, or author teams.',
  },
  {
    question: 'How does billing work?',
    answer: 'You can choose between monthly or annual billing. Annual plans save you 20% compared to monthly pricing. Billing is automatic and occurs on the same date each month or year. You can switch between plans or cancel anytime from your account settings.',
  },
];

/**
 * Combined structured data for the landing page
 */
export function LandingPageJsonLd() {
  return (
    <>
      <OrganizationJsonLd />
      <WebApplicationJsonLd />
      <WebsiteJsonLd />
      <FAQPageJsonLd faqs={landingPageFAQs} />
    </>
  );
}
