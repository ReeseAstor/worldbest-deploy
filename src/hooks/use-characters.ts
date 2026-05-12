'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCharacters,
  getCharacter,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  type CharacterCreate,
  type CharacterUpdate,
} from '@/lib/api/characters';

export const characterKeys = {
  all: ['characters'] as const,
  lists: () => [...characterKeys.all, 'list'] as const,
  list: (projectId: string) => [...characterKeys.lists(), projectId] as const,
  details: () => [...characterKeys.all, 'detail'] as const,
  detail: (id: string) => [...characterKeys.details(), id] as const,
};

export function useCharacters(projectId: string | null) {
  return useQuery({
    queryKey: characterKeys.list(projectId!),
    queryFn: () => getCharacters(projectId!),
    enabled: !!projectId,
  });
}

export function useCharacter(characterId: string | null) {
  return useQuery({
    queryKey: characterKeys.detail(characterId!),
    queryFn: () => getCharacter(characterId!),
    enabled: !!characterId,
  });
}

export function useCreateCharacter(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CharacterCreate) => createCharacter(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: characterKeys.list(projectId) });
    },
  });
}

export function useUpdateCharacter(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ characterId, data }: { characterId: string; data: CharacterUpdate }) =>
      updateCharacter(characterId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: characterKeys.detail(variables.characterId) });
      queryClient.invalidateQueries({ queryKey: characterKeys.list(projectId) });
    },
  });
}

export function useDeleteCharacter(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (characterId: string) => deleteCharacter(characterId),
    onSuccess: (_data, characterId) => {
      queryClient.removeQueries({ queryKey: characterKeys.detail(characterId) });
      queryClient.invalidateQueries({ queryKey: characterKeys.list(projectId) });
    },
  });
}
