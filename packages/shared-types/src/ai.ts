<<<<<<< Local
// AI and Generation Types for Ember - Romantasy AI Orchestration

import { SteamLevelValue, SteamPromptModifiers } from './steam';
import { VoicePromptConstraints } from './voice';

export interface AIGenerationRequest {
  intent: AIIntent;
  persona: AIPersona;
  project_id: string;
  context_refs: ContextReference[];
  params: AIGenerationParams;
  safety_overrides?: SafetyOverrides;
  idempotency_key?: string;
  /** Steam level for this generation */
  steamLevel?: SteamLevelValue;
  /** Voice profile ID for voice matching */
  voiceProfileId?: string;
  /** Context window configuration */
  contextConfig?: ContextWindowConfig;
}

export interface ContextReference {
  type: ContextType;
  id: string;
  version?: string;
  fields?: string[];
}

export enum ContextType {
  PROJECT = 'project',
  BOOK = 'book',
  CHAPTER = 'chapter',
  SCENE = 'scene',
  CHARACTER = 'character',
  LOCATION = 'location',
  CULTURE = 'culture',
  TIMELINE = 'timeline',
  STYLE_PROFILE = 'style_profile',
  TEXT_VERSION = 'text_version',
  // Ember-specific context types
  SERIES_BIBLE = 'series_bible',
  BEAT_SHEET = 'beat_sheet',
  VOICE_PROFILE = 'voice_profile',
  RELATIONSHIP = 'relationship',
  CONTINUITY_RULE = 'continuity_rule'
}

export enum AIIntent {
  // Muse intents
  BRAINSTORM_IDEAS = 'brainstorm_ideas',
  GENERATE_SCENE = 'generate_scene',
  CONTINUE_SCENE = 'continue_scene',
  EXPAND_DESCRIPTION = 'expand_description',
  CREATE_DIALOGUE = 'create_dialogue',
  DESCRIBE_SCENE = 'describe_scene',
  SENSORY_DETAILS = 'sensory_details',
  DEVELOP_CHARACTER = 'develop_character',
  EXPAND_WORLDBUILDING = 'expand_worldbuilding',
  SUGGEST_PLOT = 'suggest_plot',
  
  // Ember-specific Muse intents
  GENERATE_STEAM_SCENE = 'generate_steam_scene',
  INCREASE_HEAT = 'increase_heat',
  DECREASE_HEAT = 'decrease_heat',
  WRITE_TENSION = 'write_tension',
  WRITE_BANTER = 'write_banter',
  
  // Editor intents
  REVISE_TEXT = 'revise_text',
  IMPROVE_DIALOGUE = 'improve_dialogue',
  LINE_EDIT = 'line_edit',
  GRAMMAR_CHECK = 'grammar_check',
  STYLE_TRANSFER = 'style_transfer',
  CONTINUITY_CHECK = 'continuity_check',
  PACING_ADJUST = 'pacing_adjust',
  ANALYZE_TEXT = 'analyze_text',
  
  // Ember-specific Editor intents
  VOICE_MATCH = 'voice_match',
  STEAM_CALIBRATE = 'steam_calibrate',
  TROPE_ENHANCE = 'trope_enhance',
  
  // Coach intents
  PLOT_OUTLINE = 'plot_outline',
  CHARACTER_ARC = 'character_arc',
  BEAT_SHEET = 'beat_sheet',
  CONFLICT_ANALYSIS = 'conflict_analysis',
  THEME_EXPLORATION = 'theme_exploration',
  
  // Ember-specific Coach intents
  ROMANCE_ARC_ANALYSIS = 'romance_arc_analysis',
  TENSION_PACING = 'tension_pacing',
  TROPE_EXECUTION = 'trope_execution',
  DEVELOPMENTAL_EDIT = 'developmental_edit',
  
  // Hybrid intents
  SUMMARIZE = 'summarize',
  ANALYZE = 'analyze',
  SUGGEST_NEXT = 'suggest_next',
  WORLDBUILD = 'worldbuild',
  FACT_CHECK = 'fact_check',
  
  // Export intents
  GENERATE_BLURB = 'generate_blurb',
  GENERATE_KEYWORDS = 'generate_keywords',
  GENERATE_TAGLINE = 'generate_tagline'
}

export enum AIPersona {
  MUSE = 'muse',
  EDITOR = 'editor',
  COACH = 'coach'
}

