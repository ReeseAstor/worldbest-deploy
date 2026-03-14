'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voiceProfilesService } from '@/lib/supabase/services';
import { queryKeys } from '@/lib/query/client';
import type { VoiceProfileInsert, VoiceProfileUpdate, VoiceProfile } from '@/lib/database.types';

/**
 * Hook to fetch all voice profiles for a project
 */
export function useVoiceProfiles(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.voiceProfiles.byProject(projectId || ''),
    queryFn: () => voiceProfilesService.getByProject(projectId!),
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch the active voice profile for a project
 */
export function useActiveVoiceProfile(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.voiceProfiles.active(projectId || ''),
    queryFn: () => voiceProfilesService.getActive(projectId!),
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch a voice profile by ID
 */
export function useVoiceProfile(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.voiceProfiles.detail(id || ''),
    queryFn: () => voiceProfilesService.getById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to create a voice profile
 */
export function useCreateVoiceProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: VoiceProfileInsert) => voiceProfilesService.create(data),
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.voiceProfiles.byProject(profile.project_id) 
      });
      if (profile.is_active) {
        queryClient.setQueryData(
          queryKeys.voiceProfiles.active(profile.project_id),
          profile
        );
      }
    },
  });
}

/**
 * Hook to update a voice profile
 */
export function useUpdateVoiceProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data, projectId }: { id: string; data: VoiceProfileUpdate; projectId: string }) =>
      voiceProfilesService.update(id, data).then(profile => ({ profile, projectId })),
    onSuccess: ({ profile, projectId }) => {
      queryClient.setQueryData(queryKeys.voiceProfiles.detail(profile.id), profile);
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.voiceProfiles.byProject(projectId) 
      });
    },
  });
}

/**
 * Hook to set a voice profile as active
 */
export function useSetActiveVoiceProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      voiceProfilesService.setActive(id, projectId),
    onSuccess: (profile) => {
      queryClient.setQueryData(
        queryKeys.voiceProfiles.active(profile.project_id),
        profile
      );
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.voiceProfiles.byProject(profile.project_id) 
      });
    },
  });
}

/**
 * Hook to delete a voice profile
 */
export function useDeleteVoiceProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      voiceProfilesService.delete(id).then(() => projectId),
    onSuccess: (projectId, { id }) => {
      queryClient.removeQueries({ queryKey: queryKeys.voiceProfiles.detail(id) });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.voiceProfiles.byProject(projectId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.voiceProfiles.active(projectId) 
      });
    },
  });
}

/**
 * Hook to update voice profile from analysis
 */
export function useUpdateVoiceProfileFromAnalysis() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, metrics, patterns, sampleWordCount, confidenceScore, projectId }: {
      id: string;
      metrics: VoiceProfile['metrics'];
      patterns: VoiceProfile['patterns'];
      sampleWordCount: number;
      confidenceScore: number;
      projectId: string;
    }) => voiceProfilesService.updateFromAnalysis(id, metrics, patterns, sampleWordCount, confidenceScore)
      .then(profile => ({ profile, projectId })),
    onSuccess: ({ profile, projectId }) => {
      queryClient.setQueryData(queryKeys.voiceProfiles.detail(profile.id), profile);
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.voiceProfiles.byProject(projectId) 
      });
    },
  });
}
