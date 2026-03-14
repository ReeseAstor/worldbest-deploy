// Core Entity Types for Ember Platform - AI-Powered Romantasy Ghostwriting

import { SteamLevelValue, SteamSettings, SceneSteamOverride } from './steam';
import { BeatSheet, TropeSelection } from './beat-sheets';

export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface Project extends BaseEntity {
  owner_id: string;
  title: string;
  synopsis?: string;
  genre: RomantasySubgenre;
  style_profile_id?: string;
  settings: ProjectSettings;
  collaborators: ProjectCollaborator[];
  metadata: Record<string, any>;
  /** Steam calibration settings */
  steamSettings: SteamSettings;
  /** Author voice profile reference */
  voiceProfileId?: string;
  /** Beat sheet reference */
  beatSheetId?: string;
  /** Selected tropes for this project */
  tropeSelections?: TropeSelection[];
  /** Series information if part of a series */
  seriesInfo?: SeriesInfo;
}

export interface ProjectSettings {
  default_language: string;
  time_period?: string;
  target_audience?: string;
  content_rating: ContentRating;
  ai_preferences: AIPreferences;
  steam_calibration: SteamCalibration;
  trope_stack: string[];
}

export interface AIPreferences {
  draft_model: string;
  polish_model: string;
  temperature_draft: number;
  temperature_polish: number;
  max_tokens_per_generation: number;
  /** Default steam level for AI generations */
  defaultSteamLevel: SteamLevelValue;
  /** Voice matching strictness (0-1) */
  voiceMatchingStrictness: number;
}

/** Romantasy subgenre classification */
export type RomantasySubgenre = 
  | 'romantasy'
  | 'paranormal-romance'
  | 'dark-romance'
  | 'contemporary-romance'
  | 'historical-romance'
  | 'romantic-suspense'
  | 'fantasy-romance'
  | 'sci-fi-romance';

/** Series information */
export interface SeriesInfo {
  seriesId: string;
  seriesName: string;
  bookNumber: number;
  totalPlannedBooks?: number;
}

export interface ProjectCollaborator {
  user_id: string;
  role: ProjectRole;
  permissions: string[];
  added_at: Date;
}

export interface Book extends BaseEntity {
  project_id: string;
  title: string;
  order: number;
  blurb?: string;
  target_word_count?: number;
  status: BookStatus;
  metadata: Record<string, any>;
}

export interface Chapter extends BaseEntity {
  book_id: string;
  number: number;
  title: string;
  summary?: string;
  target_word_count?: number;
  word_count?: number;
  status: ChapterStatus;
  scenes: Scene[];
  content_json?: any; // Tiptap ProseMirror JSON
  content_text?: string; // Plain text derived from content_json
  pov_character_id?: string;
}

export interface Scene extends BaseEntity {
  chapter_id: string;
  title: string;
  location_id?: string;
  time?: Date;
  character_ids: string[];
  placeholders: Placeholder[];
  text_versions: TextVersion[];
  current_version_id?: string;
  pov_character_id?: string;
  mood?: string;
  conflict?: string;
  resolution?: string;
  /** Scene-specific heat level override */
  steamOverride?: SceneSteamOverride;
  /** Beat reference if mapped to beat sheet */
  beatRef?: string;
  /** Tropes being executed in this scene */
  tropeRefs?: string[];
}

export interface Character extends BaseEntity {
  project_id: string;
  name: string;
  aliases: string[];
  age?: number;
  gender?: string;
  orientation?: string;
  mbti?: string;
  appearance: AppearanceDetails;
  personality: PersonalityTraits;
  strengths: string[];
  weaknesses: string[];
  secrets: Secret[];
  backstory?: string;
  relationships: Relationship[];
  arc?: CharacterArc;
  voice_profile?: CharacterVoiceProfile;
  images?: string[];
  /** Character role in romance */
  romanceRole?: RomanceRole;
  /** Speech patterns for dialogue generation */
  speechPatterns?: SpeechPatterns;
  /** POV voice notes for when this character is the narrator */
  povVoiceNotes?: string;
  /** Romance-specific attributes */
  romanceAttributes?: RomanceAttributes;
}

/** Character role in the romance */
export type RomanceRole = 'FMC' | 'MMC' | 'love-interest' | 'rival' | 'best-friend' | 'antagonist' | 'supporting';

