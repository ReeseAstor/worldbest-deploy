/**
 * Ember Database Types
 * 
 * TypeScript types generated from the Supabase schema.
 * These provide type safety for database operations.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================
// ENUMS
// ============================================

export type SubscriptionTier = 'free' | 'spark' | 'flame' | 'inferno';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
export type ProjectStatus = 'planning' | 'drafting' | 'editing' | 'complete' | 'published';
export type ChapterStatus = 'outline' | 'draft' | 'revision' | 'complete';
export type CharacterRole = 'FMC' | 'MMC' | 'love-interest' | 'rival' | 'best-friend' | 'antagonist' | 'supporting';
export type RelationshipType = 'romantic' | 'tension' | 'adversarial' | 'familial' | 'alliance' | 'friendship';
export type RomanceStage = 'strangers' | 'enemies' | 'acquaintances' | 'tension' | 'attraction' | 'denial' | 'first-kiss' | 'exploration' | 'commitment' | 'conflict' | 'separation' | 'reconciliation' | 'hea';
export type LocationType = 'realm' | 'kingdom' | 'city' | 'building' | 'place' | 'other';
export type EventType = 'backstory' | 'plot' | 'romance' | 'conflict' | 'resolution';
export type EventSignificance = 'minor' | 'moderate' | 'major' | 'climactic';
export type ContinuityCategory = 'character' | 'world' | 'magic' | 'relationship' | 'timeline' | 'other';
export type ContinuityPriority = 'critical' | 'high' | 'normal' | 'low';
export type BeatSheetTemplate = 'romancing-the-beat' | 'save-the-cat-romance' | 'dark-romance-arc' | 'epic-fantasy-romance' | 'custom';
export type BeatType = 'setup' | 'meet-cute' | 'first-spark' | 'resistance' | 'deepening' | 'first-kiss' | 'false-victory' | 'black-moment' | 'grand-gesture' | 'hea' | 'custom';
export type BeatStatus = 'pending' | 'drafting' | 'complete';
export type Explicitness = 'fade-to-black' | 'suggestive' | 'moderate' | 'explicit' | 'graphic';
export type AITaskType = 'creative-drafting' | 'steam-scene' | 'dialogue' | 'line-editing' | 'developmental-edit' | 'beat-advance';

// ============================================
// TABLE TYPES
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      projects: {
        Row: Project;
        Insert: ProjectInsert;
        Update: ProjectUpdate;
      };
      chapters: {
        Row: Chapter;
        Insert: ChapterInsert;
        Update: ChapterUpdate;
      };
      characters: {
        Row: Character;
        Insert: CharacterInsert;
        Update: CharacterUpdate;
      };
      relationships: {
        Row: Relationship;
        Insert: RelationshipInsert;
        Update: RelationshipUpdate;
      };
      locations: {
        Row: Location;
        Insert: LocationInsert;
        Update: LocationUpdate;
      };
      timeline_events: {
        Row: TimelineEvent;
        Insert: TimelineEventInsert;
        Update: TimelineEventUpdate;
      };
      continuity_rules: {
        Row: ContinuityRule;
        Insert: ContinuityRuleInsert;
        Update: ContinuityRuleUpdate;
      };
      beat_sheets: {
        Row: BeatSheet;
        Insert: BeatSheetInsert;
        Update: BeatSheetUpdate;
      };
      beats: {
        Row: Beat;
        Insert: BeatInsert;
        Update: BeatUpdate;
      };
      voice_profiles: {
        Row: VoiceProfile;
        Insert: VoiceProfileInsert;
        Update: VoiceProfileUpdate;
      };
      steam_settings: {
        Row: SteamSettings;
        Insert: SteamSettingsInsert;
        Update: SteamSettingsUpdate;
      };
      ai_generations: {
        Row: AIGeneration;
        Insert: AIGenerationInsert;
        Update: never;
      };
      subscriptions: {
        Row: Subscription;
        Insert: SubscriptionInsert;
        Update: SubscriptionUpdate;
      };
    };
  };
}

// ============================================
// PROFILE
// ============================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  pen_name: string | null;
  bio: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  pen_name?: string | null;
  bio?: string | null;
  subscription_tier?: SubscriptionTier;
  subscription_status?: SubscriptionStatus;
  stripe_customer_id?: string | null;
}

export interface ProfileUpdate extends Partial<ProfileInsert> {}

// ============================================
// PROJECT
// ============================================

export interface Project {
  id: string;
  user_id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  genre: string;
  subgenres: string[];
  tropes: string[];
  steam_level: number;
  target_word_count: number;
  current_word_count: number;
  status: ProjectStatus;
  series_name: string | null;
  series_number: number | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectInsert {
  id?: string;
  user_id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  genre?: string;
  subgenres?: string[];
  tropes?: string[];
  steam_level?: number;
  target_word_count?: number;
  current_word_count?: number;
  status?: ProjectStatus;
  series_name?: string | null;
  series_number?: number | null;
  cover_image_url?: string | null;
}

export interface ProjectUpdate extends Partial<Omit<ProjectInsert, 'id' | 'user_id'>> {}

// ============================================
// CHAPTER
// ============================================

export interface Chapter {
  id: string;
  project_id: string;
  title: string;
  chapter_number: number;
  content: string;
  content_html: string;
  word_count: number;
  summary: string | null;
  pov_character_id: string | null;
  status: ChapterStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChapterInsert {
  id?: string;
  project_id: string;
  title: string;
  chapter_number: number;
  content?: string;
  content_html?: string;
  word_count?: number;
  summary?: string | null;
  pov_character_id?: string | null;
  status?: ChapterStatus;
  notes?: string | null;
}

export interface ChapterUpdate extends Partial<Omit<ChapterInsert, 'id' | 'project_id'>> {}

// ============================================
// CHARACTER
// ============================================

export interface SpeechPatterns {
  sentenceStyle?: string;
  vocabularyLevel?: string;
  commonPhrases?: string[];
  avoidedWords?: string[];
  dialectMarkers?: string[];
  emotionalRange?: string;
}

export interface RomanceAttributes {
  loveLanguage?: 'words' | 'acts' | 'gifts' | 'time' | 'touch';
  attachmentStyle?: 'secure' | 'anxious' | 'avoidant' | 'disorganized';
  relationshipBaggage?: string[];
  dealbreakers?: string[];
}

export interface Character {
  id: string;
  project_id: string;
  name: string;
  role: CharacterRole;
  age: string | null;
  occupation: string | null;
  physical_description: string | null;
  personality_traits: string[];
  strengths: string[];
  flaws: string[];
  fears: string[];
  goals: string[];
  speech_patterns: SpeechPatterns;
  romance_attributes: RomanceAttributes;
  backstory: string | null;
  secrets: string[];
  pov_notes: string | null;
  internal_voice_sample: string | null;
  image_url: string | null;
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface CharacterInsert {
  id?: string;
  project_id: string;
  name: string;
  role?: CharacterRole;
  age?: string | null;
  occupation?: string | null;
  physical_description?: string | null;
  personality_traits?: string[];
  strengths?: string[];
  flaws?: string[];
  fears?: string[];
  goals?: string[];
  speech_patterns?: SpeechPatterns;
  romance_attributes?: RomanceAttributes;
  backstory?: string | null;
  secrets?: string[];
  pov_notes?: string | null;
  internal_voice_sample?: string | null;
  image_url?: string | null;
}

export interface CharacterUpdate extends Partial<Omit<CharacterInsert, 'id' | 'project_id'>> {}

// ============================================
// RELATIONSHIP
// ============================================

export interface Relationship {
  id: string;
  project_id: string;
  character1_id: string;
  character2_id: string;
  relationship_type: RelationshipType;
  romance_stage: RomanceStage | null;
  description: string | null;
  dynamics: string | null;
  tension_points: string[];
  history: string | null;
  created_at: string;
  updated_at: string;
}

export interface RelationshipInsert {
  id?: string;
  project_id: string;
  character1_id: string;
  character2_id: string;
  relationship_type: RelationshipType;
  romance_stage?: RomanceStage | null;
  description?: string | null;
  dynamics?: string | null;
  tension_points?: string[];
  history?: string | null;
}

export interface RelationshipUpdate extends Partial<Omit<RelationshipInsert, 'id' | 'project_id'>> {}

// ============================================
// LOCATION
// ============================================

export interface SensoryDetails {
  sights?: string[];
  sounds?: string[];
  smells?: string[];
  textures?: string[];
}

export interface Location {
  id: string;
  project_id: string;
  name: string;
  location_type: LocationType;
  description: string | null;
  atmosphere: string | null;
  sensory_details: SensoryDetails;
  significance: string | null;
  connected_characters: string[];
  magic_rules: string | null;
  cultural_notes: string | null;
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface LocationInsert {
  id?: string;
  project_id: string;
  name: string;
  location_type?: LocationType;
  description?: string | null;
  atmosphere?: string | null;
  sensory_details?: SensoryDetails;
  significance?: string | null;
  connected_characters?: string[];
  magic_rules?: string | null;
  cultural_notes?: string | null;
}

export interface LocationUpdate extends Partial<Omit<LocationInsert, 'id' | 'project_id'>> {}

// ============================================
// TIMELINE EVENT
// ============================================

export interface TimelineEvent {
  id: string;
  project_id: string;
  event_name: string;
  description: string | null;
  event_date: string | null;
  event_order: number | null;
  chapter_id: string | null;
  involved_characters: string[];
  location_id: string | null;
  event_type: EventType | null;
  significance: EventSignificance | null;
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface TimelineEventInsert {
  id?: string;
  project_id: string;
  event_name: string;
  description?: string | null;
  event_date?: string | null;
  event_order?: number | null;
  chapter_id?: string | null;
  involved_characters?: string[];
  location_id?: string | null;
  event_type?: EventType | null;
  significance?: EventSignificance | null;
}

export interface TimelineEventUpdate extends Partial<Omit<TimelineEventInsert, 'id' | 'project_id'>> {}

// ============================================
// CONTINUITY RULE
// ============================================

export interface ContinuityRule {
  id: string;
  project_id: string;
  rule_text: string;
  category: ContinuityCategory | null;
  priority: ContinuityPriority;
  related_entity_type: string | null;
  related_entity_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContinuityRuleInsert {
  id?: string;
  project_id: string;
  rule_text: string;
  category?: ContinuityCategory | null;
  priority?: ContinuityPriority;
  related_entity_type?: string | null;
  related_entity_id?: string | null;
  is_active?: boolean;
}

export interface ContinuityRuleUpdate extends Partial<Omit<ContinuityRuleInsert, 'id' | 'project_id'>> {}

// ============================================
// BEAT SHEET & BEATS
// ============================================

export interface BeatSheet {
  id: string;
  project_id: string;
  template_type: BeatSheetTemplate;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BeatSheetInsert {
  id?: string;
  project_id: string;
  template_type?: BeatSheetTemplate;
  name: string;
  description?: string | null;
  is_active?: boolean;
}

export interface BeatSheetUpdate extends Partial<Omit<BeatSheetInsert, 'id' | 'project_id'>> {}

export interface Beat {
  id: string;
  beat_sheet_id: string;
  name: string;
  beat_type: BeatType;
  description: string | null;
  beat_order: number;
  target_word_count: number | null;
  actual_word_count: number;
  chapter_id: string | null;
  scene_reference: string | null;
  emotional_goal: string | null;
  steam_level: number | null;
  status: BeatStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BeatInsert {
  id?: string;
  beat_sheet_id: string;
  name: string;
  beat_type: BeatType;
  description?: string | null;
  beat_order: number;
  target_word_count?: number | null;
  actual_word_count?: number;
  chapter_id?: string | null;
  scene_reference?: string | null;
  emotional_goal?: string | null;
  steam_level?: number | null;
  status?: BeatStatus;
  notes?: string | null;
}

export interface BeatUpdate extends Partial<Omit<BeatInsert, 'id' | 'beat_sheet_id'>> {}

// ============================================
// VOICE PROFILE
// ============================================

export interface VoiceMetrics {
  avgSentenceLength?: number;
  avgParagraphLength?: number;
  dialogueToNarrationRatio?: number;
  contractionFrequency?: number;
  passiveVoicePercentage?: number;
  metaphorDensity?: number;
  adverbUsage?: 'minimal' | 'moderate' | 'heavy';
  showVsTellRatio?: number;
}

export interface VoicePatterns {
  commonPhrases?: string[];
  avoidedWords?: string[];
  signatureStyles?: string[];
  dialogueTags?: string[];
  povDepthPreference?: 'shallow' | 'medium' | 'deep' | 'deep-omniscient';
}

export interface VoiceProfile {
  id: string;
  project_id: string;
  name: string;
  metrics: VoiceMetrics;
  patterns: VoicePatterns;
  prompt_constraints: Json;
  sample_word_count: number;
  confidence_score: number;
  deviation_threshold: number;
  last_analyzed_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoiceProfileInsert {
  id?: string;
  project_id: string;
  name?: string;
  metrics?: VoiceMetrics;
  patterns?: VoicePatterns;
  prompt_constraints?: Json;
  sample_word_count?: number;
  confidence_score?: number;
  deviation_threshold?: number;
  last_analyzed_at?: string | null;
  is_active?: boolean;
}

export interface VoiceProfileUpdate extends Partial<Omit<VoiceProfileInsert, 'id' | 'project_id'>> {}

// ============================================
// STEAM SETTINGS
// ============================================

export interface SteamSettings {
  id: string;
  project_id: string;
  level: number;
  vocabulary_allowed: string[];
  vocabulary_forbidden: string[];
  explicitness: Explicitness;
  emotion_focus: number;
  custom_guidelines: string | null;
  created_at: string;
  updated_at: string;
}

export interface SteamSettingsInsert {
  id?: string;
  project_id: string;
  level?: number;
  vocabulary_allowed?: string[];
  vocabulary_forbidden?: string[];
  explicitness?: Explicitness;
  emotion_focus?: number;
  custom_guidelines?: string | null;
}

export interface SteamSettingsUpdate extends Partial<Omit<SteamSettingsInsert, 'id' | 'project_id'>> {}

// ============================================
// AI GENERATION
// ============================================

export interface AIGeneration {
  id: string;
  project_id: string;
  chapter_id: string | null;
  user_id: string;
  task_type: AITaskType;
  prompt_used: string | null;
  context_tokens: number | null;
  generated_text: string | null;
  output_tokens: number | null;
  voice_deviation_score: number | null;
  was_accepted: boolean | null;
  user_edits: string | null;
  model_used: string | null;
  generation_time_ms: number | null;
  created_at: string;
}

export interface AIGenerationInsert {
  id?: string;
  project_id: string;
  chapter_id?: string | null;
  user_id: string;
  task_type: AITaskType;
  prompt_used?: string | null;
  context_tokens?: number | null;
  generated_text?: string | null;
  output_tokens?: number | null;
  voice_deviation_score?: number | null;
  was_accepted?: boolean | null;
  user_edits?: string | null;
  model_used?: string | null;
  generation_time_ms?: number | null;
}

// ============================================
// SUBSCRIPTION
// ============================================

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  monthly_ai_words_limit: number;
  monthly_ai_words_used: number;
  projects_limit: number;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionInsert {
  id?: string;
  user_id: string;
  stripe_subscription_id?: string | null;
  stripe_price_id?: string | null;
  tier: SubscriptionTier;
  status?: SubscriptionStatus;
  monthly_ai_words_limit?: number;
  monthly_ai_words_used?: number;
  projects_limit?: number;
  current_period_start?: string | null;
  current_period_end?: string | null;
  cancel_at_period_end?: boolean;
}

export interface SubscriptionUpdate extends Partial<Omit<SubscriptionInsert, 'id' | 'user_id'>> {}

// ============================================
// SUBSCRIPTION TIER LIMITS
// ============================================

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, {
  monthlyAIWords: number;
  projects: number;
  voiceProfiles: number;
  exportFormats: string[];
}> = {
  free: {
    monthlyAIWords: 5000,
    projects: 1,
    voiceProfiles: 0,
    exportFormats: ['docx'],
  },
  spark: {
    monthlyAIWords: 50000,
    projects: 3,
    voiceProfiles: 1,
    exportFormats: ['docx', 'epub'],
  },
  flame: {
    monthlyAIWords: 150000,
    projects: 10,
    voiceProfiles: 3,
    exportFormats: ['docx', 'epub', 'pdf', 'kdp-ebook'],
  },
  inferno: {
    monthlyAIWords: 500000,
    projects: -1, // unlimited
    voiceProfiles: -1, // unlimited
    exportFormats: ['docx', 'epub', 'pdf', 'kdp-ebook', 'kdp-print'],
  },
};
