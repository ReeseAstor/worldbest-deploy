'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '@/lib/supabase/services';
import { queryKeys } from '@/lib/query/client';
import type { Project, ProjectInsert, ProjectUpdate } from '@/lib/database.types';

/**
 * Hook to fetch all projects for the current user
 */
export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: () => projectsService.getAll(),
  });
}

/**
 * Hook to fetch a single project by ID
 */
export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id || ''),
    queryFn: () => projectsService.getById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to fetch a project with its chapters
 */
export function useProjectWithChapters(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.withChapters(id || ''),
    queryFn: () => projectsService.getWithChapters(id!),
    enabled: !!id,
  });
}

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<ProjectInsert, 'user_id'>) => projectsService.create(data),
    onSuccess: (newProject) => {
      // Invalidate and refetch projects list
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      // Optimistically add to cache
      queryClient.setQueryData<Project[]>(queryKeys.projects.all, (old) => 
        old ? [newProject, ...old] : [newProject]
      );
    },
  });
}

/**
 * Hook to update an existing project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectUpdate }) => 
      projectsService.update(id, data),
    onSuccess: (updatedProject) => {
      // Update the specific project in cache
      queryClient.setQueryData(
        queryKeys.projects.detail(updatedProject.id),
        updatedProject
      );
      // Invalidate the projects list
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => projectsService.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.setQueryData<Project[]>(queryKeys.projects.all, (old) =>
        old ? old.filter(p => p.id !== deletedId) : []
      );
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}

/**
 * Hook to update project word count
 */
export function useUpdateProjectWordCount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, wordCount }: { id: string; wordCount: number }) =>
      projectsService.updateWordCount(id, wordCount),
    onSuccess: (updatedProject) => {
      queryClient.setQueryData(
        queryKeys.projects.detail(updatedProject.id),
        updatedProject
      );
    },
  });
}