/** Speech patterns for dialogue consistency */
export interface SpeechPatterns {
  /** Common phrases or verbal tics */
  catchphrases: string[];
  /** How they express emotion */
  emotionalExpressions: Record<string, string[]>;
  /** Formality level in speech */
  formality: 'casual' | 'neutral' | 'formal';
  /** Dialect or accent notes */
  dialectNotes?: string;
  /** Common curse words or exclamations */
  exclamations?: string[];
}

/** Romance-specific character attributes */
export interface RomanceAttributes {
  /** Love language */
  loveLanguage?: 'words' | 'acts' | 'gifts' | 'time' | 'touch';
  /** Attachment style */
  attachmentStyle?: 'secure' | 'anxious' | 'avoidant' | 'disorganized';
  /** Past relationship baggage */
  relationshipBaggage?: string[];
  /** What they need in a partner */
  partnerNeeds?: string[];
  /** Dealbreakers in relationships */
  dealbreakers?: string[];
  /** How they show affection */
  affectionStyle?: string;
  /** Intimacy comfort level notes */
  intimacyNotes?: string;
}

export interface AppearanceDetails {
  height?: string;
  build?: string;
  hair?: string;
  eyes?: string;
  distinguishing_features?: string[];
  clothing_style?: string;
  description?: string;
}

export interface PersonalityTraits {
  core_traits: string[];
  quirks: string[];
  fears: string[];
  desires: string[];
  values: string[];
  flaws: string[];
}

export interface Secret {
  id: string;
  content: string;
  reveal_chapter_id?: string;
  impact_level: 'minor' | 'moderate' | 'major';
  known_by_character_ids: string[];
}

export interface Relationship {
  character_id: string;
  relationship_type: RelationshipType;
  description?: string;
  dynamics?: string;
  history?: string;
  tension_points?: string[];
  /** Romance-specific: relationship evolution per book */
  evolution?: RelationshipEvolution[];
  /** Power dynamic in the relationship */
  powerDynamic?: 'equal' | 'dominant' | 'submissive' | 'shifting';
}

/** Tracks how a relationship evolves across the story/series */
export interface RelationshipEvolution {
  bookNumber: number;
  chapterRange?: { start: number; end: number };
  stage: RelationshipStage;
  keyMoments: string[];
  emotionalState: string;
}

/** Stages of romantic relationship development */
export type RelationshipStage = 
  | 'strangers'
  | 'enemies'
  | 'acquaintances'
  | 'tension'
  | 'attraction'
  | 'denial'
  | 'first-kiss'
  | 'exploration'
  | 'commitment'
  | 'conflict'
  | 'separation'
  | 'reconciliation'
  | 'hea';

export interface CharacterArc {
  starting_point: string;
  catalyst: string;
  journey: string[];
  climax: string;
  resolution: string;
}

export interface CharacterVoiceProfile {
  vocabulary_level: 'simple' | 'moderate' | 'complex';
  speech_patterns: string[];
  catchphrases: string[];
  dialect?: string;
  formality: 'casual' | 'neutral' | 'formal';
}

export interface Location extends BaseEntity {
  project_id: string;
  name: string;
  region?: string;
  culture_ids: string[];
  description?: string;
  time_period?: string;
  geography?: GeographyDetails;
  atmosphere?: string;
  significance?: string;
  images?: string[];
  map_coordinates?: MapCoordinates;
}

export interface GeographyDetails {
  terrain: string;
  climate: string;
  flora: string[];
  fauna: string[];
  resources: string[];
  hazards: string[];
}

export interface MapCoordinates {
  x: number;
  y: number;
  z?: number;
  map_id: string;
}

export interface Culture extends BaseEntity {
  project_id: string;
  name: string;
  language_id?: string;
  norms: string[];
  rituals: string[];
  economy_id?: string;
  government?: string;
  religion?: string;
  values: string[];
  taboos: string[];
  social_structure?: SocialStructure;
  history?: string;
}

export interface SocialStructure {
  classes: SocialClass[];
  mobility: 'rigid' | 'limited' | 'fluid';
  leadership: string;
  family_structure: string;
}

export interface SocialClass {
  name: string;
  description: string;
  percentage: number;
  privileges: string[];
  obligations: string[];
}

export interface Language extends BaseEntity {
  project_id: string;
  name: string;
  script?: string;
  phonetics?: string;
  grammar_rules?: string[];
  common_phrases: Translation[];
  naming_conventions?: NamingConventions;
}

export interface Translation {
  original: string;
  translated: string;
  pronunciation?: string;
  context?: string;
}

