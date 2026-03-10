<<<<<<< Local
<<<<<<< Local
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { 
  Plus, 
  BookOpen, 
  Users, 
  PenTool, 
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  FileText,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';

// Mock data - will be replaced with real API calls
const mockProjects = [
  {
    id: '1',
    title: 'The Dragon\'s Legacy',
    genre: 'Fantasy',
    wordCount: 45000,
    targetWordCount: 80000,
    lastModified: new Date('2024-01-15'),
    status: 'in_progress',
    coverUrl: null,
  },
  {
    id: '2',
    title: 'Cyber Shadows',
    genre: 'Sci-Fi',
    wordCount: 23000,
    targetWordCount: 70000,
    lastModified: new Date('2024-01-10'),
    status: 'planning',
    coverUrl: null,
  },
];

const mockStats = {
  totalProjects: 2,
  totalWords: 68000,
  weeklyWords: 3200,
  aiGenerations: 45,
  streak: 7,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects] = useState(mockProjects);
  const [stats] = useState(mockStats);

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.display_name}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your writing projects.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              Active writing projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Words</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Words written across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weeklyWords.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Words written this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Generations</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aiGenerations}</div>
            <p className="text-xs text-muted-foreground">
              AI-assisted content generated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Recent Projects</h2>
          <Button variant="outline" asChild>
            <Link href="/projects">View All</Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="group cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription>{project.genre}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{project.wordCount.toLocaleString()} / {project.targetWordCount.toLocaleString()} words</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${getProgressPercentage(project.wordCount, project.targetWordCount)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {formatDate(project.lastModified)}
                  </div>
                  <div className="flex items-center">
                    <Target className="mr-1 h-3 w-3" />
                    {project.status.replace('_', ' ')}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/projects/${project.id}`}>
                      Open
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/projects/${project.id}/write`}>
                      <PenTool className="mr-1 h-3 w-3" />
                      Write
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Create New Project Card */}
          <Card className="group cursor-pointer border-dashed hover:border-primary transition-colors">
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg mb-2">Create New Project</CardTitle>
              <CardDescription className="mb-4">
                Start a new writing project with AI-powered worldbuilding tools
              </CardDescription>
              <Button asChild>
                <Link href="/projects/new">Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
            <Link href="/projects/new">
              <BookOpen className="h-6 w-6" />
              <span>New Project</span>
            </Link>
          </Button>
          
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
            <Link href="/characters">
              <Users className="h-6 w-6" />
              <span>Manage Characters</span>
            </Link>
          </Button>
          
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
            <Link href="/ai">
              <Sparkles className="h-6 w-6" />
              <span>AI Assistant</span>
            </Link>
          </Button>
          
          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>
            <Link href="/analytics">
              <TrendingUp className="h-6 w-6" />
              <span>View Analytics</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
=======
'use client';



import { useState } from 'react';

import Link from 'next/link';

import { Button } from '@ember/ui-components';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';

import { 

  Plus, 

  BookOpen, 

  Users, 

  PenTool, 

  TrendingUp,

  Clock,

  Target,

  Sparkles,

  FileText,

  MoreVertical

} from 'lucide-react';

import { useAuth } from '@/components/auth/auth-provider';



// Mock data - will be replaced with real API calls

const mockProjects = [

  {

    id: '1',

    title: 'The Dragon\'s Legacy',

    genre: 'Fantasy',

    wordCount: 45000,

    targetWordCount: 80000,

    lastModified: new Date('2024-01-15'),

    status: 'in_progress',

    coverUrl: null,

  },

  {

    id: '2',

    title: 'Cyber Shadows',

    genre: 'Sci-Fi',

    wordCount: 23000,

    targetWordCount: 70000,

    lastModified: new Date('2024-01-10'),

    status: 'planning',

    coverUrl: null,

  },

];



const mockStats = {

  totalProjects: 2,

  totalWords: 68000,

  weeklyWords: 3200,

  aiGenerations: 45,

  streak: 7,

};



