'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesService } from '@/lib/supabase/services';
import { queryKeys } from '@/lib/query/client';
import type { ProfileUpdate } from '@/lib/database.types';

/**
 * Hook to fetch the current user's profile
 */
export function useCurrentProfile() {
  return useQuery({
    queryKey: queryKeys.profile.current,
    queryFn: () => profilesService.getCurrentProfile(),
  });
}

/**
 * Hook to fetch a profile by ID
 */
export function useProfile(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.profile.byId(id || ''),
    queryFn: () => profilesService.getById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to update the current user's profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProfileUpdate) => profilesService.update(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(queryKeys.profile.current, updatedProfile);
    },
  });
}

/**
 * Hook to ensure a profile exists (creates one if not)
 */
export function useEnsureProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => profilesService.ensureProfile(),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.profile.current, profile);
    },
  });
}