export interface NamingConventions {
  first_names: NamePattern;
  surnames: NamePattern;
  place_names: NamePattern;
  titles: string[];
}

export interface NamePattern {
  patterns: string[];
  examples: string[];
  meanings?: Record<string, string>;
}

export interface Economy extends BaseEntity {
  project_id: string;
  name: string;
  type: EconomyType;
  currency: Currency;
  major_industries: string[];
  trade_routes: TradeRoute[];
  wealth_distribution: WealthDistribution;
}

export interface Currency {
  name: string;
  symbol: string;
  denominations: Denomination[];
  exchange_rates?: Record<string, number>;
}

export interface Denomination {
  name: string;
  value: number;
  description?: string;
}

export interface TradeRoute {
  name: string;
  start_location_id: string;
  end_location_id: string;
  goods: string[];
  hazards?: string[];
}

export interface WealthDistribution {
  poverty_rate: number;
  middle_class_rate: number;
  wealthy_rate: number;
  gini_coefficient?: number;
}

export interface Timeline extends BaseEntity {
  project_id: string;
  name: string;
  events: TimelineEvent[];
  eras: Era[];
}

export interface TimelineEvent {
  id: string;
  date: Date | string;
  title: string;
  description: string;
  impact: 'minor' | 'moderate' | 'major';
  affected_character_ids: string[];
  affected_location_ids: string[];
  tags: string[];
}

export interface Era {
  name: string;
  start_date: Date | string;
  end_date?: Date | string;
  description: string;
  characteristics: string[];
}

export interface Placeholder extends BaseEntity {
  scene_id: string;
  type: PlaceholderType;
  intensity: PlaceholderIntensity;
  consent_required: boolean;
  purpose: string;
  rendering_mode: RenderingMode;
  mapped_bible_refs: BibleReference[];
  fallback_text?: string;
  tags: string[];
}

export interface BibleReference {
  entity_type: 'character' | 'location' | 'culture' | 'event';
  entity_id: string;
  specific_field?: string;
}

export interface TextVersion extends BaseEntity {
  scene_id: string;
  author_id: string;
  content: string;
  summary?: string;
  parent_id?: string;
  semantic_hash: string;
  word_count: number;
  ai_generated: boolean;
  ai_model?: string;
  ai_params?: AIGenerationParams;
  revision_notes?: string;
  quality_score?: number;
}

export interface AIGenerationParams {
  persona: AIPersona;
  temperature: number;
  max_tokens: number;
  prompt_template_id?: string;
  context_refs: string[];
  safety_overrides?: Record<string, any>;
}

export interface StyleProfile extends BaseEntity {
  user_id: string;
  name: string;
  tone: ToneSettings;
  pacing: PacingSettings;
  vocabulary_preferences: VocabularyPreferences;
  taboo_list: string[];
  inspiration_authors: string[];
  example_excerpts: string[];
}

export interface ToneSettings {
  formality: 1 | 2 | 3 | 4 | 5;
  humor: 1 | 2 | 3 | 4 | 5;
  darkness: 1 | 2 | 3 | 4 | 5;
  romance: 1 | 2 | 3 | 4 | 5;
  action: 1 | 2 | 3 | 4 | 5;
}

export interface PacingSettings {
  overall_pace: 'slow' | 'moderate' | 'fast';
  dialogue_density: 'sparse' | 'balanced' | 'heavy';
  description_detail: 'minimal' | 'moderate' | 'rich';
  chapter_length_preference: 'short' | 'medium' | 'long';
}

export interface VocabularyPreferences {
  complexity: 'simple' | 'moderate' | 'complex';
  preferred_words: string[];
  avoided_words: string[];
  use_profanity: boolean;
  dialect_preferences: string[];
}

// Enums
export enum ContentRating {
  G = 'G',
  PG = 'PG',
  PG13 = 'PG-13',
  R = 'R',
  NC17 = 'NC-17'
}

export enum BookStatus {
  PLANNING = 'planning',
  DRAFTING = 'drafting',
  REVISING = 'revising',
  COMPLETE = 'complete',
  PUBLISHED = 'published'
}

export enum ChapterStatus {
  OUTLINED = 'outlined',
  DRAFTING = 'drafting',
  COMPLETE = 'complete',
  REVISED = 'revised'
}

export enum ProjectRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  REVIEWER = 'reviewer',
  READER = 'reader'
}