export interface AIGenerationParams {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop_sequences?: string[];
  model_override?: string;
  deterministic?: boolean;
  stream?: boolean;
  include_context_summary?: boolean;
  target_length?: 'short' | 'medium' | 'long';
  style_intensity?: number;
}

export interface SafetyOverrides {
  allow_violence?: boolean;
  violence_level?: 1 | 2 | 3 | 4 | 5;
  allow_profanity?: boolean;
  allow_suggestive?: boolean;
  age_restriction?: number;
  content_warnings?: string[];
}

export interface AIGenerationResponse {
  id: string;
  request_id: string;
  persona: AIPersona;
  intent: AIIntent;
  content: string;
  alternatives?: string[];
  metadata: AIResponseMetadata;
  usage: AIUsageMetrics;
  safety_flags?: SafetyFlag[];
  cached: boolean;
  created_at: Date;
}

export interface AIResponseMetadata {
  model: string;
  temperature: number;
  finish_reason: 'stop' | 'length' | 'safety' | 'error';
  confidence_score?: number;
  context_version: string;
  context_hash: string;
  processing_time_ms: number;
  suggestions?: AISuggestion[];
}

export interface AISuggestion {
  type: 'continuation' | 'alternative' | 'improvement' | 'warning';
  content: string;
  confidence: number;
  reasoning?: string;
}

export interface AIUsageMetrics {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  model_tier: 'draft' | 'polish' | 'premium';
}

export interface SafetyFlag {
  type: SafetyFlagType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: {
    start: number;
    end: number;
  };
  suggested_action?: string;
}

export enum SafetyFlagType {
  VIOLENCE = 'violence',
  SEXUAL_CONTENT = 'sexual_content',
  PROFANITY = 'profanity',
  HATE_SPEECH = 'hate_speech',
  SELF_HARM = 'self_harm',
  MINOR_SAFETY = 'minor_safety',
  COPYRIGHT = 'copyright',
  PERSONAL_INFO = 'personal_info'
}

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  persona: AIPersona;
  intent: AIIntent;
  system_prompt: string;
  user_prompt_template: string;
  variables: PromptVariable[];
  examples?: PromptExample[];
  version: number;
  is_active: boolean;
  is_public: boolean;
  author_id?: string;
  category?: string;
  tags: string[];
  usage_count: number;
  rating?: number;
  created_at: Date;
  updated_at: Date;
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  default_value?: any;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
}

export interface PromptExample {
  input: Record<string, any>;
  output: string;
  notes?: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: AIProvider;
  model_id: string;
  tier: 'draft' | 'polish' | 'premium';
  capabilities: ModelCapabilities;
  pricing: ModelPricing;
  limits: ModelLimits;
  is_active: boolean;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  COHERE = 'cohere',
  GOOGLE = 'google',
  CUSTOM = 'custom'
}

export interface ModelCapabilities {
  max_context_length: number;
  max_output_length: number;
  supports_streaming: boolean;
  supports_function_calling: boolean;
  supports_vision: boolean;
  supports_audio: boolean;
  languages_supported: string[];
  specialties: string[];
}

export interface ModelPricing {
  input_cost_per_1k: number;
  output_cost_per_1k: number;
  currency: string;
  minimum_charge?: number;
  bulk_discount_tiers?: BulkDiscountTier[];
}

export interface BulkDiscountTier {
  threshold: number;
  discount_percentage: number;
}

export interface ModelLimits {
  requests_per_minute: number;
  requests_per_hour: number;
  tokens_per_minute: number;
  tokens_per_hour: number;
  concurrent_requests: number;
}

export interface AIBatchRequest {
  id: string;
  user_id: string;
  tasks: AIGenerationRequest[];
  priority: 'low' | 'normal' | 'high';
  status: BatchStatus;
  progress: number;
  results?: AIGenerationResponse[];
  errors?: BatchError[];
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
  estimated_completion?: Date;
}

export enum BatchStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
  PARTIAL = 'partial'
}

export interface BatchError {
  task_index: number;
  error_code: string;
  error_message: string;
  recoverable: boolean;
}

export interface FineTuneJob {
  id: string;
  user_id: string;
  team_id?: string;
  name: string;
  base_model: string;
  training_data_id: string;
  validation_data_id?: string;
  hyperparameters: HyperParameters;
  status: FineTuneStatus;
  progress: number;
  metrics?: TrainingMetrics;
  model_id?: string;
  error?: string;
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
  estimated_cost: number;
  actual_cost?: number;
}

