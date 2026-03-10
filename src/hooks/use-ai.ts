'use client';

import { useCallback, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  generateDraft,
  generateWithSlashCommand,
  getLineEdits,
  handleSuggestion,
  type AIGenerateRequest,
  type SlashCommandRequest,
  type LineEditSuggestion,
} from '@/lib/api/ai';

/**
 * Hook for streaming AI generation (general draft mode).
 * Returns a start function + accumulated text + loading/error state.
 */
export function useAIGeneration() {
  const abortRef = useRef<AbortController | null>(null);
  const textRef = useRef('');

  const mutation = useMutation({
    mutationFn: async ({
      request,
      onChunk,
    }: {
      request: AIGenerateRequest;
      onChunk: (fullText: string, chunk: string) => void;
    }) => {
      abortRef.current = new AbortController();
      textRef.current = '';
      for await (const chunk of generateDraft(request, abortRef.current.signal)) {
        textRef.current += chunk;
        onChunk(textRef.current, chunk);
      }
      return textRef.current;
    },
  });

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    generate: mutation.mutate,
    generateAsync: mutation.mutateAsync,
    abort,
    isGenerating: mutation.isPending,
    error: mutation.error,
    generatedText: textRef.current,
    reset: mutation.reset,
  };
}

/**
 * Hook for slash command streaming (/draft, /scene, /dialogue, etc).
 */
export function useSlashCommand() {
  const abortRef = useRef<AbortController | null>(null);
  const textRef = useRef('');

  const mutation = useMutation({
    mutationFn: async ({
      request,
      onChunk,
    }: {
      request: SlashCommandRequest;
      onChunk: (fullText: string, chunk: string) => void;
    }) => {
      abortRef.current = new AbortController();
      textRef.current = '';
      for await (const chunk of generateWithSlashCommand(request, abortRef.current.signal)) {
        textRef.current += chunk;
        onChunk(textRef.current, chunk);
      }
      return textRef.current;
    },
  });

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    execute: mutation.mutate,
    executeAsync: mutation.mutateAsync,
    abort,
    isGenerating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook for line edit suggestions.
 */
export function useLineEdits(chapterId: string | null, editTypes?: string[]) {
  return useQuery<LineEditSuggestion[]>({
    queryKey: ['line-edits', chapterId, editTypes],
    queryFn: () => getLineEdits(chapterId!, editTypes),
    enabled: false, // manually triggered
  });
}

/**
 * Hook for accepting/rejecting a suggestion.
 */
export function useHandleSuggestion() {
  return useMutation({
    mutationFn: ({ suggestionId, action }: { suggestionId: string; action: 'accept' | 'reject' }) =>
      handleSuggestion(suggestionId, action),
  });
}
