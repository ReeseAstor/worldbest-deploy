/**
 * Query Hooks Index
 * 
 * Central export for all TanStack Query hooks.
 * These hooks provide type-safe data fetching and mutations for all Ember entities.
 */

// Projects
export {
  useProjects,
  useProject,
  useProjectWithChapters,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useUpdateProjectWordCount,
} from './use-projects';

// Chapters
export {
  useChapters,
  useChapter,
  useCreateChapter,
  useUpdateChapter,
  useUpdateChapterContent,
  useDeleteChapter,
  useReorderChapters,
} from './use-chapters';

// Characters
export {
  useCharacters,
  useCharacter,
  useCharacterWithRelationships,
  useRelationships,
  useCreateCharacter,
  useUpdateCharacter,
  useDeleteCharacter,
  useCreateRelationship,
  useUpdateRelationship,
  useDeleteRelationship,
} from './use-characters';

// Beat Sheets
export {
  useBeatSheet,
  useBeatSheetById,
  useCreateBeatSheetFromTemplate,
  useCreateBeatSheet,
  useUpdateBeatSheet,
  useDeleteBeatSheet,
  useCreateBeat,
  useUpdateBeat,
  useDeleteBeat,
  useReorderBeats,
  useLinkBeatToChapter,
} from './use-beat-sheets';

// Profile
export {
  useCurrentProfile,
  useProfile,
  useUpdateProfile,
  useEnsureProfile,
} from './use-profile';

// Usage
export {
  useUsageStats,
  useDailyUsage,
  useSubscriptionLimits,
  useHasRemainingQuota,
  useLogGeneration,
  useUpdateGenerationAcceptance,
} from './use-usage';

// Voice Profiles
export {
  useVoiceProfiles,
  useActiveVoiceProfile,
  useVoiceProfile,
  useCreateVoiceProfile,
  useUpdateVoiceProfile,
  useSetActiveVoiceProfile,
  useDeleteVoiceProfile,
  useUpdateVoiceProfileFromAnalysis,
} from './use-voice-profiles';
