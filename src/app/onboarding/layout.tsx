'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Flame } from 'lucide-react';
import { Button } from '@ember/ui-components';
import { ProgressBar } from '@/components/onboarding/progress-bar';
import { useOnboardingStore } from '@/stores/onboarding-store';

// Map pathname to step number
const STEP_MAP: Record<string, number> = {
  '/onboarding/welcome': 1,
  '/onboarding/goals': 2,
  '/onboarding/first-project': 3,
  '/onboarding/complete': 4,
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { markCompleted } = useOnboardingStore();
  
  const currentStep = STEP_MAP[pathname] || 1;
  const isCompletePage = pathname === '/onboarding/complete';

  const handleSkip = () => {
    markCompleted();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-rose-950/10">
      {/* Header */}
      <header className="w-full py-4 px-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Flame className="h-6 w-6 text-rose-500" />
            <span className="text-xl font-bold">Ember</span>
          </Link>

          {/* Skip button - hidden on complete page */}
          {!isCompletePage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          )}
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full py-6 px-4 border-b bg-background/50">
        <div className="container max-w-2xl mx-auto">
          <ProgressBar currentStep={currentStep} />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 text-center border-t bg-background/50">
        <p className="text-xs text-muted-foreground">
          © 2025 88Away LLC. Need help?{' '}
          <Link href="/support" className="text-rose-500 hover:text-rose-600">
            Contact support
          </Link>
        </p>
      </footer>
    </div>
  );
}
