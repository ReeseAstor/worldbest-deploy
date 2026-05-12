/**
 * Steam Calibration Types for Ember
 * 
 * The 5-level heat scale controls explicit content generation in romantasy fiction.
 * Each level defines vocabulary scope, scene structure, and AI prompt modifiers.
 */

/** Steam level numeric values */
export type SteamLevelValue = 1 | 2 | 3 | 4 | 5;

/** Steam level labels */
export type SteamLevelLabel = 
  | 'Closed Door' 
  | 'Warm' 
  | 'Steamy' 
  | 'Spicy' 
  | 'Scorching';

/** Steam level configuration */
export interface SteamLevel {
  level: SteamLevelValue;
  label: SteamLevelLabel;
  description: string;
  vocabularyScope: VocabularyScope;
  sceneGuidelines: SceneGuidelines;
  promptModifiers: SteamPromptModifiers;
}

/** Vocabulary scope for each steam level */
export interface VocabularyScope {
  /** Terms that are allowed at this steam level */
  allowedTerms: string[];
  /** Terms that should be avoided at this steam level */
  restrictedTerms: string[];
  /** Preferred euphemisms and literary alternatives */
  preferredAlternatives: Record<string, string[]>;
  /** Physical description depth: 'emotional' | 'sensory' | 'anatomical' | 'explicit' */
  descriptionDepth: 'emotional' | 'sensory' | 'anatomical' | 'explicit';
}

/** Scene structure guidelines per steam level */
export interface SceneGuidelines {
  /** Whether full scenes are included or implied */
  sceneIncluded: boolean;
  /** Whether to fade to black before/during/after intimate moments */
  fadeToBlack: 'before' | 'during' | 'after' | 'none';
  /** Maximum scene length in words (0 = no limit) */
  maxSceneLength: number;
  /** Focus balance: emotional vs physical (0-100, 0 = all emotional, 100 = all physical) */
  emotionalPhysicalBalance: number;
  /** Whether to include choreography details */
  includeChoreography: boolean;
  /** Whether kink/taboo elements are allowed */
  allowKinkElements: boolean;
  /** Power dynamics depth */
  powerDynamicsDepth: 'none' | 'subtle' | 'moderate' | 'explicit';
}

/** Prompt modifiers injected into AI generation requests */
export interface SteamPromptModifiers {
  /** System prompt additions for this steam level */
  systemPromptAdditions: string;
  /** Style constraints */
  styleConstraints: string[];
  /** Content boundaries */
  contentBoundaries: string[];
  /** Tone descriptors */
  toneDescriptors: string[];
}

