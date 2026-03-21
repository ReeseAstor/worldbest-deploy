'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@ember/ui-components';
import { Flame, Menu, X } from 'lucide-react';
import { AuthModal } from '@/components/auth/auth-modal';

// Import all section components
import { HeroSection } from './hero-section';
import { FeaturesSection } from './features-section';
import { DemoSection } from './demo-section';
import { PricingSection } from './pricing-section';
import { TestimonialsSection } from './testimonials-section';
import { FAQSection } from './faq-section';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'signup' }>({
    open: false,
    mode: 'login',
  });

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Flame className="h-6 w-6 text-rose-500" />
            <span className="text-xl font-bold">Ember</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Button 
              variant="ghost" 
              onClick={() => setAuthModal({ open: true, mode: 'login' })}
            >
              Sign In
            </Button>
            <Button 
              className="bg-rose-500 hover:bg-rose-600"
              onClick={() => setAuthModal({ open: true, mode: 'signup' })}
            >
              Get Started
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background p-4 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setAuthModal({ open: true, mode: 'login' });
                  setMobileMenuOpen(false);
                }}
              >
                Sign In
              </Button>
              <Button 
                className="w-full bg-rose-500 hover:bg-rose-600"
                onClick={() => {
                  setAuthModal({ open: true, mode: 'signup' });
                  setMobileMenuOpen(false);
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content - All Sections */}
      <main>
        {/* Hero Section */}
        <div id="hero">
          <HeroSection />
        </div>

        {/* Features Section */}
        <div id="features">
          <FeaturesSection />
        </div>

        {/* Demo Section */}
        <div id="demo">
          <DemoSection />
        </div>

        {/* Pricing Section - already has id="pricing" internally */}
        <PricingSection />

        {/* Testimonials Section - already has id="testimonials" internally */}
        <TestimonialsSection />

        {/* FAQ Section - already has id="faq" internally */}
        <FAQSection />
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Footer Logo */}
            <div className="flex items-center space-x-2">
              <Flame className="h-5 w-5 text-rose-500" />
              <span className="font-semibold">Ember</span>
            </div>

            {/* Footer Links */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link 
                href="/privacy" 
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © 2025 88Away LLC. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {authModal.open && (
        <AuthModal
          mode={authModal.mode}
          onClose={() => setAuthModal({ ...authModal, open: false })}
          onSwitchMode={(mode) => setAuthModal({ open: true, mode })}
        />
      )}
    </div>
  );
}
