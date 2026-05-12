'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  type ProjectCreate,
  type ProjectUpdate,
  type ProjectOut,
  type ProjectDetailOut,
} from '@/lib/api/projects';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: () => [...projectKeys.lists()] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.list(),
    queryFn: getProjects,
  });
}

export function useProject(projectId: string | null) {
  return useQuery({
    queryKey: projectKeys.detail(projectId!),
    queryFn: () => getProject(projectId!),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectCreate) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectUpdate }) => updateProject(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
