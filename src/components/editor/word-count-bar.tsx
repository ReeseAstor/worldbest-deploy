'use client';

import type { Editor } from '@tiptap/react';
import { useEditorStore } from '@/stores/editor-store';

interface WordCountBarProps {
  editor: Editor;
}

export function WordCountBar({ editor }: WordCountBarProps) {
  const wordCount = useEditorStore((s) => s.wordCount);
  const sessionWordCount = useEditorStore((s) => s.sessionWordCount);
  const isSaving = useEditorStore((s) => s.isSaving);
  const lastSavedAt = useEditorStore((s) => s.lastSavedAt);
  const editorMode = useEditorStore((s) => s.editorMode);

  const charCount = editor.storage.characterCount?.characters() ?? 0;

  const formatTime = (date: Date | null) => {
    if (!date) return 'Not saved yet';
    return `Saved ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="flex items-center justify-between border-t px-4 py-1.5 text-xs text-muted-foreground bg-background/95">
      <div className="flex items-center gap-4">
        <span>{wordCount.toLocaleString()} words</span>
        <span>{charCount.toLocaleString()} characters</span>
        {sessionWordCount > 0 && (
          <span className="text-primary">+{sessionWordCount.toLocaleString()} this session</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span className="capitalize">{editorMode} mode</span>
        <span>
          {isSaving ? (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {formatTime(lastSavedAt)}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
