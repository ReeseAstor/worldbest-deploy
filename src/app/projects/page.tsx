'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  BookOpen,
  Users,
  MoreVertical,
  Star,
  Grid,
  List,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { format } from 'date-fns';
import { useProjects, useDeleteProject } from '@/hooks/queries/use-projects';
import type { Project } from '@/lib/database.types';

export default function ProjectsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title' | 'progress'>('updated');

  // Use real data from Supabase
  const { data: projects, isLoading, error } = useProjects();
  const deleteProject = useDeleteProject();

  const genres = ['all', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Thriller', 'Horror', 'Literary', 'Historical'];
  const statuses = ['all', 'planning', 'drafting', 'editing', 'complete', 'published'];

  const filteredProjects = (projects || []).filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || project.genre.toLowerCase() === selectedGenre.toLowerCase();
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    
    return matchesSearch && matchesGenre && matchesStatus;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'updated':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case 'created':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'title':
        return a.title.localeCompare(b.title);
      case 'progress':
        const progressA = a.target_word_count > 0 ? (a.current_word_count / a.target_word_count) * 100 : 0;
        const progressB = b.target_word_count > 0 ? (b.current_word_count / b.target_word_count) * 100 : 0;
        return progressB - progressA;
      default:
        return 0;
    }
  });

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'planning':
        return 'text-blue-600 bg-blue-100';
      case 'drafting':
        return 'text-yellow-600 bg-yellow-100';
      case 'editing':
        return 'text-purple-600 bg-purple-100';
      case 'complete':
        return 'text-green-600 bg-green-100';
      case 'published':
        return 'text-emerald-600 bg-emerald-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const ProjectCard = ({ project }: { project: Project }) => {
    const progress = project.target_word_count > 0 
      ? Math.min((project.current_word_count / project.target_word_count) * 100, 100)
      : 0;

    return (
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {project.title}
              </CardTitle>
              <CardDescription className="mt-1 line-clamp-2">
                {project.description || 'No description'}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                // Open menu
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 text-xs rounded-full bg-secondary">
              {project.genre}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
            {project.steam_level && project.steam_level > 0 && (
              <span className="px-2 py-1 text-xs rounded-full bg-rose-100 text-rose-600">
                🔥 {project.steam_level}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{project.current_word_count.toLocaleString()} / {project.target_word_count.toLocaleString()} words</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Updated {format(new Date(project.updated_at), 'MMM d, yyyy')}</span>
            <span>{Math.round(progress)}%</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/projects/${project.id}`);
              }}
            >
              Open
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/projects/${project.id}/write`);
              }}
            >
              Write
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <BookOpen className="h-12 w-12 text-destructive" />
            <div>
              <h3 className="text-lg font-semibold">Error loading projects</h3>
              <p className="text-muted-foreground mt-2">
                {error.message || 'Something went wrong. Please try again.'}
              </p>
            </div>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-muted-foreground">
            Manage and organize your writing projects
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4 p-4 bg-card rounded-lg border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>
                  {genre === 'all' ? 'All Genres' : genre}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Date Created</option>
              <option value="title">Title</option>
              <option value="progress">Progress</option>
            </select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="p-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No projects found</h3>
              <p className="text-muted-foreground mt-2">
                {searchQuery || selectedGenre !== 'all' || selectedStatus !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'Create your first project to get started'}
              </p>
            </div>
            {!searchQuery && selectedGenre === 'all' && selectedStatus === 'all' && (
              <Button asChild>
                <Link href="/projects/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' 
          : 'space-y-4'
        }>
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
