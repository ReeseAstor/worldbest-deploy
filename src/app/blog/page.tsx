import Link from 'next/link';
import { Button } from '@ember/ui-components';
import { Flame, ArrowLeft, BookOpen, Sparkles, PenTool } from 'lucide-react';

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Flame className="h-6 w-6 text-rose-500" />
            <span className="text-xl font-bold">Ember</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Button asChild size="sm">
              <Link href="/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          {/* Breadcrumb */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* Hero */}
          <div className="mb-12">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-rose-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              The Ember Blog
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Writing tips, industry insights, and updates from the Ember team for romance and fantasy authors.
            </p>
          </div>

          {/* Coming Soon Card */}
          <div className="bg-muted/30 rounded-2xl border p-8 md:p-12">
            <div className="flex items-center justify-center gap-2 text-rose-500 mb-4">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wide">Coming Soon</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Stay Tuned for Great Content
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              We&apos;re crafting articles on writing craft, the business of self-publishing, 
              AI-assisted creativity, and success stories from fellow romantasy authors. 
              Check back soon!
            </p>

            {/* Teaser Topics */}
            <div className="grid md:grid-cols-3 gap-4 text-left mt-8">
              <div className="p-4 rounded-lg bg-background border">
                <PenTool className="h-5 w-5 text-rose-500 mb-2" />
                <h3 className="font-medium mb-1">Writing Craft</h3>
                <p className="text-sm text-muted-foreground">
                  Tips on pacing, tension, and crafting unforgettable romance
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <BookOpen className="h-5 w-5 text-rose-500 mb-2" />
                <h3 className="font-medium mb-1">Publishing Insights</h3>
                <p className="text-sm text-muted-foreground">
                  KDP strategies, marketing, and building your author brand
                </p>
              </div>
              <div className="p-4 rounded-lg bg-background border">
                <Sparkles className="h-5 w-5 text-rose-500 mb-2" />
                <h3 className="font-medium mb-1">AI & Creativity</h3>
                <p className="text-sm text-muted-foreground">
                  How to use AI tools ethically and effectively
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12">
            <p className="text-muted-foreground mb-4">
              Ready to start writing your next bestseller?
            </p>
            <Button asChild size="lg" className="bg-rose-500 hover:bg-rose-600">
              <Link href="/signup">
                Try Ember Free
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 88Away LLC. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
