'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { charactersService } from '@/lib/supabase/services';
import { queryKeys } from '@/lib/query/client';
import type { 
  Character, 
  CharacterInsert, 
  CharacterUpdate,
  Relationship,
  RelationshipInsert,
  RelationshipUpdate
} from '@/lib/database.types';

/**
 * Hook to fetch all characters for a project
 */
export function useCharacters(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.characters.byProject(projectId || ''),
    queryFn: () => charactersService.getByProject(projectId!),
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch a single character by ID
 */
export function useCharacter(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.characters.detail(id || ''),
    queryFn: () => charactersService.getById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to fetch a character with their relationships
 */
export function useCharacterWithRelationships(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.characters.withRelationships(id || ''),
    queryFn: () => charactersService.getWithRelationships(id!),
    enabled: !!id,
  });
}

/**
 * Hook to fetch all relationships for a project
 */
export function useRelationships(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.characters.relationships(projectId || ''),
    queryFn: () => charactersService.getRelationships(projectId!),
    enabled: !!projectId,
  });
}

/**
 * Hook to create a new character
 */
export function useCreateCharacter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CharacterInsert) => charactersService.create(data),
    onSuccess: (newCharacter) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.characters.byProject(newCharacter.project_id) 
      });
    },
  });
}

/**
 * Hook to update a character
 */
export function useUpdateCharacter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CharacterUpdate }) =>
      charactersService.update(id, data),
    onSuccess: (updatedCharacter) => {
      queryClient.setQueryData(
        queryKeys.characters.detail(updatedCharacter.id),
        updatedCharacter
      );
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.characters.byProject(updatedCharacter.project_id) 
      });
    },
  });
}

/**
 * Hook to delete a character
 */
export function useDeleteCharacter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      charactersService.delete(id).then(() => projectId),
    onSuccess: (projectId, { id }) => {
      queryClient.removeQueries({ queryKey: queryKeys.characters.detail(id) });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.characters.byProject(projectId) 
      });
      // Also invalidate relationships since they might be affected
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.characters.relationships(projectId) 
      });
    },
  });
}

// ============================================
// RELATIONSHIP HOOKS
// ============================================

/**
 * Hook to create a relationship
 */
export function useCreateRelationship() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RelationshipInsert) => charactersService.createRelationship(data),
    onSuccess: (newRelationship) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.characters.relationships(newRelationship.project_id) 
      });
      // Invalidate both characters' relationship queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.characters.withRelationships(newRelationship.character1_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.characters.withRelationships(newRelationship.character2_id) 
      });
    },
  });
}

/**
 * Hook to update a relationship
 */
export function useUpdateRelationship() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data, projectId }: { id: string; data: RelationshipUpdate; projectId: string }) =>
      charactersService.updateRelationship(id, data).then(rel => ({ rel, projectId })),
    onSuccess: ({ rel, projectId }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.characters.relationships(projectId) 
      });
    },
  });
}

/**
 * Hook to delete a relationship
 */
export function useDeleteRelationship() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      charactersService.deleteRelationship(id).then(() => projectId),
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.characters.relationships(projectId) 
      });
    },
  });
}