export interface HyperParameters {
  epochs: number;
  batch_size: number;
  learning_rate: number;
  warmup_ratio: number;
  weight_decay: number;
  gradient_accumulation_steps: number;
  max_grad_norm: number;
  seed?: number;
}

export interface TrainingMetrics {
  training_loss: number[];
  validation_loss?: number[];
  perplexity?: number;
  bleu_score?: number;
  rouge_score?: Record<string, number>;
  custom_metrics?: Record<string, number>;
}

export enum FineTuneStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  TRAINING = 'training',
  EVALUATING = 'evaluating',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled'
}

export interface VectorEmbedding {
  id: string;
  content_id: string;
  content_type: 'scene' | 'character' | 'location' | 'summary';
  embedding: number[];
  model: string;
  metadata: Record<string, any>;
  created_at: Date;
}

export interface SemanticSearchRequest {
  query: string;
  project_id?: string;
  content_types?: string[];
  limit?: number;
  threshold?: number;
  filters?: Record<string, any>;
}

export interface SemanticSearchResult {
  id: string;
  content_id: string;
  content_type: string;
  content: string;
  similarity_score: number;
  metadata: Record<string, any>;
}

export interface AICache {
  id: string;
  key: string;
  persona: AIPersona;
  intent: AIIntent;
  context_hash: string;
  response: AIGenerationResponse;
  ttl: number;
  hits: number;
  created_at: Date;
  expires_at: Date;
  last_accessed: Date;
}

// ============================================================================
// EMBER-SPECIFIC: Context Window Management
// ============================================================================

/**
 * Context window configuration for managing large manuscripts.
 * Romantasy manuscripts run 80k-120k words, requiring careful context management.
 */
export interface ContextWindowConfig {
  /** Maximum tokens for immediate context */
  immediateContextTokens: number;
  /** Maximum tokens for retrieved context */
  retrievedContextTokens: number;
  /** Maximum tokens for global context */
  globalContextTokens: number;
  /** Whether to include chapter summaries */
  includeChapterSummaries: boolean;
  /** Whether to include character sheets for involved characters */
  includeCharacterSheets: boolean;
  /** Maximum characters to include context for */
  maxCharactersInContext: number;
}

/** Assembled context ready for AI generation */
export interface AssembledContext {
  /** Immediate context: current chapter + preceding text */
  immediate: ImmediateContext;
  /** Retrieved context: relevant bible entries via vector search */
  retrieved: RetrievedContext;
  /** Global context: rolling manuscript summary */
  global: GlobalContext;
  /** Total estimated tokens */
  estimatedTokens: number;
  /** Context hash for caching */
  hash: string;
}

/** Immediate context tier */
export interface ImmediateContext {
  /** Current chapter content */
  currentChapter: string;
  /** Preceding text (up to token limit) */
  precedingText: string;
  /** Scene metadata */
  sceneMetadata: {
    pov: string;
    location: string;
    characters: string[];
    mood?: string;
    heatLevel?: number;
  };
  /** Token count */
  tokens: number;
}

/** Retrieved context tier via vector search */
export interface RetrievedContext {
  /** Retrieved character sheets */
  characters: RetrievedCharacter[];
  /** Retrieved location descriptions */
  locations: RetrievedLocation[];
  /** Retrieved relationship dynamics */
  relationships: RetrievedRelationship[];
  /** Retrieved continuity rules */
  continuityRules: RetrievedContinuityRule[];
  /** Retrieved timeline events */
  timelineEvents: RetrievedTimelineEvent[];
  /** Token count */
  tokens: number;
}

export interface RetrievedCharacter {
  id: string;
  name: string;
  relevantFields: string;
  similarityScore: number;
}

export interface RetrievedLocation {
  id: string;
  name: string;
  description: string;
  similarityScore: number;
}

export interface RetrievedRelationship {
  character1: string;
  character2: string;
  type: string;
  currentStage: string;
  dynamics: string;
  similarityScore: number;
}

export interface RetrievedContinuityRule {
  id: string;
  rule: string;
  affectedCharacters: string[];
  priority: 'must' | 'should' | 'may';
}

export interface RetrievedTimelineEvent {
  id: string;
  date: string;
  description: string;
  relevance: number;
}

/** Global context tier */
export interface GlobalContext {
  /** Rolling manuscript summary */
  manuscriptSummary: string;
  /** Story-so-far summary */
  storySoFar: string;
  /** Romance arc status */
  romanceArcStatus: {
    currentStage: string;
    tensionLevel: number;
    lastMajorBeat: string;
  };
  /** Token count */
  tokens: number;
}

