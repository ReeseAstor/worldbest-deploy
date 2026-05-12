'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getVoiceProfiles,
  createVoiceProfile,
  updateVoiceProfile,
  analyzeVoiceProfile,
  activateVoiceProfile,
  deleteVoiceProfile,
  type VoiceProfileCreate,
  type VoiceProfileUpdate,
} from '@/lib/api/voice-profiles';

export const voiceProfileKeys = {
  all: ['voice-profiles'] as const,
  list: () => [...voiceProfileKeys.all, 'list'] as const,
};

export function useVoiceProfiles() {
  return useQuery({
    queryKey: voiceProfileKeys.list(),
    queryFn: getVoiceProfiles,
  });
}

export function useCreateVoiceProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VoiceProfileCreate) => createVoiceProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceProfileKeys.list() });
    },
  });
}

export function useUpdateVoiceProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ profileId, data }: { profileId: string; data: VoiceProfileUpdate }) =>
      updateVoiceProfile(profileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceProfileKeys.list() });
    },
  });
}

export function useAnalyzeVoiceProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) => analyzeVoiceProfile(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceProfileKeys.list() });
    },
  });
}

export function useActivateVoiceProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) => activateVoiceProfile(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceProfileKeys.list() });
    },
  });
}

export function useDeleteVoiceProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profileId: string) => deleteVoiceProfile(profileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: voiceProfileKeys.list() });
    },
  });
}
