'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@ember/ui-components';
import { Sparkles, ChevronLeft, Plus, PenTool } from 'lucide-react';
import { useProject } from '@/hooks/use-projects';
import { useBooks } from '@/hooks/use-books';
import { useChapters, useCreateChapter } from '@/hooks/use-chapters';
import { useChapter } from '@/hooks/use-chapters';
import { useAutosave } from '@/hooks/use-autosave';
import { useEditorStore } from '@/stores/editor-store';
import { EmberEditor } from '@/components/editor/ember-editor';
import { ChapterSidebar } from '@/components/editor/chapter-sidebar';
import { AIPanel } from '@/components/editor/ai-panel';
import { LineEditPanel } from '@/components/editor/line-edit-panel';
import type { ChapterContentUpdate } from '@/lib/api/chapters';

export default function WritePage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = params.projectId;

  // Store actions
  const setCurrentProject = useEditorStore((s) => s.setCurrentProject);
  const setCurrentBook = useEditorStore((s) => s.setCurrentBook);
  const setCurrentChapter = useEditorStore((s) => s.setCurrentChapter);
  const setChapterList = useEditorStore((s) => s.setChapterList);
  const currentBookId = useEditorStore((s) => s.currentBookId);
  const currentChapterId = useEditorStore((s) => s.currentChapterId);
  const isAIPanelOpen = useEditorStore((s) => s.isAIPanelOpen);
  const toggleAIPanel = useEditorStore((s) => s.toggleAIPanel);
  const editorMode = useEditorStore((s) => s.editorMode);
  const setEditorMode = useEditorStore((s) => s.setEditorMode);
  const autoSaveEnabled = useEditorStore((s) => s.autoSaveEnabled);

  // Queries
  const { data: project } = useProject(projectId);
  const { data: books } = useBooks(projectId);
  const { data: chapters } = useChapters(currentBookId);
  const { data: chapterDetail } = useChapter(currentChapterId);

  // Mutations
  const createChapterMutation = useCreateChapter(currentBookId || '');

  // Autosave
  const { triggerSave } = useAutosave({
    chapterId: currentChapterId,
    enabled: autoSaveEnabled,
  });

  // Insert ref for AI panel
  const [pendingInsert, setPendingInsert] = useState<string | null>(null);

  // Initialize project context
  useEffect(() => {
    setCurrentProject(projectId);
  }, [projectId, setCurrentProject]);

  // Auto-select first book
  useEffect(() => {
    if (books && books.length > 0 && !currentBookId) {
      setCurrentBook(books[0].id);
    }
  }, [books, currentBookId, setCurrentBook]);

  // Sync chapter list to store
  useEffect(() => {
    if (chapters) {
      setChapterList(
        chapters.map((ch) => ({
          id: ch.id,
          number: ch.number,
          title: ch.title,
          wordCount: ch.word_count,
          status: ch.status,
        })),
      );
    }
  }, [chapters, setChapterList]);

  // Auto-select first chapter
  useEffect(() => {
    if (chapters && chapters.length > 0 && !currentChapterId) {
      setCurrentChapter(chapters[0].id);
    }
  }, [chapters, currentChapterId, setCurrentChapter]);

  const handleChapterSelect = useCallback(
    (chapterId: string) => {
      setCurrentChapter(chapterId);
    },
    [setCurrentChapter],
  );

  const handleCreateChapter = useCallback(async () => {
    if (!currentBookId) return;
    const nextNumber = chapters ? chapters.length + 1 : 1;
    const result = await createChapterMutation.mutateAsync({
      number: nextNumber,
      title: `Chapter ${nextNumber}`,
    });
    setCurrentChapter(result.id);
  }, [currentBookId, chapters, createChapterMutation, setCurrentChapter]);

  const handleEditorUpdate = useCallback(
    (data: ChapterContentUpdate) => {
      triggerSave(data);
    },
    [triggerSave],
  );

  const handleAIInsert = useCallback((text: string) => {
    setPendingInsert(text);
  }, []);

  // Clear pending insert after it's consumed
  useEffect(() => {
    if (pendingInsert) setPendingInsert(null);
  }, [pendingInsert]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push(`/dashboard/projects/${projectId}`)}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-sm font-semibold truncate max-w-[300px]">
              {project?.title || 'Loading...'}
            </h1>
            {chapterDetail && (
              <p className="text-xs text-muted-foreground">
                Ch. {chapterDetail.number}: {chapterDetail.title}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode toggle */}
          <div className="flex rounded-md border">
            <button
              onClick={() => setEditorMode('write')}
              className={`px-3 py-1 text-xs font-medium transition-colors rounded-l-md ${
                editorMode === 'write'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
              type="button"
            >
              Write
            </button>
            <button
              onClick={() => setEditorMode('edit')}
              className={`px-3 py-1 text-xs font-medium transition-colors rounded-r-md ${
                editorMode === 'edit'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
              type="button"
            >
              Edit
            </button>
          </div>

          <Button
            variant={isAIPanelOpen ? 'default' : 'outline'}
            size="sm"
            onClick={toggleAIPanel}
            type="button"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            AI
          </Button>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        <ChapterSidebar
          onChapterSelect={handleChapterSelect}
          onCreateChapter={handleCreateChapter}
        />

        <div className="flex-1 relative">
          {currentChapterId ? (
            <EmberEditor
              content={chapterDetail?.content_json}
              onUpdate={handleEditorUpdate}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
              <p>No chapter selected.</p>
              {currentBookId && (
                <Button onClick={handleCreateChapter} type="button">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Chapter
                </Button>
              )}
            </div>
          )}
        </div>

        <AIPanel onInsert={handleAIInsert} />

        {/* Line Edit Panel: visible only in edit mode */}
        {editorMode === 'edit' && (
          <div className="w-80 border-l">
            <LineEditPanel />
          </div>
        )}
      </div>
    </div>
  );
}
