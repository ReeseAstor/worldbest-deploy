// Core exports - using selective exports to avoid conflicts
export * from './ai';
export * from './api';
export type { User, UserPreferences } from './auth';
export * from './billing';
// entities has conflicts with ai.ts (AIGenerationParams, AIPersona), export selectively
export {
  // Base
  type BaseEntity,
  // Project
  type Project,
  type ProjectSettings,
  type AIPreferences,
  type RomantasySubgenre,
  type SeriesInfo,
  type ProjectCollaborator,
  // Book
  type Book,
  type Chapter,
  type Scene,
  // Character
  type Character,
  type RomanceRole,
  type SpeechPatterns,
  type RomanceAttributes,
  type AppearanceDetails,
  // World
  type TimelineEvent,
  type Era,
  // Content
  type Placeholder,
  type BibleReference,
  type TextVersion,
  // Style
  type StyleProfile,
  type ToneSettings,
  type PacingSettings,
  type VocabularyPreferences,
  // Enums from entities
  ContentRating,
  BookStatus,
  ChapterStatus,
  ProjectRole,
  RelationshipType,
  PlaceholderType,
  PlaceholderIntensity,
  RenderingMode,
  EconomyType,
  // Heat/Steam level types
  HeatLevel,
  HEAT_LEVEL_LABELS,
  HEAT_LEVEL_DESCRIPTIONS,
  // Line edit types
  LineEditType,
  // Steam calibration
  type SteamCalibration,
} from './entities';
export * from './enums';

// Ember-specific exports
export * from './steam';
export * from './voice';
export * from './beat-sheets';
