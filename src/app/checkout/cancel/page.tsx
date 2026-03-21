'use client';

import { Button } from '@ember/ui-components';
import { Card, CardContent } from '@ember/ui-components';
import { XCircle, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <CardContent className="pt-12 pb-8">
            {/* Cancel Icon */}
            <div className="mb-6">
              <div className="h-20 w-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                <XCircle className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>

            {/* Message */}
            <h1 className="text-3xl font-bold mb-2">No Worries!</h1>
            <p className="text-muted-foreground mb-8">
              Your checkout was cancelled. No charges were made to your account.
            </p>

            {/* Reassurance */}
            <div className="bg-muted/50 rounded-lg p-4 mb-8 text-left">
              <p className="font-medium mb-2">Changed your mind?</p>
              <p className="text-sm text-muted-foreground">
                That&apos;s totally fine! You can always upgrade later when you&apos;re ready. 
                In the meantime, enjoy exploring with your current plan.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full">
                <Link href="/#pricing">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Pricing
                </Link>
              </Button>
              <Button asChild className="w-full">
                <Link href="/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
            </div>

            {/* Questions */}
            <p className="text-xs text-muted-foreground mt-6">
              Have questions? <Link href="/help" className="text-rose-500 hover:underline">Contact support</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
