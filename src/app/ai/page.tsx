'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Flame,
  Mic2,
  PenTool,
  MessageSquare,
  Edit3,
  FileText,
  Zap,
  Settings,
  Play,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react';

interface AITask {
  id: string;
  name: string;
  description: string;
  icon: typeof Sparkles;
  color: string;
  bgColor: string;
}

const AI_TASKS: AITask[] = [
  {
    id: 'creative-drafting',
    name: 'Creative Drafting',
    description: 'Continue your manuscript with AI that matches your voice',
    icon: PenTool,
    color: 'text-rose-500',
    bgColor: 'bg-rose-100 dark:bg-rose-900',
  },
  {
    id: 'steam-scene',
    name: 'Steam Scene',
    description: 'Generate intimate scenes at your preferred heat level',
    icon: Flame,
    color: 'text-red-500',
    bgColor: 'bg-red-100 dark:bg-red-900',
  },
  {
    id: 'dialogue',
    name: 'Dialogue Generation',
    description: 'Create character-specific dialogue with distinct voices',
    icon: MessageSquare,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900',
  },
  {
    id: 'line-editing',
    name: 'Line Editing',
    description: 'Polish prose while preserving your unique style',
    icon: Edit3,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900',
  },
  {
    id: 'developmental-edit',
    name: 'Developmental Edit',
    description: 'Get structural feedback on pacing, arcs, and tension',
    icon: FileText,
    color: 'text-violet-500',
    bgColor: 'bg-violet-100 dark:bg-violet-900',
  },
  {
    id: 'beat-advance',
    name: 'Beat Advance',
    description: 'Write toward your next story beat target',
    icon: Zap,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900',
  },
];

interface UsageStats {
  wordsGenerated: number;
  wordsLimit: number;
  tasksCompleted: number;
  avgAcceptanceRate: number;
}

export default function AIStudioPage() {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [steamLevel, setSteamLevel] = useState(3);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const stats: UsageStats = {
    wordsGenerated: 45230,
    wordsLimit: 150000,
    tasksCompleted: 127,
    avgAcceptanceRate: 78,
  };

  const usagePercent = (stats.wordsGenerated / stats.wordsLimit) * 100;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-rose-500" />
              AI Studio
            </h1>
            <p className="text-muted-foreground">
              Genre-tuned AI tools for romantasy authors
            </p>
          </div>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            AI Settings
          </Button>
        </div>

        {/* Usage Stats */}
        <Card className="bg-gradient-to-br from-rose-50 to-amber-50 dark:from-rose-950 dark:to-amber-950">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Words This Month</p>
                <p className="text-2xl font-bold">{stats.wordsGenerated.toLocaleString()}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{usagePercent.toFixed(0)}% used</span>
                    <span>{stats.wordsLimit.toLocaleString()} limit</span>
                  </div>
                  <div className="h-2 bg-white/50 dark:bg-black/30 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${usagePercent > 90 ? 'bg-red-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tasks Completed</p>
                <p className="text-2xl font-bold">{stats.tasksCompleted}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Acceptance Rate</p>
                <p className="text-2xl font-bold">{stats.avgAcceptanceRate}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Active Features</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {voiceEnabled && (
                    <Badge variant="secondary" className="text-xs">
                      <Mic2 className="h-3 w-3 mr-1" />
                      Voice
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    <Flame className="h-3 w-3 mr-1" />
                    Steam {steamLevel}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Settings */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                    <Flame className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium">Steam Level</p>
                    <p className="text-sm text-muted-foreground">
                      {steamLevel === 1 && 'Closed Door'}
                      {steamLevel === 2 && 'Warm'}
                      {steamLevel === 3 && 'Steamy'}
                      {steamLevel === 4 && 'Spicy'}
                      {steamLevel === 5 && 'Scorching'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setSteamLevel(level)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        steamLevel === level 
                          ? 'bg-red-500 text-white' 
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900">
                    <Mic2 className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="font-medium">Voice Matching</p>
                    <p className="text-sm text-muted-foreground">
                      {voiceEnabled ? 'AI matches your writing style' : 'Using default style'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    voiceEnabled ? 'bg-violet-500' : 'bg-muted'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    voiceEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Tasks Grid */}
        <div>
          <h2 className="text-lg font-semibold mb-4">AI Tasks</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {AI_TASKS.map(task => {
              const Icon = task.icon;
              const isSelected = selectedTask === task.id;
              
              return (
                <Card 
                  key={task.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-rose-500 bg-rose-50/50 dark:bg-rose-950/30' : ''
                  }`}
                  onClick={() => setSelectedTask(isSelected ? null : task.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${task.bgColor}`}>
                        <Icon className={`h-6 w-6 ${task.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{task.name}</h3>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t">
                        <Button className="w-full bg-rose-500 hover:bg-rose-600">
                          <Play className="h-4 w-4 mr-2" />
                          Start Task
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Recent AI Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { task: 'Creative Drafting', project: 'Shadows of the Fae Court', words: 850, accepted: true },
                { task: 'Steam Scene', project: 'Shadows of the Fae Court', words: 1200, accepted: true },
                { task: 'Line Editing', project: 'Blood & Thorns', words: 450, accepted: false },
                { task: 'Dialogue', project: 'Shadows of the Fae Court', words: 320, accepted: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <CheckCircle className={`h-4 w-4 ${item.accepted ? 'text-emerald-500' : 'text-muted-foreground'}`} />
                    <div>
                      <p className="font-medium text-sm">{item.task}</p>
                      <p className="text-xs text-muted-foreground">{item.project}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.words} words</p>
                    <p className="text-xs text-muted-foreground">{item.accepted ? 'Accepted' : 'Edited'}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
