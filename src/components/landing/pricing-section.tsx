'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { Check, X, Star } from 'lucide-react';

interface PricingTier {
  name: string;
  description: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  annualSavings: number | null;
  features: string[];
  cta: string;
  popular: boolean;
  ctaVariant: 'default' | 'outline';
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Spark',
    description: 'Perfect for trying Ember',
    monthlyPrice: null,
    annualPrice: null,
    annualSavings: null,
    features: [
      '2 projects',
      '10 AI prompts/day',
      'Basic steam levels (1-2)',
      'Community support',
    ],
    cta: 'Get Started',
    popular: false,
    ctaVariant: 'outline',
  },
  {
    name: 'Flame',
    description: 'Solo Author',
    monthlyPrice: 39,
    annualPrice: 23,
    annualSavings: 72,
    features: [
      '10 projects',
      'Unlimited AI prompts',
      'All 5 steam levels',
      'Voice fingerprinting',
      'KDP export',
      'Email support',
    ],
    cta: 'Start Free Trial',
    popular: true,
    ctaVariant: 'default',
  },
  {
    name: 'Inferno',
    description: 'Pro Creator',
    monthlyPrice: 79,
    annualPrice: 63,
    annualSavings: 192,
    features: [
      'Unlimited projects',
      'Everything in Flame',
      'Team seats (up to 5)',
      'Custom voice profiles',
      'Priority support',
      'API access',
    ],
    cta: 'Contact Sales',
    popular: false,
    ctaVariant: 'outline',
  },
];

const featureComparison = [
  { feature: 'Projects', spark: '2', flame: '10', inferno: 'Unlimited' },
  { feature: 'AI Prompts', spark: '10/day', flame: 'Unlimited', inferno: 'Unlimited' },
  { feature: 'Steam Levels', spark: '1-2', flame: 'All 5', inferno: 'All 5' },
  { feature: 'Voice Fingerprinting', spark: false, flame: true, inferno: true },
  { feature: 'KDP Export', spark: false, flame: true, inferno: true },
  { feature: 'Team Seats', spark: false, flame: false, inferno: 'Up to 5' },
  { feature: 'Custom Voice Profiles', spark: false, flame: false, inferno: true },
  { feature: 'API Access', spark: false, flame: false, inferno: true },
  { feature: 'Priority Support', spark: false, flame: false, inferno: true },
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  const formatPrice = (tier: PricingTier) => {
    if (tier.monthlyPrice === null) return '$0';
    return isAnnual ? `$${tier.annualPrice}` : `$${tier.monthlyPrice}`;
  };

  return (
    <section id="pricing" className="py-20 md:py-32 bg-background">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start free. Upgrade when you&apos;re ready.
          </p>
        </motion.div>

        {/* Monthly/Annual Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
              isAnnual ? 'bg-rose-500' : 'bg-muted'
            }`}
            aria-label="Toggle billing period"
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                isAnnual ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>
            Annual
          </span>
          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500 text-white">
            Save 20%
          </span>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            >
              <Card
                className={`relative h-full flex flex-col ${
                  tier.popular ? 'border-rose-500 border-2 shadow-lg' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500 text-white">
                      <Star className="h-3 w-3 fill-current" />
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{formatPrice(tier)}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {isAnnual && tier.annualSavings && (
                    <p className="text-sm text-rose-500 font-medium mt-1">
                      Save ${tier.annualSavings}/year
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${tier.popular ? 'bg-rose-500 hover:bg-rose-600' : ''}`}
                    variant={tier.ctaVariant}
                  >
                    {tier.cta}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <h3 className="text-xl font-semibold text-center mb-8">Compare Plans</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-medium">Feature</th>
                  <th className="text-center py-4 px-4 font-medium">Spark</th>
                  <th className="text-center py-4 px-4 font-medium text-rose-500">Flame</th>
                  <th className="text-center py-4 px-4 font-medium">Inferno</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((row) => (
                  <tr key={row.feature} className="border-b">
                    <td className="py-4 px-4 text-sm">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.spark === 'boolean' ? (
                        row.spark ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-sm">{row.spark}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center bg-rose-50/50">
                      {typeof row.flame === 'boolean' ? (
                        row.flame ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-sm">{row.flame}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.inferno === 'boolean' ? (
                        row.inferno ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-sm">{row.inferno}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
