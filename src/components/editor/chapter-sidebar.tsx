'use client';

import { Button } from '@ember/ui-components';
import { useEditorStore } from '@/stores/editor-store';
import { Plus, FileText } from 'lucide-react';

interface ChapterSidebarProps {
  onChapterSelect: (chapterId: string) => void;
  onCreateChapter: () => void;
}

export function ChapterSidebar({ onChapterSelect, onCreateChapter }: ChapterSidebarProps) {
  const chapterList = useEditorStore((s) => s.chapterList);
  const currentChapterId = useEditorStore((s) => s.currentChapterId);

  return (
    <div className="w-56 border-r bg-muted/30 flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <span className="text-sm font-semibold">Chapters</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onCreateChapter}
          title="New Chapter"
          type="button"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {chapterList.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            No chapters yet.
            <br />
            Click + to create one.
          </div>
        ) : (
          chapterList.map((ch) => (
            <button
              key={ch.id}
              onClick={() => onChapterSelect(ch.id)}
              className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors ${
                ch.id === currentChapterId
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              }`}
              type="button"
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">
                  Ch. {ch.number}: {ch.title}
                </div>
                <div className="text-xs text-muted-foreground">
                  {ch.wordCount.toLocaleString()} words
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
