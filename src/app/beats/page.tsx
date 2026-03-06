'use client';

import { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { BeatBoard } from '@/components/beats/beat-board';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import {
  Target,
  Plus,
  BookOpen,
  ChevronDown
} from 'lucide-react';

// Mock data - replace with actual API calls
const mockBeats = [
  {
    id: '1',
    name: 'Setup',
    type: 'setup' as const,
    description: 'Establish the protagonist in their ordinary world',
    order: 1,
    targetWordCount: 5000,
    actualWordCount: 4200,
    status: 'complete' as const,
  },
  {
    id: '2',
    name: 'Meet Cute',
    type: 'meet-cute' as const,
    description: 'The first meeting between the romantic leads',
    order: 2,
    targetWordCount: 3000,
    actualWordCount: 2800,
    status: 'complete' as const,
  },
  {
    id: '3',
    name: 'Resistance',
    type: 'resistance' as const,
    description: 'Why this romance can never work',
    order: 3,
    targetWordCount: 5000,
    actualWordCount: 1200,
    status: 'drafting' as const,
  },
  {
    id: '4',
    name: 'Deepening Desire',
    type: 'deepening' as const,
    description: 'Growing attraction despite resistance',
    order: 4,
    targetWordCount: 8000,
    actualWordCount: 0,
    status: 'pending' as const,
  },
];

export default function BeatsPage() {
  const [beats, setBeats] = useState(mockBeats);
  const [selectedProject, setSelectedProject] = useState<string | null>('project-1');
  const [loading, setLoading] = useState(false);

  const handleAddBeat = (beat: any) => {
    const newBeat = {
      ...beat,
      id: crypto.randomUUID(),
    };
    setBeats(prev => [...prev, newBeat]);
  };

  const handleUpdateBeat = (id: string, updates: any) => {
    setBeats(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const handleDeleteBeat = (id: string) => {
    setBeats(prev => prev.filter(b => b.id !== id));
  };

  const handleReorderBeats = (reorderedBeats: any[]) => {
    setBeats(reorderedBeats);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="h-7 w-7 text-rose-500" />
              Beat Sheets
            </h1>
            <p className="text-muted-foreground">
              Structure your romance with proven story templates
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              Templates
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Project Selector - in a real app this would be a dropdown */}
        {!selectedProject ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium mb-2">Select a Project</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose a project to view and edit its beat sheet
              </p>
              <Button>Select Project</Button>
            </CardContent>
          </Card>
        ) : (
          <BeatBoard
            projectId={selectedProject}
            beats={beats}
            onAddBeat={handleAddBeat}
            onUpdateBeat={handleUpdateBeat}
            onDeleteBeat={handleDeleteBeat}
            onReorderBeats={handleReorderBeats}
            totalWordTarget={80000}
          />
        )}
      </div>
    </DashboardShell>
  );
}
