'use client';

import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { queryKeys } from '@/lib/query/client';
import type { Project } from '@/lib/database.types';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface UseProjectSubscriptionOptions {
  /** Subscribe to a specific project by ID, or all user projects if not provided */
  projectId?: string;
  /** Called when a project is inserted */
  onInsert?: (project: Project) => void;
  /** Called when a project is updated */
  onUpdate?: (project: Project) => void;
  /** Called when a project is deleted */
  onDelete?: (projectId: string) => void;
  /** Called when a subscription error occurs */
  onError?: (error: Error) => void;
  /** Enable or disable the subscription */
  enabled?: boolean;
}

/**
 * Hook to subscribe to real-time project changes
 * Automatically updates TanStack Query cache when changes occur
 */
export function useProjectSubscription(options: UseProjectSubscriptionOptions = {}) {
  const { projectId, onInsert, onUpdate, onDelete, onError, enabled = true } = options;
  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleChange = useCallback((
    payload: RealtimePostgresChangesPayload<Project>
  ) => {
    const eventType = payload.eventType;
    
    if (eventType === 'INSERT') {
      const newProject = payload.new as Project;
      
      // Update the projects list cache
      queryClient.setQueryData<Project[]>(queryKeys.projects.all, (old) => 
        old ? [newProject, ...old] : [newProject]
      );
      
      onInsert?.(newProject);
    }
    
    if (eventType === 'UPDATE') {
      const updatedProject = payload.new as Project;
      
      // Update the specific project cache
      queryClient.setQueryData(
        queryKeys.projects.detail(updatedProject.id),
        updatedProject
      );
      
      // Update the projects list cache
      queryClient.setQueryData<Project[]>(queryKeys.projects.all, (old) =>
        old?.map(p => p.id === updatedProject.id ? updatedProject : p) || []
      );
      
      onUpdate?.(updatedProject);
    }
    
    if (eventType === 'DELETE') {
      const oldProject = payload.old as { id: string };
      
      // Remove from projects list cache
      queryClient.setQueryData<Project[]>(queryKeys.projects.all, (old) =>
        old?.filter(p => p.id !== oldProject.id) || []
      );
      
      // Invalidate the specific project cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.projects.detail(oldProject.id) 
      });
      
      onDelete?.(oldProject.id);
    }
  }, [queryClient, onInsert, onUpdate, onDelete]);

  useEffect(() => {
    if (!enabled) return;

    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Create channel with appropriate filter
        const channelName = projectId 
          ? `project-${projectId}` 
          : `user-projects-${user.id}`;

        channel = supabase
          .channel(channelName)
          .on<Project>(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'projects',
              filter: projectId 
                ? `id=eq.${projectId}` 
                : `user_id=eq.${user.id}`,
            },
            handleChange
          )
          .subscribe((status, err) => {
            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.error('Subscription error:', status, err);
              onError?.(new Error(`Subscription ${status}: ${err?.message || 'Unknown error'}`));
            }
          });
      } catch (error) {
        console.error('Failed to setup subscription:', error);
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
 * Hook to subscribe to a single project's changes
 * Convenience wrapper around useProjectSubscription
 */
export function useSingleProjectSubscription(
  projectId: string,
  options: Omit<UseProjectSubscriptionOptions, 'projectId'> = {}
) {
  return useProjectSubscription({ ...options, projectId });
}
