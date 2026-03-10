'use client';

import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import apiClient from '@/lib/api/client';
import {
  CreditCard,
  CheckCircle,
  Zap,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    features: [
      '500K AI tokens/month',
      '3 active projects',
      'DOCX export',
      'Basic voice fingerprint',
      '5 heat levels',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 59,
    popular: true,
    features: [
      '1.5M AI tokens/month',
      'Unlimited projects',
      'DOCX + EPUB export',
      'Advanced voice fingerprint',
      '5 heat levels',
      'Line editing suite',
      'Priority support',
    ],
  },
  {
    id: 'studio',
    name: 'Studio',
    price: 149,
    features: [
      '5M AI tokens/month',
      'Unlimited projects',
      'All export formats',
      'Custom voice models',
      'API access',
      'Team collaboration',
      'Dedicated support',
    ],
  },
];

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const handleCheckout = async (plan: string) => {
    setLoading(plan);
    try {
      const res = await apiClient.post<{ url: string }>('/billing/checkout', {
        plan,
        success_url: `${window.location.origin}/dashboard/billing?success=true`,
        cancel_url: `${window.location.origin}/dashboard/billing?canceled=true`,
      });
      window.location.href = res.data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await apiClient.post<{ url: string }>('/billing/portal', {
        return_url: `${window.location.origin}/dashboard/billing`,
      });
      window.location.href = res.data.url;
    } catch (err) {
      console.error('Portal error:', err);
      setPortalLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-primary" />
          Billing
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing details.
        </p>
      </div>

      {/* Manage existing subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>
            Manage your plan, payment method, and invoices through the Stripe portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handlePortal} disabled={portalLoading} variant="outline" type="button">
            {portalLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4 mr-2" />
            )}
            Manage Subscription
          </Button>
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${plan.popular ? 'border-primary ring-1 ring-primary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading === plan.id}
                  type="button"
                >
                  {loading === plan.id ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  Choose {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
