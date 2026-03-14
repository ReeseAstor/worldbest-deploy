'use client';

import { QueryClient } from '@tanstack/react-query';

/**
 * Create a new QueryClient instance with default options
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 60 seconds
        staleTime: 60 * 1000,
        // Keep unused data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry failed requests up to 3 times
        retry: 3,
        // Don't refetch on window focus in development
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Get or create the QueryClient
 * This ensures we reuse the same client on the browser while creating new ones for SSR
 */
export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}

// Query key factories for consistent key management
export const queryKeys = {
  // Projects
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
    withChapters: (id: string) => ['projects', id, 'chapters'] as const,
  },
  
  // Chapters
  chapters: {
    byProject: (projectId: string) => ['chapters', 'project', projectId] as const,
    detail: (id: string) => ['chapters', id] as const,
    content: (id: string) => ['chapters', id, 'content'] as const,
  },
  
  // Characters
  characters: {
    byProject: (projectId: string) => ['characters', 'project', projectId] as const,
    detail: (id: string) => ['characters', id] as const,
    withRelationships: (id: string) => ['characters', id, 'relationships'] as const,
    relationships: (projectId: string) => ['relationships', 'project', projectId] as const,
  },
  
  // Beat Sheets
  beatSheets: {
    byProject: (projectId: string) => ['beat-sheets', 'project', projectId] as const,
    detail: (id: string) => ['beat-sheets', id] as const,
  },
  
  // Voice Profiles
  voiceProfiles: {
    byProject: (projectId: string) => ['voice-profiles', 'project', projectId] as const,
    active: (projectId: string) => ['voice-profiles', 'project', projectId, 'active'] as const,
    detail: (id: string) => ['voice-profiles', id] as const,
  },
  
  // Locations
  locations: {
    byProject: (projectId: string) => ['locations', 'project', projectId] as const,
    detail: (id: string) => ['locations', id] as const,
  },
  
  // Profile
  profile: {
    current: ['profile', 'current'] as const,
    byId: (id: string) => ['profile', id] as const,
  },
  
  // Usage
  usage: {
    stats: ['usage', 'stats'] as const,
    daily: ['usage', 'daily'] as const,
    subscription: ['usage', 'subscription'] as const,
  },
};
