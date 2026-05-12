'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { Check, Loader2, ArrowLeft, Flame, Zap } from 'lucide-react';
import { PLANS, type PlanName, type BillingInterval } from '@/lib/stripe/config';
import Link from 'next/link';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const planParam = searchParams.get('plan') as PlanName | null;
  const intervalParam = searchParams.get('interval') as BillingInterval | null;
  
  const [plan, setPlan] = useState<PlanName>(planParam || 'flame');
  const [interval, setInterval] = useState<BillingInterval>(intervalParam || 'monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update state when URL params change
  useEffect(() => {
    if (planParam && (planParam === 'flame' || planParam === 'inferno')) {
      setPlan(planParam);
    }
    if (intervalParam && (intervalParam === 'monthly' || intervalParam === 'annual')) {
      setInterval(intervalParam);
    }
  }, [planParam, intervalParam]);

  const selectedPlan = PLANS[plan];
  const price = interval === 'annual' ? selectedPlan.annualPrice : selectedPlan.monthlyPrice;
  const totalAnnual = interval === 'annual' ? selectedPlan.annualPrice * 12 : selectedPlan.monthlyPrice * 12;

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName: plan,
          interval,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const PlanIcon = plan === 'flame' ? Flame : Zap;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Back Link */}
        <Link 
          href="/#pricing" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pricing
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Complete Your Purchase</h1>
            <p className="text-muted-foreground mb-8">
              You&apos;re upgrading to {selectedPlan.displayName}
            </p>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                    <PlanIcon className="h-6 w-6 text-rose-500" />
                  </div>
                  <div>
                    <CardTitle>{selectedPlan.displayName}</CardTitle>
                    <CardDescription>{selectedPlan.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {selectedPlan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Billing Interval Selector */}
                <div className="border-t pt-6">
                  <p className="text-sm font-medium mb-3">Billing Cycle</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setInterval('monthly')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-colors ${
                        interval === 'monthly'
                          ? 'border-rose-500 bg-rose-500/5'
                          : 'border-muted hover:border-muted-foreground/50'
                      }`}
                    >
                      <p className="font-medium">Monthly</p>
                      <p className="text-sm text-muted-foreground">
                        ${selectedPlan.monthlyPrice}/mo
                      </p>
                    </button>
                    <button
                      onClick={() => setInterval('annual')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-colors relative ${
                        interval === 'annual'
                          ? 'border-rose-500 bg-rose-500/5'
                          : 'border-muted hover:border-muted-foreground/50'
                      }`}
                    >
                      {selectedPlan.annualSavings > 0 && (
                        <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                          Save ${selectedPlan.annualSavings}
                        </span>
                      )}
                      <p className="font-medium">Annual</p>
                      <p className="text-sm text-muted-foreground">
                        ${selectedPlan.annualPrice}/mo
                      </p>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{selectedPlan.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing</span>
                  <span className="font-medium capitalize">{interval}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-medium">${price}/month</span>
                </div>
                
                {interval === 'annual' && (
                  <>
                    <div className="border-t pt-4 flex justify-between">
                      <span className="text-muted-foreground">Billed today</span>
                      <span className="font-bold text-lg">${totalAnnual}/year</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      That&apos;s ${selectedPlan.annualPrice}/month, saving you ${selectedPlan.annualSavings} per year
                    </p>
                  </>
                )}

                {interval === 'monthly' && (
                  <div className="border-t pt-4 flex justify-between">
                    <span className="text-muted-foreground">Billed today</span>
                    <span className="font-bold text-lg">${price}</span>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleCheckout}
                  disabled={loading || plan === 'spark'}
                  className="w-full bg-rose-500 hover:bg-rose-600 mt-4"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Payment'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Secure payment powered by Stripe. Cancel anytime.
                </p>

                {/* Plan Selector for switching */}
                {plan === 'flame' && (
                  <button
                    onClick={() => setPlan('inferno')}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                  >
                    Need more? Upgrade to Inferno →
                  </button>
                )}
                {plan === 'inferno' && (
                  <button
                    onClick={() => setPlan('flame')}
                    className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Switch to Flame
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span>🔒 SSL Encrypted</span>
              <span>•</span>
              <span>💳 Secure Payment</span>
              <span>•</span>
              <span>❌ Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