/** Pre-defined steam level configurations */
export const STEAM_LEVELS: Record<SteamLevelValue, SteamLevel> = {
  1: {
    level: 1,
    label: 'Closed Door',
    description: 'Tension and attraction only. Scene fades to black before anything physical beyond kissing.',
    vocabularyScope: {
      allowedTerms: ['tension', 'desire', 'longing', 'attraction', 'chemistry', 'spark'],
      restrictedTerms: [],
      preferredAlternatives: {},
      descriptionDepth: 'emotional',
    },
    sceneGuidelines: {
      sceneIncluded: false,
      fadeToBlack: 'before',
      maxSceneLength: 0,
      emotionalPhysicalBalance: 10,
      includeChoreography: false,
      allowKinkElements: false,
      powerDynamicsDepth: 'none',
    },
    promptModifiers: {
      systemPromptAdditions: 'Keep all intimate scenes closed door. Focus on emotional tension and anticipation. Fade to black before any physical intimacy beyond kissing.',
      styleConstraints: ['Focus on emotional connection', 'Build tension through dialogue and glances', 'Fade to black at intimate moments'],
      contentBoundaries: ['No explicit physical descriptions', 'No anatomical terms', 'Stop at kissing'],
      toneDescriptors: ['romantic', 'tender', 'anticipatory'],
    },
  },
  2: {
    level: 2,
    label: 'Warm',
    description: 'Foreplay and build-up described. The act itself is implied or briefly referenced. Literary language.',
    vocabularyScope: {
      allowedTerms: ['warmth', 'heat', 'touch', 'caress', 'breath', 'skin', 'lips', 'hands'],
      restrictedTerms: [],
      preferredAlternatives: {
        'explicit term': ['euphemism', 'poetic alternative'],
      },
      descriptionDepth: 'sensory',
    },
    sceneGuidelines: {
      sceneIncluded: true,
      fadeToBlack: 'during',
      maxSceneLength: 500,
      emotionalPhysicalBalance: 30,
      includeChoreography: false,
      allowKinkElements: false,
      powerDynamicsDepth: 'subtle',
    },
    promptModifiers: {
      systemPromptAdditions: 'Include sensual build-up with literary language. Describe foreplay and tension but keep the main act implied. Use euphemistic, poetic language.',
      styleConstraints: ['Use literary euphemisms', 'Focus on sensation and emotion', 'Poetic descriptions'],
      contentBoundaries: ['Imply rather than explicit describe', 'Use sensory language', 'Keep anatomical references minimal'],
      toneDescriptors: ['sensual', 'literary', 'romantic', 'tasteful'],
    },
  },
  3: {
    level: 3,
    label: 'Steamy',
    description: 'Full scenes included. Moderate explicitness. Balances emotional connection with physical description.',
    vocabularyScope: {
      allowedTerms: ['desire', 'need', 'ache', 'pleasure', 'moan', 'gasp', 'thrust', 'arch'],
      restrictedTerms: [],
      preferredAlternatives: {},
      descriptionDepth: 'anatomical',
    },
    sceneGuidelines: {
      sceneIncluded: true,
      fadeToBlack: 'none',
      maxSceneLength: 1500,
      emotionalPhysicalBalance: 50,
      includeChoreography: true,
      allowKinkElements: false,
      powerDynamicsDepth: 'moderate',
    },
    promptModifiers: {
      systemPromptAdditions: 'Write full intimate scenes with moderate explicitness. Balance emotional connection with physical description. Use direct but tasteful anatomical language.',
      styleConstraints: ['Balance emotion and physicality', 'Direct but tasteful language', 'Character-specific reactions'],
      contentBoundaries: ['Full scenes allowed', 'Moderate anatomical detail', 'Maintain emotional stakes'],
      toneDescriptors: ['passionate', 'steamy', 'emotionally connected'],
    },
  },
  4: {
    level: 4,
    label: 'Spicy',
    description: 'Detailed, extended scenes. Multiple encounters per book. Kink elements may be introduced. Power dynamics explored.',
    vocabularyScope: {
      allowedTerms: ['explicit vocabulary allowed', 'anatomical terms', 'action verbs'],
      restrictedTerms: [],
      preferredAlternatives: {},
      descriptionDepth: 'explicit',
    },
    sceneGuidelines: {
      sceneIncluded: true,
      fadeToBlack: 'none',
      maxSceneLength: 3000,
      emotionalPhysicalBalance: 70,
      includeChoreography: true,
      allowKinkElements: true,
      powerDynamicsDepth: 'explicit',
    },
    promptModifiers: {
      systemPromptAdditions: 'Write detailed, extended intimate scenes with explicit vocabulary. Include multiple encounters. May introduce kink elements and explore power dynamics. Maintain character voice throughout.',
      styleConstraints: ['Explicit but character-driven', 'Extended choreography', 'Power dynamics welcome'],
      contentBoundaries: ['Explicit content allowed', 'Kink elements permitted', 'Maintain consent'],
      toneDescriptors: ['explicit', 'passionate', 'intense', 'character-driven'],
    },
  },
  5: {
    level: 5,
    label: 'Scorching',
    description: 'No content limits within consent boundaries. Taboo elements, edge play, dark romance dynamics fully explored.',
    vocabularyScope: {
      allowedTerms: ['unrestricted explicit vocabulary'],
      restrictedTerms: [],
      preferredAlternatives: {},
      descriptionDepth: 'explicit',
    },
    sceneGuidelines: {
      sceneIncluded: true,
      fadeToBlack: 'none',
      maxSceneLength: 0, // No limit
      emotionalPhysicalBalance: 80,
      includeChoreography: true,
      allowKinkElements: true,
      powerDynamicsDepth: 'explicit',
    },
    promptModifiers: {
      systemPromptAdditions: 'Write without content limits within consent boundaries. Full scene architecture with emotional stakes. Taboo elements, edge play, and dark romance dynamics may be fully explored. Unrestricted explicit vocabulary.',
      styleConstraints: ['No vocabulary restrictions', 'Full creative freedom', 'Emotional stakes required'],
      contentBoundaries: ['Consent must be clear or addressed', 'Dark elements allowed', 'Character voice maintained'],
      toneDescriptors: ['scorching', 'uninhibited', 'dark', 'intense', 'raw'],
    },
  },
};

/** Get steam level by value */
export function getSteamLevel(level: SteamLevelValue): SteamLevel {
  return STEAM_LEVELS[level];
}

/** Get steam level label */
export function getSteamLevelLabel(level: SteamLevelValue): SteamLevelLabel {
  return STEAM_LEVELS[level].label;
}

/** Steam level for project/scene settings */
export interface SteamSettings {
  /** Default steam level for the project */
  defaultLevel: SteamLevelValue;
  /** Whether to allow per-scene overrides */
  allowSceneOverrides: boolean;
  /** Custom vocabulary additions */
  customVocabulary?: {
    allowed?: string[];
    restricted?: string[];
  };
}

/** Scene-level steam override */
export interface SceneSteamOverride {
  sceneId: string;
  level: SteamLevelValue;
  notes?: string;
}
