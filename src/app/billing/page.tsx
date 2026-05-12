'use client';

import { useState } from 'react';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { useAuth } from '@/components/auth/auth-provider';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  Flame, 
  Zap,
  Crown,
  ArrowRight
} from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'For trying out Ember',
    icon: Sparkles,
    features: [
      '1 project',
      '5,000 AI words/month',
      'Basic steam levels (1-3)',
      'DOCX export only',
    ],
    current: true,
  },
  {
    name: 'Spark',
    price: 19,
    description: 'For hobbyist writers',
    icon: Flame,
    features: [
      '3 projects',
      '50,000 AI words/month',
      'All steam levels (1-5)',
      '1 voice profile',
      'DOCX + EPUB export',
    ],
    popular: false,
  },
  {
    name: 'Flame',
    price: 39,
    description: 'For serious authors',
    icon: Zap,
    features: [
      '10 projects',
      '150,000 AI words/month',
      'All steam levels (1-5)',
      '3 voice profiles',
      'All export formats',
      'KDP-ready formatting',
      'Priority support',
    ],
    popular: true,
  },
  {
    name: 'Inferno',
    price: 79,
    description: 'For professional authors',
    icon: Crown,
    features: [
      'Unlimited projects',
      '500,000 AI words/month',
      'All steam levels (1-5)',
      'Unlimited voice profiles',
      'All export formats',
      'KDP print-ready',
      'API access',
      'White-glove support',
    ],
    popular: false,
  },
];

export default function BillingPage() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>You&apos;re currently on the Free plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Free Plan</p>
                <p className="text-sm text-muted-foreground">5,000 AI words remaining this month</p>
              </div>
            </div>
            <Button variant="outline">Manage</Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center gap-4">
        <span className={billingCycle === 'monthly' ? 'font-semibold' : 'text-muted-foreground'}>
          Monthly
        </span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            billingCycle === 'yearly' ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
              billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={billingCycle === 'yearly' ? 'font-semibold' : 'text-muted-foreground'}>
          Yearly <span className="text-green-600 text-sm">(Save 17%)</span>
        </span>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                Most Popular
              </div>
            )}
            <CardHeader>
              <div className="flex items-center gap-2">
                <plan.icon className="h-5 w-5 text-primary" />
                <CardTitle>{plan.name}</CardTitle>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-3xl font-bold">
                  ${billingCycle === 'yearly' ? Math.round(plan.price * 0.83) : plan.price}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
              
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button 
                className="w-full" 
                variant={plan.current ? 'outline' : plan.popular ? 'default' : 'outline'}
                disabled={plan.current}
              >
                {plan.current ? 'Current Plan' : 'Upgrade'}
                {!plan.current && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Add a payment method to upgrade</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">
            <CreditCard className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
