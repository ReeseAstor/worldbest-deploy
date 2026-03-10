'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createExport,
  pollExport,
  downloadExport,
  type ExportRequest,
} from '@/lib/api/export';

export function useCreateExport() {
  return useMutation({
    mutationFn: (data: ExportRequest) => createExport(data),
  });
}

export function usePollExport(jobId: string | null) {
  return useQuery({
    queryKey: ['export', jobId],
    queryFn: () => pollExport(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'completed' || status === 'failed') return false;
      return 2000;
    },
  });
}

export function useDownloadExport() {
  return useMutation({
    mutationFn: (jobId: string) => downloadExport(jobId),
  });
}