// ============================================================================
// EMBER-SPECIFIC: Model Routing
// ============================================================================

/** Task types for model routing */
export type AITaskType = 
  | 'creative-drafting'
  | 'steam-scene'
  | 'line-editing'
  | 'continuity-check'
  | 'developmental-edit'
  | 'blurb-generation'
  | 'voice-analysis'
  | 'summarization';

/** Model routing decision */
export interface ModelRoutingDecision {
  taskType: AITaskType;
  selectedModel: string;
  provider: AIProvider;
  tier: 'draft' | 'polish' | 'premium';
  reasoning: string;
  estimatedCost: number;
  estimatedLatency: number;
}

/** Model routing configuration */
export interface ModelRoutingConfig {
  /** Model preferences by task type */
  taskModelPreferences: Record<AITaskType, string[]>;
  /** Cost threshold for automatic downgrade */
  costThreshold: number;
  /** Whether to allow model fallback on error */
  allowFallback: boolean;
  /** Fallback model */
  fallbackModel: string;
}

// ============================================================================
// EMBER-SPECIFIC: Prompt Assembly
// ============================================================================

/** Complete prompt assembly for generation */
export interface AssembledPrompt {
  /** System prompt with all context injected */
  systemPrompt: string;
  /** User prompt */
  userPrompt: string;
  /** Steam calibration modifiers */
  steamModifiers?: SteamPromptModifiers;
  /** Voice profile constraints */
  voiceConstraints?: VoicePromptConstraints;
  /** Total estimated tokens */
  estimatedTokens: number;
}

/** Prompt assembly options */
export interface PromptAssemblyOptions {
  /** Steam level for generation */
  steamLevel: SteamLevelValue;
  /** Voice profile ID */
  voiceProfileId?: string;
  /** Beat being executed */
  beatRef?: string;
  /** Tropes to emphasize */
  tropeRefs?: string[];
  /** Custom instructions */
  customInstructions?: string;
}

// ============================================================================
// EMBER-SPECIFIC: Generation Response Extensions
// ============================================================================

/** Extended AI response for Ember */
export interface EmberGenerationResponse extends AIGenerationResponse {
  /** Steam level of generated content */
  detectedSteamLevel?: SteamLevelValue;
  /** Voice deviation score */
  voiceDeviationScore?: number;
  /** Continuity warnings */
  continuityWarnings?: ContinuityWarning[];
  /** Trope execution notes */
  tropeNotes?: TropeExecutionNote[];
}

export interface ContinuityWarning {
  type: 'character' | 'timeline' | 'world' | 'relationship';
  description: string;
  severity: 'info' | 'warning' | 'error';
  suggestion?: string;
}

export interface TropeExecutionNote {
  tropeId: string;
  executionQuality: 'weak' | 'moderate' | 'strong';
  suggestion?: string;
}
=======
// AI and Generation Types

export interface AIGenerationRequest {
  intent: AIIntent;
  persona: AIPersona;
  project_id: string;
  context_refs: ContextReference[];
  params: AIGenerationParams;
  safety_overrides?: SafetyOverrides;
  idempotency_key?: string;
  voice_profile_id?: string;
  heat_level?: number;
  slash_command?: SlashCommand;
  selected_text?: string;
  chapter_id?: string;
}

export interface ContextReference {
  type: ContextType;
  id: string;
  version?: string;
  fields?: string[];
}

export enum ContextType {
  PROJECT = 'project',
  BOOK = 'book',
  CHAPTER = 'chapter',
  SCENE = 'scene',
  CHARACTER = 'character',
  LOCATION = 'location',
  CULTURE = 'culture',
  TIMELINE = 'timeline',
  STYLE_PROFILE = 'style_profile',
  TEXT_VERSION = 'text_version'
}

export enum AIIntent {
  // Muse intents
  BRAINSTORM_IDEAS = 'brainstorm_ideas',
  GENERATE_SCENE = 'generate_scene',
  CONTINUE_SCENE = 'continue_scene',
  EXPAND_DESCRIPTION = 'expand_description',
  CREATE_DIALOGUE = 'create_dialogue',
  DESCRIBE_SCENE = 'describe_scene',
  SENSORY_DETAILS = 'sensory_details',
  DEVELOP_CHARACTER = 'develop_character',
  EXPAND_WORLDBUILDING = 'expand_worldbuilding',
  SUGGEST_PLOT = 'suggest_plot',
  
