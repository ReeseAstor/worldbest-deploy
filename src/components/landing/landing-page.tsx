'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { 
  Flame, 
  Users, 
  Sparkles, 
  Heart, 
  Download, 
  Check,
  Star,
  ArrowRight,
  Menu,
  X,
  BookHeart,
  Thermometer
} from 'lucide-react';
import { AuthModal } from '@/components/auth/auth-modal';

const features = [
  {
    icon: Thermometer,
    title: '5-Level Steam Calibration',
    description: 'From closed door to scorching. Control heat levels with vocabulary-aware AI.',
  },
  {
    icon: Users,
    title: 'Romance Character Tools',
    description: 'Rich character profiles with relationship arcs and speech patterns.',
  },
  {
    icon: Sparkles,
    title: 'Genre-Tuned AI Drafting',
    description: 'AI trained on romantasy tropes. Understands tension arcs and HEA pacing.',
  },
  {
    icon: Heart,
    title: 'Voice Fingerprinting',
    description: 'Upload samples and Ember learns your unique writing style.',
  },
  {
    icon: BookHeart,
    title: 'Beat Sheet Templates',
    description: 'Romancing the Beat and dark romance templates for dual-POV storytelling.',
  },
  {
    icon: Download,
    title: 'KDP-Ready Export',
    description: 'One-click export to EPUB, PDF, formatted for Amazon KDP upload.',
  },
];

const plans = [
  {
    name: 'Spark',
    price: 'Free',
    description: 'Try Ember risk-free',
    features: ['1 project', '10 AI generations/day', 'Basic steam levels (1-2)'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Flame',
    price: '$39',
    period: '/month',
    description: 'Everything for indie authors',
    features: ['5 projects', 'Unlimited AI generations', 'All 5 steam levels', 'Voice fingerprinting', 'KDP export'],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Inferno',
    price: '$79',
    period: '/month',
    description: 'For prolific authors',
    features: ['Unlimited projects', 'Team seats (up to 5)', 'Custom voice profiles', 'Priority support'],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: 'login' | 'signup' }>({
    open: false,
    mode: 'login',
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Flame className="h-6 w-6 text-rose-500" />
            <span className="text-xl font-bold">Ember</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">Features</Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary">Pricing</Link>
            <Button variant="ghost" onClick={() => setAuthModal({ open: true, mode: 'login' })}>Sign In</Button>
            <Button onClick={() => setAuthModal({ open: true, mode: 'signup' })}>Get Started</Button>
          </nav>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t p-4 space-y-4">
            <Link href="#features" className="block text-sm font-medium">Features</Link>
            <Link href="#pricing" className="block text-sm font-medium">Pricing</Link>
            <Button className="w-full" onClick={() => setAuthModal({ open: true, mode: 'signup' })}>Get Started</Button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="container py-24 md:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm mb-6">
            <Flame className="h-4 w-4 mr-2 text-rose-500" />
            AI-Powered Romantasy Ghostwriting
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Write Steamy Romance <span className="text-rose-500">Faster</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            The only AI writing platform built for steamy romantasy. Genre-tuned drafting, steam calibration, voice fingerprinting, and KDP-ready export.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => setAuthModal({ open: true, mode: 'signup' })}>
              Start Writing Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-24 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Built for Romance Authors</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to write, edit, and publish steamy romantasy novels faster than ever.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="h-10 w-10 text-rose-500 mb-2" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container py-24 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Simple, Author-Friendly Pricing</h2>
          <p className="text-muted-foreground">Start free. Upgrade when you need more power.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.popular ? 'border-rose-500 border-2' : ''}>
              <CardHeader>
                {plan.popular && (
                  <div className="flex items-center text-rose-500 text-sm font-medium mb-2">
                    <Star className="h-4 w-4 mr-1 fill-current" />
                    Most Popular
                  </div>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full" 
                  variant={plan.popular ? 'default' : 'outline'}
                  onClick={() => setAuthModal({ open: true, mode: 'signup' })}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Flame className="h-5 w-5 text-rose-500" />
            <span className="font-semibold">Ember</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 88Away LLC. All rights reserved.
          </p>
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
