'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@ember/ui-components';
import { Card, CardContent } from '@ember/ui-components';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti on mount
    if (!showConfetti) {
      setShowConfetti(true);
      
      // Fire confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#f43f5e', '#ec4899', '#8b5cf6', '#f97316'],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#f43f5e', '#ec4899', '#8b5cf6', '#f97316'],
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [showConfetti]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <CardContent className="pt-12 pb-8">
            {/* Success Icon */}
            <div className="mb-6 relative">
              <div className="h-20 w-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="h-10 w-10 text-green-500" />
              </div>
              <Sparkles className="h-6 w-6 text-yellow-500 absolute top-0 right-1/4 animate-pulse" />
              <Sparkles className="h-4 w-4 text-rose-500 absolute bottom-0 left-1/4 animate-pulse delay-100" />
            </div>

            {/* Welcome Message */}
            <h1 className="text-3xl font-bold mb-2">Welcome to the Family!</h1>
            <p className="text-muted-foreground mb-8">
              Your subscription is now active. Let&apos;s start creating amazing stories together.
            </p>

            {/* What's Next */}
            <div className="bg-muted/50 rounded-lg p-4 mb-8 text-left">
              <p className="font-medium mb-3">What&apos;s unlocked for you:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Unlimited AI prompts
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  All 5 steam levels
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Voice fingerprinting
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  KDP-ready export
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button asChild className="w-full bg-rose-500 hover:bg-rose-600">
                <Link href="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/projects/new">
                  Create Your First Project
                </Link>
              </Button>
            </div>

            {/* Receipt Note */}
            <p className="text-xs text-muted-foreground mt-6">
              A receipt has been sent to your email. You can manage your subscription anytime from Settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
