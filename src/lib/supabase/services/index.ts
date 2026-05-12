/**
 * Supabase Services Index
 * 
 * Central export for all Supabase data services.
 * These services provide type-safe CRUD operations for all Ember entities.
 */

export { projectsService, type ProjectWithChapters } from './projects';
export { chaptersService } from './chapters';
export { charactersService, type CharacterWithRelationships } from './characters';
export { profilesService } from './profiles';
export { locationsService } from './locations';
export { beatSheetsService, type BeatSheetWithBeats, ROMANCE_BEAT_TEMPLATES } from './beat-sheets';
export { voiceProfilesService } from './voice-profiles';
export { usageService, type UsageStats, type DailyUsage } from './usage';
