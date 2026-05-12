'use client';

import { useState } from 'react';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { 
  CreditCard, 
  Check, 
  Flame, 
  Zap,
  Crown,
  Loader2,
  ExternalLink,
  AlertCircle,
  Calendar,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useSubscription } from '@/hooks/use-subscription';
import { PLANS, PLAN_LIMITS, type PlanName } from '@/lib/stripe/config';
import { format } from 'date-fns';

const planIcons: Record<PlanName, typeof Sparkles> = {
  spark: Sparkles,
  flame: Flame,
  inferno: Crown,
};

const planColors: Record<PlanName, string> = {
  spark: 'text-gray-500',
  flame: 'text-rose-500',
  inferno: 'text-purple-500',
};

export default function BillingSettingsPage() {
  const { 
    plan, 
    status, 
    isActive, 
    isPro, 
    loading, 
    currentPeriodEnd,
    cancelAtPeriodEnd,
    refresh
  } = useSubscription();
  
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPlan = PLANS[plan];
  const limits = PLAN_LIMITS[plan];
  const PlanIcon = planIcons[plan];

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      if (data.portalUrl) {
        window.location.href = data.portalUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing details</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            {isPro ? 'Thank you for being a subscriber!' : 'You are on the free plan'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`h-14 w-14 rounded-full bg-muted flex items-center justify-center ${planColors[plan]}`}>
                <PlanIcon className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{currentPlan.displayName}</h3>
                <p className="text-sm text-muted-foreground">{currentPlan.description}</p>
                {isPro && currentPeriodEnd && (
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {cancelAtPeriodEnd ? 'Cancels' : 'Renews'} on {format(currentPeriodEnd, 'MMMM d, yyyy')}
                    </span>
                  </div>
                )}
                {cancelAtPeriodEnd && (
                  <p className="text-sm text-amber-600 mt-1">
                    Your subscription will be cancelled at the end of the billing period
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                ${currentPlan.monthlyPrice}
                <span className="text-sm font-normal text-muted-foreground">/mo</span>
              </p>
              {isPro && (
                <p className="text-sm text-muted-foreground capitalize">{status}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            {isPro ? (
              <Button 
                onClick={handleManageSubscription} 
                disabled={portalLoading}
                variant="outline"
              >
                {portalLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Subscription
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button asChild className="bg-rose-500 hover:bg-rose-600">
                <Link href="/checkout?plan=flame&interval=monthly">
                  <Flame className="h-4 w-4 mr-2" />
                  Upgrade to Flame
                </Link>
              </Button>
            )}
            {plan !== 'inferno' && isPro && (
              <Button asChild variant="outline">
                <Link href="/checkout?plan=inferno&interval=monthly">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Inferno
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle>Your Plan Includes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {currentPlan.features.map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Usage This Period</CardTitle>
          <CardDescription>Track your usage against your plan limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <UsageBar 
              label="Projects" 
              used={2} 
              limit={limits.projects}
            />
            <UsageBar 
              label="AI Prompts Today" 
              used={5} 
              limit={limits.aiPromptsPerDay}
            />
            <UsageBar 
              label="Voice Profiles" 
              used={0} 
              limit={limits.voiceProfiles}
            />
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Cards for Free Users */}
      {!isPro && (
        <div className="grid md:grid-cols-2 gap-6">
          <UpgradeCard plan="flame" />
          <UpgradeCard plan="inferno" />
        </div>
      )}
    </div>
  );
}

function UsageBar({ 
  label, 
  used, 
  limit 
}: { 
  label: string; 
  used: number; 
  limit: number;
}) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isNearLimit = !isUnlimited && percentage >= 80;
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className={isNearLimit ? 'text-amber-600 font-medium' : 'text-muted-foreground'}>
          {used} / {isUnlimited ? '∞' : limit}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all ${
            isNearLimit ? 'bg-amber-500' : 'bg-rose-500'
          }`}
          style={{ width: isUnlimited ? '0%' : `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function UpgradeCard({ plan }: { plan: PlanName }) {
  const config = PLANS[plan];
  const PlanIcon = planIcons[plan];
  
  return (
    <Card className={plan === 'flame' ? 'border-rose-500/50' : ''}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <PlanIcon className={`h-5 w-5 ${planColors[plan]}`} />
          <CardTitle>{config.displayName}</CardTitle>
        </div>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <span className="text-3xl font-bold">${config.monthlyPrice}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
        <ul className="space-y-2 mb-6">
          {config.features.slice(0, 4).map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
        <Button asChild className="w-full" variant={plan === 'flame' ? 'default' : 'outline'}>
          <Link href={`/checkout?plan=${plan}&interval=monthly`}>
            Upgrade to {config.displayName}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
