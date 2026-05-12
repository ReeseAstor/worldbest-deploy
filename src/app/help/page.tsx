'use client';

import { useState } from 'react';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { Input } from '@/components/ui/input';
import { 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  Mail, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  Flame,
  Sparkles,
  PenTool,
  Target
} from 'lucide-react';

const faqs = [
  {
    question: 'What is steam level calibration?',
    answer: 'Steam levels (1-5) control how explicit your AI-generated content is. Level 1 is "Closed Door" (fade to black), while Level 5 is "Scorching" (fully explicit). Each level has specific vocabulary guidelines to maintain consistency.',
    category: 'features',
  },
  {
    question: 'How does voice fingerprinting work?',
    answer: 'Voice fingerprinting analyzes your writing samples to capture your unique style - sentence length patterns, dialogue ratios, vocabulary preferences, and POV depth. The AI then mimics these patterns when generating new content.',
    category: 'features',
  },
  {
    question: 'What are beat sheets?',
    answer: 'Beat sheets are story structure templates tailored for romance. Ember includes templates like "Romancing the Beat" and "Dark Romance Arc" that help you plan your story\'s emotional journey.',
    category: 'features',
  },
  {
    question: 'How many AI words do I get?',
    answer: 'Free plans include 5,000 AI words/month. Paid plans range from 50,000 (Spark) to 500,000 (Inferno) words per month. Words reset on your billing date.',
    category: 'billing',
  },
  {
    question: 'Can I export to KDP?',
    answer: 'Yes! Flame and Inferno plans include KDP-ready export with proper trim sizes, fonts, and formatting for both eBook and print.',
    category: 'export',
  },
  {
    question: 'Is my content private?',
    answer: 'Absolutely. Your manuscripts, characters, and world-building notes are encrypted and never used to train AI models. Only you can access your content.',
    category: 'privacy',
  },
];

const guides = [
  { title: 'Getting Started with Ember', icon: Flame, href: '#' },
  { title: 'Using AI for Drafting', icon: Sparkles, href: '#' },
  { title: 'Setting Up Your Voice Profile', icon: PenTool, href: '#' },
  { title: 'Planning with Beat Sheets', icon: Target, href: '#' },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
        <p className="text-muted-foreground mt-2">Find answers and get support</p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {guides.map((guide) => (
          <Card key={guide.title} className="hover:border-primary transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <guide.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{guide.title}</p>
                  <p className="text-xs text-muted-foreground">Read guide</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Quick answers to common questions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="border rounded-lg">
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <span className="font-medium">{faq.question}</span>
                {expandedFaq === index ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {expandedFaq === index && (
                <div className="px-4 pb-4 text-sm text-muted-foreground">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Contact */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <CardTitle>Community</CardTitle>
            </div>
            <CardDescription>Join our Discord for tips and support</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Join Discord
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>Email Support</CardTitle>
            </div>
            <CardDescription>Get help from our support team</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Contact Support
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
