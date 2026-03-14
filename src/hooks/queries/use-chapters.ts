'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chaptersService } from '@/lib/supabase/services';
import { queryKeys } from '@/lib/query/client';
import type { Chapter, ChapterInsert, ChapterUpdate } from '@/lib/database.types';

/**
 * Hook to fetch all chapters for a project
 */
export function useChapters(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.chapters.byProject(projectId || ''),
    queryFn: () => chaptersService.getByProject(projectId!),
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch a single chapter by ID
 */
export function useChapter(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.chapters.detail(id || ''),
    queryFn: () => chaptersService.getById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to create a new chapter
 */
export function useCreateChapter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ChapterInsert) => chaptersService.create(data),
    onSuccess: (newChapter) => {
      // Invalidate chapters list for the project
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.chapters.byProject(newChapter.project_id) 
      });
      // Also invalidate project with chapters query
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.withChapters(newChapter.project_id) 
      });
    },
  });
}

/**
 * Hook to update a chapter
 */
export function useUpdateChapter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChapterUpdate }) =>
      chaptersService.update(id, data),
    onSuccess: (updatedChapter) => {
      // Update the specific chapter in cache
      queryClient.setQueryData(
        queryKeys.chapters.detail(updatedChapter.id),
        updatedChapter
      );
      // Invalidate the chapters list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.chapters.byProject(updatedChapter.project_id) 
      });
    },
  });
}

/**
 * Hook to update chapter content
 */
export function useUpdateChapterContent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, content, contentHtml }: { id: string; content: string; contentHtml: string }) =>
      chaptersService.updateContent(id, content, contentHtml),
    onSuccess: (updatedChapter) => {
      queryClient.setQueryData(
        queryKeys.chapters.detail(updatedChapter.id),
        updatedChapter
      );
    },
  });
}

/**
 * Hook to delete a chapter
 */
export function useDeleteChapter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      chaptersService.delete(id).then(() => projectId),
    onSuccess: (projectId, { id }) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.chapters.detail(id) });
      // Invalidate the chapters list
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.chapters.byProject(projectId) 
      });
    },
  });
}

/**
 * Hook to reorder chapters
 */
export function useReorderChapters() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, chapterOrders }: { 
      projectId: string; 
      chapterOrders: { id: string; chapter_number: number }[] 
    }) => chaptersService.reorder(projectId, chapterOrders),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.chapters.byProject(projectId) 
      });
    },
  });
}