  // Editor intents
  REVISE_TEXT = 'revise_text',
  IMPROVE_DIALOGUE = 'improve_dialogue',
  LINE_EDIT = 'line_edit',
  GRAMMAR_CHECK = 'grammar_check',
  STYLE_TRANSFER = 'style_transfer',
  CONTINUITY_CHECK = 'continuity_check',
  PACING_ADJUST = 'pacing_adjust',
  ANALYZE_TEXT = 'analyze_text',
  
  // Coach intents
  PLOT_OUTLINE = 'plot_outline',
  CHARACTER_ARC = 'character_arc',
  BEAT_SHEET = 'beat_sheet',
  CONFLICT_ANALYSIS = 'conflict_analysis',
  THEME_EXPLORATION = 'theme_exploration',
  
  // Hybrid intents
  SUMMARIZE = 'summarize',
  ANALYZE = 'analyze',
  SUGGEST_NEXT = 'suggest_next',
  WORLDBUILD = 'worldbuild',
  FACT_CHECK = 'fact_check'
}

export enum AIPersona {
  MUSE = 'muse',
  EDITOR = 'editor',
  COACH = 'coach'
}

export interface AIGenerationParams {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop_sequences?: string[];
  model_override?: string;
  deterministic?: boolean;
  stream?: boolean;
  include_context_summary?: boolean;
  target_length?: 'short' | 'medium' | 'long';
  style_intensity?: number;
}

export interface SafetyOverrides {
  allow_violence?: boolean;
  violence_level?: 1 | 2 | 3 | 4 | 5;
  allow_profanity?: boolean;
  allow_suggestive?: boolean;
  age_restriction?: number;
  content_warnings?: string[];
}

export interface AIGenerationResponse {
  id: string;
  request_id: string;
  persona: AIPersona;
  intent: AIIntent;
  content: string;
  alternatives?: string[];
  metadata: AIResponseMetadata;
  usage: AIUsageMetrics;
  safety_flags?: SafetyFlag[];
  cached: boolean;
  created_at: Date;
}

export interface AIResponseMetadata {
  model: string;
  temperature: number;
  finish_reason: 'stop' | 'length' | 'safety' | 'error';
  confidence_score?: number;
  context_version: string;
  context_hash: string;
  processing_time_ms: number;
  suggestions?: AISuggestion[];
}

export interface AISuggestion {
  type: 'continuation' | 'alternative' | 'improvement' | 'warning';
  content: string;
  confidence: number;
  reasoning?: string;
}

export interface AIUsageMetrics {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  estimated_cost: number;
  model_tier: 'draft' | 'polish' | 'premium';
}

export interface SafetyFlag {
  type: SafetyFlagType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location?: {
    start: number;
    end: number;
  };
  suggested_action?: string;
}

export enum SafetyFlagType {
  VIOLENCE = 'violence',
  SEXUAL_CONTENT = 'sexual_content',
  PROFANITY = 'profanity',
  HATE_SPEECH = 'hate_speech',
  SELF_HARM = 'self_harm',
  MINOR_SAFETY = 'minor_safety',
  COPYRIGHT = 'copyright',
  PERSONAL_INFO = 'personal_info'
}

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  persona: AIPersona;
  intent: AIIntent;
  system_prompt: string;
  user_prompt_template: string;
  variables: PromptVariable[];
  examples?: PromptExample[];
  version: number;
  is_active: boolean;
  is_public: boolean;
  author_id?: string;
  category?: string;
  tags: string[];
  usage_count: number;
  rating?: number;
  created_at: Date;
  updated_at: Date;
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  default_value?: any;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
}

export interface PromptExample {
  input: Record<string, any>;
  output: string;
  notes?: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: AIProvider;
  model_id: string;
  tier: 'draft' | 'polish' | 'premium';
  capabilities: ModelCapabilities;
  pricing: ModelPricing;
  limits: ModelLimits;
  is_active: boolean;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export enum AIProvider {
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  COHERE = 'cohere',
  GOOGLE = 'google',
  CUSTOM = 'custom'
}

export interface ModelCapabilities {
  max_context_length: number;
  max_output_length: number;
  supports_streaming: boolean;
  supports_function_calling: boolean;
  supports_vision: boolean;
  supports_audio: boolean;
  languages_supported: string[];
  specialties: string[];
}

export interface ModelPricing {
  input_cost_per_1k: number;
  output_cost_per_1k: number;
  currency: string;
  minimum_charge?: number;
  bulk_discount_tiers?: BulkDiscountTier[];
}

export interface BulkDiscountTier {
  threshold: number;
  discount_percentage: number;
}

export interface ModelLimits {
  requests_per_minute: number;
  requests_per_hour: number;
  tokens_per_minute: number;
  tokens_per_hour: number;
  concurrent_requests: number;
}

export interface AIBatchRequest {
  id: string;
  user_id: string;
  tasks: AIGenerationRequest[];
  priority: 'low' | 'normal' | 'high';
  status: BatchStatus;
  progress: number;
  results?: AIGenerationResponse[];
  errors?: BatchError[];
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
  estimated_completion?: Date;
}

export enum BatchStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
  PARTIAL = 'partial'
}