export default function DashboardPage() {

  const { user } = useAuth();

  const [projects] = useState(mockProjects);

  const [stats] = useState(mockStats);



  const getProgressPercentage = (current: number, target: number) => {

    return Math.min((current / target) * 100, 100);

  };



  const formatDate = (date: Date) => {

    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(

      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),

      'day'

    );

  };



  return (

    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold tracking-tight">

            Welcome back, {user?.displayName}!

          </h1>

          <p className="text-muted-foreground">

            Here's what's happening with your writing projects.

          </p>

        </div>

        <Button asChild>

          <Link href="/projects/new">

            <Plus className="mr-2 h-4 w-4" />

            New Project

          </Link>

        </Button>

      </div>



      {/* Stats Cards */}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <Card>

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>

            <BookOpen className="h-4 w-4 text-muted-foreground" />

          </CardHeader>

          <CardContent>

            <div className="text-2xl font-bold">{stats.totalProjects}</div>

            <p className="text-xs text-muted-foreground">

              Active writing projects

            </p>

          </CardContent>

        </Card>



        <Card>

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

            <CardTitle className="text-sm font-medium">Total Words</CardTitle>

            <FileText className="h-4 w-4 text-muted-foreground" />

          </CardHeader>

          <CardContent>

            <div className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</div>

            <p className="text-xs text-muted-foreground">

              Words written across all projects

            </p>

          </CardContent>

        </Card>



        <Card>

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

            <CardTitle className="text-sm font-medium">This Week</CardTitle>

            <TrendingUp className="h-4 w-4 text-muted-foreground" />

          </CardHeader>

          <CardContent>

            <div className="text-2xl font-bold">{stats.weeklyWords.toLocaleString()}</div>

            <p className="text-xs text-muted-foreground">

              Words written this week

            </p>

          </CardContent>

        </Card>



        <Card>

          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

            <CardTitle className="text-sm font-medium">AI Generations</CardTitle>

            <Sparkles className="h-4 w-4 text-muted-foreground" />

          </CardHeader>

          <CardContent>

            <div className="text-2xl font-bold">{stats.aiGenerations}</div>

            <p className="text-xs text-muted-foreground">

              AI-assisted content generated

            </p>

          </CardContent>

        </Card>

      </div>



      {/* Recent Projects */}

      <div className="space-y-4">

        <div className="flex items-center justify-between">

          <h2 className="text-2xl font-bold tracking-tight">Recent Projects</h2>

          <Button variant="outline" asChild>

            <Link href="/projects">View All</Link>

          </Button>

        </div>



        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

          {projects.map((project) => (

            <Card key={project.id} className="group cursor-pointer hover:shadow-md transition-shadow">

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">

                <div className="space-y-1">

                  <CardTitle className="text-lg">{project.title}</CardTitle>

                  <CardDescription>{project.genre}</CardDescription>

                </div>

                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">

                  <MoreVertical className="h-4 w-4" />

                </Button>

              </CardHeader>

              <CardContent className="space-y-4">

                <div className="space-y-2">

                  <div className="flex justify-between text-sm">

                    <span>Progress</span>

                    <span>{project.wordCount.toLocaleString()} / {project.targetWordCount.toLocaleString()} words</span>

                  </div>

                  <div className="w-full bg-secondary rounded-full h-2">

                    <div 

                      className="bg-primary h-2 rounded-full transition-all duration-300" 

                      style={{ width: `${getProgressPercentage(project.wordCount, project.targetWordCount)}%` }}

                    />

                  </div>

                </div>



                <div className="flex items-center justify-between text-sm text-muted-foreground">

                  <div className="flex items-center">

                    <Clock className="mr-1 h-3 w-3" />

                    {formatDate(project.lastModified)}

                  </div>

                  <div className="flex items-center">

                    <Target className="mr-1 h-3 w-3" />

                    {project.status.replace('_', ' ')}

                  </div>

                </div>



                <div className="flex gap-2">

                  <Button size="sm" className="flex-1" asChild>

                    <Link href={`/projects/${project.id}`}>

                      Open

                    </Link>

                  </Button>

                  <Button size="sm" variant="outline" asChild>

                    <Link href={`/projects/${project.id}/write`}>

                      <PenTool className="mr-1 h-3 w-3" />

                      Write

                    </Link>

                  </Button>

                </div>

              </CardContent>

            </Card>

          ))}



          {/* Create New Project Card */}

          <Card className="group cursor-pointer border-dashed hover:border-primary transition-colors">

            <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-6">

              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">

                <Plus className="h-6 w-6 text-primary" />

              </div>

              <CardTitle className="text-lg mb-2">Create New Project</CardTitle>

              <CardDescription className="mb-4">

                Start a new writing project with AI-powered worldbuilding tools

              </CardDescription>

              <Button asChild>

                <Link href="/projects/new">Get Started</Link>

              </Button>

            </CardContent>

          </Card>

        </div>

      </div>



      {/* Quick Actions */}

      <div className="space-y-4">

        <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>

            <Link href="/projects/new">

              <BookOpen className="h-6 w-6" />

              <span>New Project</span>

            </Link>

          </Button>

          

          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>

            <Link href="/characters">

              <Users className="h-6 w-6" />

              <span>Manage Characters</span>

            </Link>

          </Button>

          

          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>

            <Link href="/ai">

              <Sparkles className="h-6 w-6" />

              <span>AI Assistant</span>

            </Link>

          </Button>

          

          <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2" asChild>

            <Link href="/analytics">

              <TrendingUp className="h-6 w-6" />

              <span>View Analytics</span>

            </Link>

          </Button>

        </div>

      </div>

    </div>

  );

