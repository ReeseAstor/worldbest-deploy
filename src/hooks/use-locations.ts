'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  type LocationCreate,
  type LocationUpdate,
} from '@/lib/api/locations';

export const locationKeys = {
  all: ['locations'] as const,
  lists: () => [...locationKeys.all, 'list'] as const,
  list: (projectId: string) => [...locationKeys.lists(), projectId] as const,
  details: () => [...locationKeys.all, 'detail'] as const,
  detail: (id: string) => [...locationKeys.details(), id] as const,
};

export function useLocations(projectId: string | null) {
  return useQuery({
    queryKey: locationKeys.list(projectId!),
    queryFn: () => getLocations(projectId!),
    enabled: !!projectId,
  });
}

export function useLocation(locationId: string | null) {
  return useQuery({
    queryKey: locationKeys.detail(locationId!),
    queryFn: () => getLocation(locationId!),
    enabled: !!locationId,
  });
}

export function useCreateLocation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LocationCreate) => createLocation(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.list(projectId) });
    },
  });
}

export function useUpdateLocation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ locationId, data }: { locationId: string; data: LocationUpdate }) =>
      updateLocation(locationId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.detail(variables.locationId) });
      queryClient.invalidateQueries({ queryKey: locationKeys.list(projectId) });
    },
  });
}

export function useDeleteLocation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (locationId: string) => deleteLocation(locationId),
    onSuccess: (_data, locationId) => {
      queryClient.removeQueries({ queryKey: locationKeys.detail(locationId) });
      queryClient.invalidateQueries({ queryKey: locationKeys.list(projectId) });
    },
  });
}
