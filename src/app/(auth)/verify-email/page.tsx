'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const COOLDOWN_SECONDS = 60;

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const supabase = createClient();
  
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resendCount, setResendCount] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (cooldown > 0 || !email) return;

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast.success('Email sent!', {
        description: 'Check your inbox for the verification link.',
      });
      setResendCount(resendCount + 1);
      setCooldown(COOLDOWN_SECONDS);
    } catch (error: any) {
      toast.error('Failed to resend email', {
        description: error.message || 'Please try again later.',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/30">
          <Mail className="h-8 w-8 text-rose-500" />
        </div>
        <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
        <CardDescription>
          We sent a verification link to
        </CardDescription>
        {email && (
          <p className="font-medium text-foreground break-all">
            {email}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Click the link in your email to verify your account and get started with Ember.
          </p>
          
          <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-rose-500" />
              <span>Check your inbox</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-rose-500" />
              <span>Check your spam folder</span>
            </div>
          </div>
        </div>

        {/* Resend Button */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResendEmail}
            disabled={resending || cooldown > 0 || !email}
          >
            {resending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : cooldown > 0 ? (
              <>Resend in {cooldown}s</>
            ) : (
              <>Resend verification email</>
            )}
          </Button>

          {resendCount > 0 && (
            <p className="text-xs text-center text-muted-foreground">
              Email resent {resendCount} {resendCount === 1 ? 'time' : 'times'}
            </p>
          )}
        </div>

        {/* Back to Login */}
        <div className="pt-4 border-t">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>

        {/* Troubleshooting */}
        <p className="text-xs text-center text-muted-foreground">
          Having trouble?{' '}
          <Link href="/support" className="text-rose-500 hover:text-rose-600">
            Contact support
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
