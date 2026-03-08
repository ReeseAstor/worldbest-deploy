'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import {
  ArrowLeft,
  BookOpen,
  PenTool,
  Users,
  Settings,
  FileText,
  Sparkles,
  Clock,
  Target,
  TrendingUp,
  MoreVertical,
  Plus,
  Play,
  Flame
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';

// Mock project data - will be replaced with real API calls
const mockProject = {
  id: '1',
  title: 'The Dragon\'s Heart',
  synopsis: 'A powerful sorceress must choose between her duty to protect her kingdom and her forbidden love for the dragon prince who threatens to burn it all down.',
  genre: 'Romantasy',
  subgenre: 'Fantasy Romance',
  wordCount: 45000,
  targetWordCount: 80000,
  steamLevel: 4,
  status: 'drafting',
  chapters: [
    { id: '1', title: 'Chapter 1: The Summoning', wordCount: 3500, status: 'complete' },
    { id: '2', title: 'Chapter 2: Fire and Ice', wordCount: 4200, status: 'complete' },
    { id: '3', title: 'Chapter 3: The First Spark', wordCount: 3800, status: 'drafting' },
    { id: '4', title: 'Chapter 4: Forbidden Territory', wordCount: 0, status: 'outlined' },
  ],
  characters: [
    { id: '1', name: 'Seraphina Vale', role: 'FMC', scenes: 12 },
    { id: '2', name: 'Drayven Blackfire', role: 'MMC', scenes: 10 },
    { id: '3', name: 'Queen Isolde', role: 'antagonist', scenes: 5 },
  ],
  lastModified: new Date('2024-01-15'),
  createdAt: new Date('2023-12-01'),
};

const steamLabels = ['Closed Door', 'Warm', 'Steamy', 'Spicy', 'Scorching'];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState(mockProject);

  const progressPercentage = (project.wordCount / project.targetWordCount) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
            <p className="text-muted-foreground">{project.genre} · {project.subgenre}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button asChild>
            <Link href={`/projects/${params.id}/write`}>
              <PenTool className="h-4 w-4 mr-2" />
              Continue Writing
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Word Count</p>
                <p className="text-2xl font-bold">{project.wordCount.toLocaleString()}</p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round(progressPercentage)}% of {project.targetWordCount.toLocaleString()} goal
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Chapters</p>
                <p className="text-2xl font-bold">{project.chapters.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {project.chapters.filter(c => c.status === 'complete').length} complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Characters</p>
                <p className="text-2xl font-bold">{project.characters.length}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              In series bible
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Steam Level</p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {project.steamLevel}
                  <Flame className="h-5 w-5 text-orange-500" />
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {steamLabels[project.steamLevel - 1]}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Chapters */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Chapters</CardTitle>
                <CardDescription>Manage your manuscript structure</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Chapter
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {project.chapters.map((chapter, index) => (
                  <div
                    key={chapter.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-6">{index + 1}</span>
                      <div>
                        <p className="font-medium">{chapter.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {chapter.wordCount.toLocaleString()} words
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        chapter.status === 'complete' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        chapter.status === 'drafting' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {chapter.status}
                      </span>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Synopsis */}
          <Card>
            <CardHeader>
              <CardTitle>Synopsis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{project.synopsis}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href={`/projects/${params.id}/write`}>
                  <PenTool className="h-4 w-4 mr-2" />
                  Open Editor
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Writing Session
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Series Bible
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Beat Sheet
              </Button>
            </CardContent>
          </Card>

          {/* Characters */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Characters</CardTitle>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.characters.map((character) => (
                  <div key={character.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{character.name}</p>
                      <p className="text-xs text-muted-foreground">{character.role}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {character.scenes} scenes
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p>Last edited</p>
                    <p className="text-muted-foreground">
                      {project.lastModified.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Play className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p>Created</p>
                    <p className="text-muted-foreground">
                      {project.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