export enum RelationshipType {
  FAMILY = 'family',
  ROMANTIC = 'romantic',
  FRIEND = 'friend',
  RIVAL = 'rival',
  MENTOR = 'mentor',
  ENEMY = 'enemy',
  ALLY = 'ally',
  NEUTRAL = 'neutral'
}

export enum PlaceholderType {
  VIOLENCE = 'violence',
  INTIMACY = 'intimacy',
  PROFANITY = 'profanity',
  TRAUMA = 'trauma',
  CUSTOM = 'custom'
}

export enum PlaceholderIntensity {
  MILD = 'mild',
  MODERATE = 'moderate',
  INTENSE = 'intense',
  EXTREME = 'extreme'
}

export enum RenderingMode {
  IMPLIED = 'implied',
  SUGGESTIVE = 'suggestive',
  FADE_TO_BLACK = 'fade_to_black',
  BLOCKED = 'blocked',
  FULL = 'full'
}

export enum AIPersona {
  MUSE = 'muse',
  EDITOR = 'editor',
  COACH = 'coach'
}

export enum EconomyType {
  BARTER = 'barter',
  CURRENCY = 'currency',
  MIXED = 'mixed',
  GIFT = 'gift',
  COMMAND = 'command',
  MARKET = 'market'
}

// =====================================================
// Ember-Specific Types: Steam Calibration, Voice, Edits
// =====================================================

export enum HeatLevel {
  CLOSED_DOOR = 1,
  WARM = 2,
  STEAMY = 3,
  SPICY = 4,
  SCORCHING = 5
}

export const HEAT_LEVEL_LABELS: Record<HeatLevel, string> = {
  [HeatLevel.CLOSED_DOOR]: 'Closed Door',
  [HeatLevel.WARM]: 'Warm',
  [HeatLevel.STEAMY]: 'Steamy',
  [HeatLevel.SPICY]: 'Spicy',
  [HeatLevel.SCORCHING]: 'Scorching',
};

export const HEAT_LEVEL_DESCRIPTIONS: Record<HeatLevel, string> = {
  [HeatLevel.CLOSED_DOOR]: 'Tension and attraction only. Scene fades to black before anything physical beyond kissing.',
  [HeatLevel.WARM]: 'Foreplay and build-up described. The act itself is implied or briefly referenced. Literary language.',
  [HeatLevel.STEAMY]: 'Full scenes included. Moderate explicitness. Balances emotional connection with physical description.',
  [HeatLevel.SPICY]: 'Detailed, extended scenes. Multiple encounters per book. Kink elements may be introduced.',
  [HeatLevel.SCORCHING]: 'No content limits within consent boundaries. Taboo elements, edge play, dark romance dynamics.',
};

export interface SteamCalibration {
  project_heat_level: HeatLevel;
  scene_override?: HeatLevel;
  rendering_preferences: Partial<Record<HeatLevel, RenderingMode>>;
}

export interface AuthorVoiceProfile extends BaseEntity {
  user_id: string;
  name: string;
  sample_excerpts: string[];
  fingerprint?: VoiceFingerprint;
  is_active: boolean;
}

export interface VoiceFingerprint {
  sentence_length_avg: number;
  paragraph_length_avg: number;
  dialogue_to_narration_ratio: number;
  metaphor_density: number;
  sensory_word_frequency: Record<string, number>;
  pov_tendency: 'first' | 'close_third' | 'deep_third' | 'omniscient';
  tense_preference: 'past' | 'present';
  vocabulary_complexity_score: number;
  distinctive_phrases: string[];
  avoidance_patterns: string[];
  tone_vector: number[];
}

export enum LineEditType {
  FILTER_WORD = 'filter_word',
  SHOW_DONT_TELL = 'show_dont_tell',
  DIALOGUE_TAG = 'dialogue_tag',
  POV_INCONSISTENCY = 'pov_inconsistency',
  PASSIVE_VOICE = 'passive_voice',
  ADVERB_OVERUSE = 'adverb_overuse',
  REPETITION = 'repetition'
}

export interface LineEditSuggestion extends BaseEntity {
  chapter_id: string;
  type: LineEditType;
  original_text: string;
  suggested_text: string;
  explanation: string;
  position: {
    from: number;
    to: number;
  };
  status: 'pending' | 'accepted' | 'rejected';
}

export interface Series extends BaseEntity {
  user_id: string;
  title: string;
  genre: string;
  subgenres: string[];
  project_ids: string[];
}