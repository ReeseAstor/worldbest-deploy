'use client';

import { useState } from 'react';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Flame,
  Zap,
  Crown,
  Check,
  X,
  Loader2,
  ArrowRight
} from 'lucide-react';

export type PlanTier = 'free' | 'spark' | 'flame' | 'inferno';

interface PlanFeature {
  name: string;
  included: boolean | string;
}

interface Plan {
  id: PlanTier;
  name: string;
  description: string;
  price: number;
  priceYearly: number;
  icon: typeof Sparkles;
  iconColor: string;
  bgGradient: string;
  features: PlanFeature[];
  aiWords: string;
  projects: string;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Try Ember with basic features',
    price: 0,
    priceYearly: 0,
    icon: Zap,
    iconColor: 'text-slate-500',
    bgGradient: 'from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800',
    aiWords: '5,000/month',
    projects: '1 project',
    features: [
      { name: 'Basic AI drafting', included: true },
      { name: 'Steam levels 1-3', included: true },
      { name: 'DOCX export', included: true },
      { name: 'Voice fingerprinting', included: false },
      { name: 'Beat sheet templates', included: false },
      { name: 'KDP export', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  {
    id: 'spark',
    name: 'Spark',
    description: 'For authors starting their journey',
    price: 19,
    priceYearly: 190,
    icon: Sparkles,
    iconColor: 'text-amber-500',
    bgGradient: 'from-amber-50 to-orange-100 dark:from-amber-900 dark:to-orange-900',
    aiWords: '50,000/month',
    projects: '3 projects',
    features: [
      { name: 'Full AI drafting suite', included: true },
      { name: 'All steam levels (1-5)', included: true },
      { name: 'DOCX & EPUB export', included: true },
      { name: 'Voice fingerprinting', included: '1 profile' },
      { name: 'Beat sheet templates', included: true },
      { name: 'KDP export', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  {
    id: 'flame',
    name: 'Flame',
    description: 'For serious indie authors',
    price: 39,
    priceYearly: 390,
    icon: Flame,
    iconColor: 'text-rose-500',
    bgGradient: 'from-rose-50 to-pink-100 dark:from-rose-900 dark:to-pink-900',
    aiWords: '150,000/month',
    projects: '10 projects',
    popular: true,
    features: [
      { name: 'Full AI drafting suite', included: true },
      { name: 'All steam levels (1-5)', included: true },
      { name: 'All export formats', included: true },
      { name: 'Voice fingerprinting', included: '3 profiles' },
      { name: 'Beat sheet templates', included: true },
      { name: 'KDP eBook export', included: true },
      { name: 'Priority support', included: false },
    ],
  },
  {
    id: 'inferno',
    name: 'Inferno',
    description: 'For prolific publishers',
    price: 79,
    priceYearly: 790,
    icon: Crown,
    iconColor: 'text-violet-500',
    bgGradient: 'from-violet-50 to-purple-100 dark:from-violet-900 dark:to-purple-900',
    aiWords: '500,000/month',
    projects: 'Unlimited',
    features: [
      { name: 'Full AI drafting suite', included: true },
      { name: 'All steam levels (1-5)', included: true },
      { name: 'All export formats', included: true },
      { name: 'Voice fingerprinting', included: 'Unlimited' },
      { name: 'Beat sheet templates', included: true },
      { name: 'KDP Print + eBook', included: true },
      { name: 'Priority support', included: true },
    ],
  },
];

interface SubscriptionPlansProps {
  currentTier?: PlanTier;
  onSelectPlan: (tier: PlanTier, yearly: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function SubscriptionPlans({
  currentTier = 'free',
  onSelectPlan,
  isLoading = false,
}: SubscriptionPlansProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<PlanTier | null>(null);

  const handleSelectPlan = async (tier: PlanTier) => {
    if (tier === currentTier) return;
    setLoadingPlan(tier);
    try {
      await onSelectPlan(tier, billingCycle === 'yearly');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm ${billingCycle === 'monthly' ? 'font-medium' : 'text-muted-foreground'}`}>
          Monthly
        </span>
        <button
          onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
          className={`
            relative w-14 h-7 rounded-full transition-colors
            ${billingCycle === 'yearly' ? 'bg-rose-500' : 'bg-muted'}
          `}
        >
          <div className={`
            absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform
            ${billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'}
          `} />
        </button>
        <span className={`text-sm ${billingCycle === 'yearly' ? 'font-medium' : 'text-muted-foreground'}`}>
          Yearly
          <Badge className="ml-2 bg-emerald-500">Save 17%</Badge>
        </span>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = plan.id === currentTier;
          const price = billingCycle === 'yearly' ? plan.priceYearly : plan.price;
          const monthlyEquivalent = billingCycle === 'yearly' ? Math.round(plan.priceYearly / 12) : plan.price;

          return (
            <Card 
              key={plan.id}
              className={`
                relative overflow-hidden transition-all
                ${plan.popular ? 'border-rose-500 shadow-lg scale-105' : ''}
                ${isCurrentPlan ? 'ring-2 ring-rose-500' : ''}
              `}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-rose-500">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className={`bg-gradient-to-br ${plan.bgGradient}`}>
                <div className="flex items-center gap-2">
                  <Icon className={`h-6 w-6 ${plan.iconColor}`} />
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                <CardDescription>{plan.description}</CardDescription>
                
                <div className="pt-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${monthlyEquivalent}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {billingCycle === 'yearly' && plan.price > 0 && (
                    <p className="text-sm text-muted-foreground">
                      ${price} billed yearly
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                {/* Key limits */}
                <div className="space-y-2 pb-4 border-b">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">AI Words</span>
                    <span className="font-medium">{plan.aiWords}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Projects</span>
                    <span className="font-medium">{plan.projects}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground'}>
                        {feature.name}
                        {typeof feature.included === 'string' && (
                          <span className="text-muted-foreground ml-1">({feature.included})</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full ${plan.popular ? 'bg-rose-500 hover:bg-rose-600' : ''}`}
                  variant={isCurrentPlan ? 'outline' : 'default'}
                  disabled={isCurrentPlan || isLoading}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : currentTier === 'free' && plan.id !== 'free' ? (
                    <>
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  ) : (
                    plan.price > PLANS.find(p => p.id === currentTier)!.price ? 'Upgrade' : 'Downgrade'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ or additional info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>All plans include a 14-day money-back guarantee. Cancel anytime.</p>
        <p className="mt-1">
          Need more? <a href="mailto:support@ember.ai" className="text-rose-500 hover:underline">Contact us</a> for custom enterprise plans.
        </p>
      </div>
    </div>
  );
}

export default SubscriptionPlans;
