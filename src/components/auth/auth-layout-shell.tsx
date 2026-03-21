'use client';

import Link from 'next/link';
import { Flame } from 'lucide-react';

interface AuthLayoutShellProps {
  children: React.ReactNode;
}

export function AuthLayoutShell({ children }: AuthLayoutShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-rose-950/20">
      {/* Header with Logo */}
      <header className="w-full py-6 px-4">
        <div className="container max-w-7xl mx-auto">
          <Link href="/" className="flex items-center space-x-2 w-fit">
            <Flame className="h-7 w-7 text-rose-500" />
            <span className="text-2xl font-bold">Ember</span>
          </Link>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center">
        <p className="text-sm text-muted-foreground">
          © 2025 88Away LLC. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
