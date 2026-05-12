/**
 * Voice Fingerprinting Types for Ember
 * 
 * Voice fingerprinting captures an author's unique writing style and generates
 * a quantified profile used to ensure AI-generated content matches their voice.
 */

/** Point of View depth settings */
export type POVDepth = 
  | 'deep-third' 
  | 'close-third' 
  | 'distant-third' 
  | 'first-person' 
  | 'first-person-present';

/** Sensory modality preferences */
export type SensoryModality = 'visual' | 'tactile' | 'auditory' | 'olfactory' | 'gustatory';

/** Vocabulary tier for style matching */
export type VocabularyTier = 'literary' | 'commercial' | 'accessible' | 'colloquial';

/** Complete voice profile for an author */
export interface VoiceProfile {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  
  /** Source samples used to generate this profile */
  sampleSources: VoiceSample[];
  
  /** Quantified metrics */
  metrics: VoiceMetrics;
  
  /** Extracted style patterns */
  patterns: VoicePatterns;
  
  /** Generated prompt constraints */
  promptConstraints: VoicePromptConstraints;
  
  /** Deviation threshold (0-1, how much deviation triggers a warning) */
  deviationThreshold: number;
  
  /** Whether this profile is active for generation */
  isActive: boolean;
}

/** Sample used to build voice profile */
export interface VoiceSample {
  id: string;
  type: 'chapter' | 'manuscript' | 'excerpt';
  title: string;
  wordCount: number;
  uploadedAt: Date;
  /** Raw text content (stored separately, referenced here) */
  contentRef: string;
}

/** Quantified voice metrics */
export interface VoiceMetrics {
  /** Average sentence length in words */
  avgSentenceLength: number;
  /** Standard deviation of sentence length */
  sentenceLengthVariation: number;
  
  /** Ratio of dialogue to narration (0-1) */
  dialogueToNarrationRatio: number;
  
  /** Average paragraph length in sentences */
  avgParagraphLength: number;
  
  /** Metaphor density per 1000 words */
  metaphorDensity: number;
  
  /** Simile density per 1000 words */
  simileDensity: number;
  
  /** Internal monologue frequency per 1000 words */
  internalMonologueFrequency: number;
  
  /** Action beat frequency in dialogue scenes */
  dialogueActionBeatFrequency: number;
  
  /** Contraction usage rate (0-1) */
  contractionRate: number;
  
  /** Exclamation mark usage per 1000 words */
  exclamationUsage: number;
  
  /** Question frequency per 1000 words */
  questionFrequency: number;
  
  /** Em dash usage per 1000 words */
  emDashUsage: number;
  
  /** Ellipsis usage per 1000 words */
  ellipsisUsage: number;
  
  /** Adverb density per 1000 words */
  adverbDensity: number;
  
  /** Adjective density per 1000 words */
  adjectiveDensity: number;
  
  /** Said-alternative usage rate (vs plain "said") */
  saidAlternativeRate: number;
}

/** Extracted style patterns */
export interface VoicePatterns {
  /** Detected POV depth */
  povDepth: POVDepth;
  
  /** Primary sensory modality preference (ranked) */
  sensoryPreferences: SensoryModality[];
  
  /** Vocabulary tier */
  vocabularyTier: VocabularyTier;
  
  /** Common sentence starters */
  commonSentenceStarters: string[];
  
  /** Favorite transition phrases */
  transitionPhrases: string[];
  
  /** Dialogue tag patterns */
  dialogueTagPatterns: DialogueTagPattern[];
  
  /** Character interiority style */
  interiorityStyle: InteriorityStyle;
  
  /** Pacing tendencies */
  pacingTendencies: PacingTendencies;
  
  /** Emotional language patterns */
  emotionalPatterns: EmotionalPatterns;
}

/** Dialogue tag pattern analysis */
export interface DialogueTagPattern {
  /** Pattern type: action beat, attribution, none */
  type: 'action-beat' | 'attribution' | 'untagged';
  /** Frequency percentage */
  frequency: number;
  /** Common examples */
  examples: string[];
}

/** Character interiority style */
export interface InteriorityStyle {
  /** How internal thoughts are presented */
  thoughtPresentation: 'italicized' | 'untagged' | 'tagged' | 'mixed';
  /** Depth of internal reflection (1-5) */
  reflectionDepth: number;
  /** Physical sensation integration */
  physicalIntegration: number;
}

/** Pacing tendencies */
export interface PacingTendencies {
  /** Scene vs summary ratio */
  sceneToSummaryRatio: number;
  /** Action sequence density */
  actionDensity: number;
  /** Tension build patterns */
  tensionBuildType: 'gradual' | 'sharp' | 'oscillating';
}

/** Emotional language patterns */
export interface EmotionalPatterns {
  /** Show vs tell ratio for emotions */
  showVsTellRatio: number;
  /** Physical manifestation frequency */
  physicalManifestationFrequency: number;
  /** Common emotional vocabulary */
  emotionalVocabulary: string[];
}

/** Generated prompt constraints for voice matching */
export interface VoicePromptConstraints {
  /** System prompt additions for voice matching */
  systemPrompt: string;
  
  /** Style instructions */
  styleInstructions: string[];
  
  /** Sentence structure guidelines */
  sentenceGuidelines: string;
  
  /** Dialogue formatting rules */
  dialogueRules: string;
  
  /** POV consistency rules */
  povRules: string;
  
  /** Vocabulary constraints */
  vocabularyRules: string;
}

/** Voice deviation analysis result */
export interface VoiceDeviationAnalysis {
  /** Overall deviation score (0-1, lower is better) */
  overallScore: number;
  
  /** Individual metric deviations */
  metricDeviations: MetricDeviation[];
  
  /** Pattern mismatches */
  patternMismatches: PatternMismatch[];
  
  /** Whether the deviation exceeds the threshold */
  exceedsThreshold: boolean;
  
  /** Suggestions for alignment */
  suggestions: string[];
}

/** Individual metric deviation */
export interface MetricDeviation {
  metric: keyof VoiceMetrics;
  expected: number;
  actual: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
}

/** Pattern mismatch detection */
export interface PatternMismatch {
  pattern: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

/** Voice analysis request */
export interface VoiceAnalysisRequest {
  /** Text content to analyze */
  content: string;
  /** User ID */
  userId: string;
  /** Project ID */
  projectId: string;
  /** Sample metadata */
  sampleMetadata?: {
    title: string;
    type: VoiceSample['type'];
  };
}

/** Voice analysis response */
export interface VoiceAnalysisResponse {
  /** Generated metrics */
  metrics: VoiceMetrics;
  /** Detected patterns */
  patterns: VoicePatterns;
  /** Confidence score (0-1) */
  confidence: number;
  /** Word count analyzed */
  wordCount: number;
  /** Warnings or notes */
  warnings?: string[];
}

/** Voice matching request */
export interface VoiceMatchRequest {
  /** Profile to match against */
  profileId: string;
  /** Generated content to check */
  content: string;
}

/** Voice matching response */
export interface VoiceMatchResponse {
  /** Deviation analysis */
  analysis: VoiceDeviationAnalysis;
  /** Rewrite suggestions if deviation is high */
  rewriteSuggestions?: string[];
}

/** Default voice profile settings */
export const DEFAULT_VOICE_SETTINGS = {
  deviationThreshold: 0.3,
  minSampleWordCount: 5000,
  recommendedSampleCount: 3,
};
