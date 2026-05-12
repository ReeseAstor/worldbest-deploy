'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { beatSheetsService } from '@/lib/supabase/services';
import { queryKeys } from '@/lib/query/client';
import type { 
  BeatSheet,
  BeatSheetInsert, 
  BeatSheetUpdate,
  Beat,
  BeatInsert,
  BeatUpdate,
  BeatSheetTemplate
} from '@/lib/database.types';

/**
 * Hook to fetch the beat sheet for a project
 */
export function useBeatSheet(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.beatSheets.byProject(projectId || ''),
    queryFn: () => beatSheetsService.getByProject(projectId!),
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch a beat sheet by ID
 */
export function useBeatSheetById(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.beatSheets.detail(id || ''),
    queryFn: () => beatSheetsService.getById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to create a beat sheet from a template
 */
export function useCreateBeatSheetFromTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, templateType, customName }: { 
      projectId: string; 
      templateType: BeatSheetTemplate;
      customName?: string;
    }) => beatSheetsService.createFromTemplate(projectId, templateType, customName),
    onSuccess: (beatSheet) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.beatSheets.byProject(beatSheet.project_id) 
      });
    },
  });
}

/**
 * Hook to create a custom beat sheet
 */
export function useCreateBeatSheet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BeatSheetInsert) => beatSheetsService.create(data),
    onSuccess: (beatSheet) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.beatSheets.byProject(beatSheet.project_id) 
      });
    },
  });
}

/**
 * Hook to update a beat sheet
 */
export function useUpdateBeatSheet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data, projectId }: { id: string; data: BeatSheetUpdate; projectId: string }) =>
      beatSheetsService.update(id, data).then(bs => ({ bs, projectId })),
    onSuccess: ({ bs, projectId }) => {
      queryClient.setQueryData(queryKeys.beatSheets.detail(bs.id), bs);
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.beatSheets.byProject(projectId) 
      });
    },
  });
}

/**
 * Hook to delete a beat sheet
 */
export function useDeleteBeatSheet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      beatSheetsService.delete(id).then(() => projectId),
    onSuccess: (projectId, { id }) => {
      queryClient.removeQueries({ queryKey: queryKeys.beatSheets.detail(id) });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.beatSheets.byProject(projectId) 
      });
    },
  });
}

// ============================================
// INDIVIDUAL BEAT HOOKS
// ============================================

/**
 * Hook to create a beat
 */
export function useCreateBeat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ data, projectId }: { data: BeatInsert; projectId: string }) =>
      beatSheetsService.createBeat(data).then(beat => ({ beat, projectId })),
    onSuccess: ({ beat, projectId }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.beatSheets.byProject(projectId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.beatSheets.detail(beat.beat_sheet_id) 
      });
    },
  });
}

/**
 * Hook to update a beat
 */
export function useUpdateBeat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data, projectId }: { id: string; data: BeatUpdate; projectId: string }) =>
      beatSheetsService.updateBeat(id, data).then(beat => ({ beat, projectId })),
    onSuccess: ({ beat, projectId }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.beatSheets.byProject(projectId) 
      });
    },
  });
}

/**
 * Hook to delete a beat
 */
export function useDeleteBeat() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      beatSheetsService.deleteBeat(id).then(() => projectId),
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.beatSheets.byProject(projectId) 
      });
    },
  });
}

/**
 * Hook to reorder beats
 */
export function useReorderBeats() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ beatSheetId, beatOrders, projectId }: { 
      beatSheetId: string;
      beatOrders: { id: string; beat_order: number }[];
      projectId: string;
    }) => beatSheetsService.reorderBeats(beatSheetId, beatOrders).then(() => projectId),
    onSuccess: (projectId) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.beatSheets.byProject(projectId) 
      });
    },
  });
}

/**
 * Hook to link a beat to a chapter
 */
export function useLinkBeatToChapter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ beatId, chapterId, projectId }: { beatId: string; chapterId: string; projectId: string }) =>
      beatSheetsService.linkBeatToChapter(beatId, chapterId).then(beat => ({ beat, projectId })),
    onSuccess: ({ beat, projectId }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.beatSheets.byProject(projectId) 
      });
    },
  });
}
