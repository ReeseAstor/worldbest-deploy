'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import {
  Users,
  Heart,
  Map,
  Clock,
  Shield,
  Sparkles,
  Plus,
  Search,
  BookHeart,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';

// Bible entity types
type BibleEntityType = 'characters' | 'relationships' | 'world' | 'timeline' | 'continuity';

interface BibleStats {
  characters: number;
  relationships: number;
  locations: number;
  timelineEvents: number;
  continuityRules: number;
}

const BIBLE_SECTIONS = [
  {
    id: 'characters',
    title: 'Characters',
    description: 'Manage your cast with romance-specific attributes, speech patterns, and POV voice notes.',
    icon: Users,
    color: 'text-rose-500',
    bgColor: 'bg-rose-100 dark:bg-rose-900',
    href: '/bible/characters',
  },
  {
    id: 'relationships',
    title: 'Relationships',
    description: 'Track romantic dynamics, alliance, rivalries, and relationship evolution across your series.',
    icon: Heart,
    color: 'text-pink-500',
    bgColor: 'bg-pink-100 dark:bg-pink-900',
    href: '/bible/relationships',
  },
  {
    id: 'world',
    title: 'World Building',
    description: 'Define magic systems, factions, geography, cultures, and setting constraints.',
    icon: Map,
    color: 'text-violet-500',
    bgColor: 'bg-violet-100 dark:bg-violet-900',
    href: '/bible/world',
  },
  {
    id: 'timeline',
    title: 'Timeline',
    description: 'Track events chronologically across your series with chapter references.',
    icon: Clock,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900',
    href: '/bible/timeline',
  },
  {
    id: 'continuity',
    title: 'Continuity Rules',
    description: 'Define hard constraints the AI must enforce for consistency.',
    icon: Shield,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900',
    href: '/bible/continuity',
  },
];

export default function BibleDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<BibleStats>({
    characters: 0,
    relationships: 0,
    locations: 0,
    timelineEvents: 0,
    continuityRules: 0,
  });
  const [recentEntities, setRecentEntities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch actual data from API
    // Simulating data fetch
    setTimeout(() => {
      setStats({
        characters: 12,
        relationships: 8,
        locations: 5,
        timelineEvents: 24,
        continuityRules: 3,
      });
      setRecentEntities([
        { type: 'character', name: 'Elena Blackwood', updatedAt: new Date() },
        { type: 'character', name: 'Marcus Shadowbane', updatedAt: new Date() },
        { type: 'relationship', name: 'Elena & Marcus', updatedAt: new Date() },
        { type: 'location', name: 'The Shadow Court', updatedAt: new Date() },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookHeart className="h-7 w-7 text-rose-500" />
              Series Bible
            </h1>
            <p className="text-muted-foreground">
              Your story knowledge base. Everything here feeds into AI generation.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search bible..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900">
                  <Users className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.characters}</p>
                  <p className="text-xs text-muted-foreground">Characters</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900">
                  <Heart className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.relationships}</p>
                  <p className="text-xs text-muted-foreground">Relationships</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900">
                  <Map className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.locations}</p>
                  <p className="text-xs text-muted-foreground">Locations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.timelineEvents}</p>
                  <p className="text-xs text-muted-foreground">Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                  <Shield className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.continuityRules}</p>
                  <p className="text-xs text-muted-foreground">Rules</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bible Sections */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {BIBLE_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.id} href={section.href}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${section.bgColor}`}>
                        <Icon className={`h-5 w-5 ${section.color}`} />
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Recent Activity & AI Context Info */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Updates</CardTitle>
              <CardDescription>Latest changes to your series bible</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : recentEntities.length > 0 ? (
                <div className="space-y-3">
                  {recentEntities.map((entity, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {entity.type === 'character' && <Users className="h-4 w-4 text-rose-500" />}
                        {entity.type === 'relationship' && <Heart className="h-4 w-4 text-pink-500" />}
                        {entity.type === 'location' && <Map className="h-4 w-4 text-violet-500" />}
                        <span className="font-medium text-sm">{entity.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Just now</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No recent activity</p>
              )}
            </CardContent>
          </Card>

          {/* AI Context Info */}
          <Card className="bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-950 dark:to-amber-950 border-rose-200 dark:border-rose-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-rose-500" />
                AI Context
              </CardTitle>
              <CardDescription>How your bible feeds into AI generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Every entry in your Series Bible is automatically indexed and retrieved when generating content. 
                The AI will:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Users className="h-4 w-4 mt-0.5 text-rose-500 flex-shrink-0" />
                  <span>Match character voice and speech patterns</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="h-4 w-4 mt-0.5 text-pink-500 flex-shrink-0" />
                  <span>Respect relationship dynamics and current stages</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                  <span>Enforce continuity rules automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 mt-0.5 text-amber-500 flex-shrink-0" />
                  <span>Reference timeline for consistency</span>
                </li>
              </ul>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-100/50 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-xs">
                  Tip: The more detailed your bible entries, the more consistent your AI-generated content will be.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
