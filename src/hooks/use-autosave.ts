'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSaveChapterContent } from './use-chapters';
import { useEditorStore } from '@/stores/editor-store';
import type { ChapterContentUpdate } from '@/lib/api/chapters';

interface UseAutosaveOptions {
  chapterId: string | null;
  /** Debounce delay in ms (default: 2000) */
  delay?: number;
  /** Whether autosave is enabled */
  enabled?: boolean;
}

/**
 * Autosave hook that debounces chapter content saves.
 * Call `triggerSave(content)` whenever the editor content changes.
 */
export function useAutosave({ chapterId, delay = 2000, enabled = true }: UseAutosaveOptions) {
  const { mutateAsync: saveContent, isPending } = useSaveChapterContent();
  const setSaving = useEditorStore((s) => s.setSaving);
  const setLastSavedAt = useEditorStore((s) => s.setLastSavedAt);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<ChapterContentUpdate | null>(null);
  const chapterIdRef = useRef(chapterId);
  chapterIdRef.current = chapterId;

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const data = pendingRef.current;
    const id = chapterIdRef.current;
    if (!data || !id) return;
    pendingRef.current = null;

    try {
      setSaving(true);
      await saveContent({ chapterId: id, data });
      setLastSavedAt(new Date());
    } catch (err) {
      // Re-queue on failure so it retries on next trigger
      pendingRef.current = data;
      console.error('[autosave] failed:', err);
    } finally {
      setSaving(false);
    }
  }, [saveContent, setSaving, setLastSavedAt]);

  const triggerSave = useCallback(
    (data: ChapterContentUpdate) => {
      if (!enabled || !chapterIdRef.current) return;
      pendingRef.current = data;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, delay);
    },
    [enabled, delay, flush],
  );

  // Flush on unmount or chapter change
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      // Fire-and-forget final save
      if (pendingRef.current && chapterIdRef.current) {
        flush();
      }
    };
  }, [chapterId, flush]);

  return {
    triggerSave,
    flush,
    isSaving: isPending,
  };
}
