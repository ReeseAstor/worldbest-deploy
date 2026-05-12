'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@ember/ui-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ember/ui-components';
import { useProject, useDeleteProject } from '@/hooks/use-projects';
import { useBooks, useCreateBook } from '@/hooks/use-books';
import {
  PenTool,
  Plus,
  BookOpen,
  Trash2,
  ArrowLeft,
  Settings,
  Flame,
} from 'lucide-react';
import { HEAT_LEVEL_LABELS, HeatLevel } from '@ember/shared-types/src/entities';

export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = params.projectId;

  const { data: project, isLoading } = useProject(projectId);
  const { data: books } = useBooks(projectId);
  const createBook = useCreateBook();
  const deleteProject = useDeleteProject();

  const handleCreateBook = async () => {
    const order = books ? books.length + 1 : 1;
    await createBook.mutateAsync({
      projectId,
      data: { title: `Book ${order}`, order },
    });
  };

  const handleDeleteProject = async () => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;
    await deleteProject.mutateAsync(projectId);
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Project not found.
      </div>
    );
  }

  const heatLevel = project.settings?.steam_calibration?.project_heat_level as HeatLevel | undefined;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} type="button">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              <span>{project.genre}</span>
              {heatLevel && (
                <span className="flex items-center gap-1">
                  <Flame className="h-3 w-3" />
                  {HEAT_LEVEL_LABELS[heatLevel]}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/projects/${projectId}/write`}>
              <PenTool className="h-4 w-4 mr-1" />
              Write
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDeleteProject} title="Delete project" type="button">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Synopsis */}
      {project.synopsis && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Synopsis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {project.synopsis}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Books */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Books</h2>
          <Button size="sm" onClick={handleCreateBook} type="button">
            <Plus className="h-4 w-4 mr-1" />
            Add Book
          </Button>
        </div>

        {books && books.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {books.map((book) => (
              <Card key={book.id} className="group hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{book.title}</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardDescription className="capitalize">{book.status}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {book.blurb && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{book.blurb}</p>
                  )}
                  {book.target_word_count && (
                    <p className="text-xs text-muted-foreground">
                      Target: {book.target_word_count.toLocaleString()} words
                    </p>
                  )}
                  <Button size="sm" className="w-full" asChild>
                    <Link href={`/dashboard/projects/${projectId}/write`}>
                      <PenTool className="h-3 w-3 mr-1" />
                      Write
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-4">
                No books yet. Create your first book to start writing.
              </p>
              <Button onClick={handleCreateBook} type="button">
                <Plus className="h-4 w-4 mr-1" />
                Create First Book
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
