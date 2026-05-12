'use client';

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query/client';
import type { Chapter } from '@/lib/database.types';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseChapterSubscriptionOptions {
  /** Project ID to subscribe to chapters for */
  projectId: string;
  /** Called when a chapter is inserted */
  onInsert?: (chapter: Chapter) => void;
  /** Called when a chapter is updated */
  onUpdate?: (chapter: Chapter) => void;
  /** Called when a chapter is deleted */
  onDelete?: (chapterId: string) => void;
  /** Called when a subscription error occurs */
  onError?: (error: Error) => void;
  /** Enable or disable the subscription */
  enabled?: boolean;
}

/**
 * Hook to subscribe to real-time chapter changes for a project
 * Automatically updates TanStack Query cache when changes occur
 * 
 * This is particularly useful for:
 * - Live collaboration features
 * - Auto-updating chapter lists when another tab makes changes
 * - Real-time word count updates
 */
export function useChapterSubscription(options: UseChapterSubscriptionOptions) {
  const { projectId, onInsert, onUpdate, onDelete, onError, enabled = true } = options;
  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleChange = useCallback((
    payload: RealtimePostgresChangesPayload<Chapter>
  ) => {
    const eventType = payload.eventType;
    
    if (eventType === 'INSERT') {
      const newChapter = payload.new as Chapter;
      
      // Update the chapters list cache for this project
      queryClient.setQueryData<Chapter[]>(
        queryKeys.chapters.byProject(projectId), 
        (old) => {
          if (!old) return [newChapter];
          // Insert at correct position based on chapter_number
          const chapters = [...old, newChapter];
          return chapters.sort((a, b) => a.chapter_number - b.chapter_number);
        }
      );
      
      onInsert?.(newChapter);
    }
    
    if (eventType === 'UPDATE') {
      const updatedChapter = payload.new as Chapter;
      
      // Update the specific chapter cache
      queryClient.setQueryData(
        queryKeys.chapters.detail(updatedChapter.id),
        updatedChapter
      );
      
      // Update the chapters list cache
      queryClient.setQueryData<Chapter[]>(
        queryKeys.chapters.byProject(projectId), 
        (old) => {
          if (!old) return [updatedChapter];
          const chapters = old.map(c => 
            c.id === updatedChapter.id ? updatedChapter : c
          );
          return chapters.sort((a, b) => a.chapter_number - b.chapter_number);
        }
      );
      
      // Also invalidate project with chapters query
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.projects.withChapters(projectId) 
      });
      
      onUpdate?.(updatedChapter);
    }
    
    if (eventType === 'DELETE') {
      const oldChapter = payload.old as { id: string };
      
      // Remove from chapters list cache
      queryClient.setQueryData<Chapter[]>(
        queryKeys.chapters.byProject(projectId), 
        (old) => old?.filter(c => c.id !== oldChapter.id) || []
      );
      
      // Remove the specific chapter cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.chapters.detail(oldChapter.id) 
      });
      
      onDelete?.(oldChapter.id);
    }
  }, [queryClient, projectId, onInsert, onUpdate, onDelete]);

  useEffect(() => {
    if (!enabled || !projectId) return;

    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      try {
        const channelName = `project-chapters-${projectId}`;

        channel = supabase
          .channel(channelName)
          .on<Chapter>(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'chapters',
              filter: `project_id=eq.${projectId}`,
            },
            handleChange
          )
          .subscribe((status, err) => {
            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.error('Chapter subscription error:', status, err);
              onError?.(new Error(`Subscription ${status}: ${err?.message || 'Unknown error'}`));
            }
          });
      } catch (error) {
        console.error('Failed to setup chapter subscription:', error);
        onError?.(error instanceof Error ? error : new Error('Failed to setup subscription'));
      }
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [supabase, projectId, enabled, handleChange, onError]);
}

/**
 * Hook to subscribe to a single chapter's changes
 */
export function useSingleChapterSubscription(
  chapterId: string,
  projectId: string,
  options: Omit<UseChapterSubscriptionOptions, 'projectId'> = {}
) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleChange = useCallback((
    payload: RealtimePostgresChangesPayload<Chapter>
  ) => {
    if (payload.eventType === 'UPDATE') {
      const updatedChapter = payload.new as Chapter;
      
      queryClient.setQueryData(
        queryKeys.chapters.detail(updatedChapter.id),
        updatedChapter
      );
      
      options.onUpdate?.(updatedChapter);
    }
    
    if (payload.eventType === 'DELETE') {
      queryClient.removeQueries({ 
        queryKey: queryKeys.chapters.detail(chapterId) 
      });
      
      options.onDelete?.(chapterId);
    }
  }, [queryClient, chapterId, options]);

  useEffect(() => {
    if (!options.enabled || !chapterId) return;

    const channel = supabase
      .channel(`chapter-${chapterId}`)
      .on<Chapter>(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chapters',
          filter: `id=eq.${chapterId}`,
        },
        handleChange
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, chapterId, options.enabled, handleChange]);
}
