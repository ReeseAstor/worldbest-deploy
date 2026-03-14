'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usageService } from '@/lib/supabase/services';
import { queryKeys } from '@/lib/query/client';
import type { AIGenerationInsert } from '@/lib/database.types';

/**
 * Hook to fetch current usage stats
 */
export function useUsageStats() {
  return useQuery({
    queryKey: queryKeys.usage.stats,
    queryFn: () => usageService.getCurrentStats(),
    // Refresh usage stats every 30 seconds
    refetchInterval: 30 * 1000,
  });
}

/**
 * Hook to fetch daily usage for the current month
 */
export function useDailyUsage() {
  return useQuery({
    queryKey: queryKeys.usage.daily,
    queryFn: () => usageService.getDailyUsage(),
  });
}

/**
 * Hook to fetch subscription limits
 */
export function useSubscriptionLimits() {
  return useQuery({
    queryKey: queryKeys.usage.subscription,
    queryFn: () => usageService.getSubscriptionLimits(),
  });
}

/**
 * Hook to check if user has remaining quota
 */
export function useHasRemainingQuota() {
  const { data: stats } = useUsageStats();
  return stats ? stats.wordsRemaining > 0 : true;
}

/**
 * Hook to log an AI generation
 */
export function useLogGeneration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: AIGenerationInsert) => usageService.logGeneration(data),
    onSuccess: () => {
      // Refresh usage stats after logging a generation
      queryClient.invalidateQueries({ queryKey: queryKeys.usage.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.usage.daily });
    },
  });
}

/**
 * Hook to update generation acceptance status
 */
export function useUpdateGenerationAcceptance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, wasAccepted, userEdits }: { 
      id: string; 
      wasAccepted: boolean; 
      userEdits?: string;
    }) => usageService.updateGenerationAcceptance(id, wasAccepted, userEdits),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.usage.stats });
    },
  });
}