export interface BatchError {
  task_index: number;
  error_code: string;
  error_message: string;
  recoverable: boolean;
}

export interface FineTuneJob {
  id: string;
  user_id: string;
  team_id?: string;
  name: string;
  base_model: string;
  training_data_id: string;
  validation_data_id?: string;
  hyperparameters: HyperParameters;
  status: FineTuneStatus;
  progress: number;
  metrics?: TrainingMetrics;
  model_id?: string;
  error?: string;
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
  estimated_cost: number;
  actual_cost?: number;
}

export interface HyperParameters {
  epochs: number;
  batch_size: number;
  learning_rate: number;
  warmup_ratio: number;
  weight_decay: number;
  gradient_accumulation_steps: number;
  max_grad_norm: number;
  seed?: number;
}

export interface TrainingMetrics {
  training_loss: number[];
  validation_loss?: number[];
  perplexity?: number;
  bleu_score?: number;
  rouge_score?: Record<string, number>;
  custom_metrics?: Record<string, number>;
}

export enum FineTuneStatus {
  PENDING = 'pending',
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  TRAINING = 'training',
  EVALUATING = 'evaluating',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled'
}

export interface VectorEmbedding {
  id: string;
  content_id: string;
  content_type: 'scene' | 'character' | 'location' | 'summary';
  embedding: number[];
  model: string;
  metadata: Record<string, any>;
  created_at: Date;
}

export interface SemanticSearchRequest {
  query: string;
  project_id?: string;
  content_types?: string[];
  limit?: number;
  threshold?: number;
  filters?: Record<string, any>;
}

export interface SemanticSearchResult {
  id: string;
  content_id: string;
  content_type: string;
  content: string;
  similarity_score: number;
  metadata: Record<string, any>;
}

export interface AICache {
  id: string;
  key: string;
  persona: AIPersona;
  intent: AIIntent;
  context_hash: string;
  response: AIGenerationResponse;
  ttl: number;
  hits: number;
  created_at: Date;
  expires_at: Date;
  last_accessed: Date;
}

// =====================================================
// Ember-Specific: Slash Commands
// =====================================================

export enum SlashCommand {
  DRAFT = 'draft',
  SCENE = 'scene',
  DIALOGUE = 'dialogue',
  STEAM = 'steam',
  DESCRIBE = 'describe',
  CONTINUE = 'continue',
  BRAINSTORM = 'brainstorm'
}

export const SLASH_COMMAND_LABELS: Record<SlashCommand, string> = {
  [SlashCommand.DRAFT]: 'Draft',
  [SlashCommand.SCENE]: 'Write Scene',
  [SlashCommand.DIALOGUE]: 'Generate Dialogue',
  [SlashCommand.STEAM]: 'Steam Scene',
  [SlashCommand.DESCRIBE]: 'Describe Setting',
  [SlashCommand.CONTINUE]: 'Continue Writing',
  [SlashCommand.BRAINSTORM]: 'Brainstorm Ideas',
};

export const SLASH_COMMAND_DESCRIPTIONS: Record<SlashCommand, string> = {
  [SlashCommand.DRAFT]: 'Generate the next passage of prose',
  [SlashCommand.SCENE]: 'Write a full scene from a beat description',
  [SlashCommand.DIALOGUE]: 'Generate dialogue between characters',
  [SlashCommand.STEAM]: 'Generate an intimate scene at the current heat level',
  [SlashCommand.DESCRIBE]: 'Expand a setting or character description with sensory detail',
  [SlashCommand.CONTINUE]: 'Continue writing from the current cursor position',
  [SlashCommand.BRAINSTORM]: 'Brainstorm plot directions and ideas',
};
>>>>>>> Remote