>>>>>>> Remote
}
=======
'use client';

import Link from 'next/link';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import {
  Plus,
  BookOpen,
  PenTool,
  TrendingUp,
  Clock,
  Target,
  Sparkles,
  FileText,
  MoreVertical,
  Flame,
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { useProjects } from '@/hooks/use-projects';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: projects, isLoading } = useProjects();

  const getProgressPercentage = (current: number, target: number) => {
    if (!target) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day',
    );
  };

  const totalProjects = projects?.length ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{user?.user_metadata?.display_name ? `, ${user.user_metadata.display_name}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your writing projects.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">Active writing projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Genre</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Romantasy</div>
            <p className="text-xs text-muted-foreground">Your primary genre</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Words written this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Generations</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">AI-assisted content generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Recent Projects</h2>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3 animate-pulse">
                    <div className="h-5 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                    <div className="h-2 bg-muted rounded w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => (
              <Card
                key={project.id}
                className="group cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{project.title}</CardTitle>
                    <CardDescription>{project.genre}</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.synopsis && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.synopsis}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatDate(project.updated_at)}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" asChild>
                      <Link href={`/dashboard/projects/${project.id}`}>Open</Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/projects/${project.id}/write`}>
                        <PenTool className="mr-1 h-3 w-3" />
                        Write
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Create New Project Card */}
            <Card className="group cursor-pointer border-dashed hover:border-primary transition-colors">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg mb-2">Create New Project</CardTitle>
                <CardDescription className="mb-4">
                  Start a new romantasy with AI-powered drafting tools
                </CardDescription>
                <Button asChild>
                  <Link href="/dashboard/projects/new">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            asChild
          >
            <Link href="/dashboard/projects/new">
              <BookOpen className="h-6 w-6" />
              <span>New Project</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            asChild
          >
            <Link href="/dashboard/bible">
              <FileText className="h-6 w-6" />
              <span>Series Bible</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            asChild
          >
            <Link href="/dashboard/voice-profile">
              <Sparkles className="h-6 w-6" />
              <span>Voice Profile</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            asChild
          >
            <Link href="/dashboard/analytics">
              <TrendingUp className="h-6 w-6" />
              <span>View Analytics</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

>>>>>>> Remote