'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getChapters,
  getChapter,
  createChapter,
  updateChapter,
  saveChapterContent,
  deleteChapter,
  type ChapterCreate,
  type ChapterUpdate,
  type ChapterContentUpdate,
} from '@/lib/api/chapters';

export const chapterKeys = {
  all: ['chapters'] as const,
  lists: () => [...chapterKeys.all, 'list'] as const,
  list: (bookId: string) => [...chapterKeys.lists(), bookId] as const,
  details: () => [...chapterKeys.all, 'detail'] as const,
  detail: (id: string) => [...chapterKeys.details(), id] as const,
};

export function useChapters(bookId: string | null) {
  return useQuery({
    queryKey: chapterKeys.list(bookId!),
    queryFn: () => getChapters(bookId!),
    enabled: !!bookId,
  });
}

export function useChapter(chapterId: string | null) {
  return useQuery({
    queryKey: chapterKeys.detail(chapterId!),
    queryFn: () => getChapter(chapterId!),
    enabled: !!chapterId,
  });
}

export function useCreateChapter(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChapterCreate) => createChapter(bookId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chapterKeys.list(bookId) });
    },
  });
}

export function useUpdateChapter(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chapterId, data }: { chapterId: string; data: ChapterUpdate }) =>
      updateChapter(chapterId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: chapterKeys.detail(variables.chapterId) });
      queryClient.invalidateQueries({ queryKey: chapterKeys.list(bookId) });
    },
  });
}

export function useSaveChapterContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chapterId, data }: { chapterId: string; data: ChapterContentUpdate }) =>
      saveChapterContent(chapterId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: chapterKeys.detail(variables.chapterId) });
    },
  });
}

export function useDeleteChapter(bookId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chapterId: string) => deleteChapter(chapterId),
    onSuccess: (_data, chapterId) => {
      queryClient.removeQueries({ queryKey: chapterKeys.detail(chapterId) });
      queryClient.invalidateQueries({ queryKey: chapterKeys.list(bookId) });
    },
  });
}
