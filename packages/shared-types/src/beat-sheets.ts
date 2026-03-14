/**
 * Beat Sheet Types for Ember
 * 
 * Defines beat sheet templates and romance arc structures.
 */

/** Beat types for romance structure */
export type BeatType = 
  | 'setup'
  | 'meet-cute'
  | 'first-spark'
  | 'resistance'
  | 'deepening'
  | 'first-kiss'
  | 'false-victory'
  | 'black-moment'
  | 'grand-gesture'
  | 'hea'
  | 'custom';

/** Beat sheet template types */
export type BeatSheetTemplateType = 
  | 'romancing-the-beat'
  | 'save-the-cat-romance'
  | 'dark-romance-arc'
  | 'epic-fantasy-romance'
  | 'custom';

/** Status of a beat in the story */
export type BeatStatus = 'pending' | 'drafting' | 'complete';

/** Individual beat definition */
export interface Beat {
  id: string;
  beatSheetId: string;
  name: string;
  type: BeatType;
  description: string;
  order: number;
  targetWordCount?: number;
  actualWordCount: number;
  chapterId?: string;
  sceneReference?: string;
  emotionalGoal?: string;
  steamLevel?: 1 | 2 | 3 | 4 | 5;
  status: BeatStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Beat sheet containing multiple beats */
export interface BeatSheet {
  id: string;
  projectId: string;
  templateType: BeatSheetTemplateType;
  name: string;
  description?: string;
  beats: Beat[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Trope categories */
export type TropeCategory = 
  | 'relationship-dynamic'
  | 'situation'
  | 'character-type'
  | 'plot-device'
  | 'setting'
  | 'subplot';

/** Trope definition */
export interface TropeDefinition {
  id: string;
  name: string;
  category: TropeCategory;
  description: string;
  examples: string[];
  compatibleWith: string[];
  conflictsWith: string[];
}

/** Trope selection for a project */
export interface TropeSelection {
  tropeId: string;
  isPrimary: boolean;
  notes?: string;
}

/** Beat template for creating new beat sheets */
export interface BeatTemplate {
  name: string;
  type: BeatType;
  description: string;
  order: number;
  targetWordCount?: number;
  emotionalGoal?: string;
  steamLevel?: 1 | 2 | 3 | 4 | 5;
}

/** Pre-built beat sheet templates */
export interface BeatSheetTemplate {
  id: BeatSheetTemplateType;
  name: string;
  description: string;
  beats: BeatTemplate[];
}

// ============================================
// PRE-BUILT TEMPLATES
// ============================================

export const ROMANCING_THE_BEAT_TEMPLATE: BeatSheetTemplate = {
  id: 'romancing-the-beat',
  name: 'Romancing the Beat',
  description: 'Gwen Hayes 16-beat romance structure adapted for novels',
  beats: [
    { name: 'Setup', type: 'setup', description: 'Establish protagonist in their ordinary world', order: 1, targetWordCount: 5000 },
    { name: 'Meet Cute', type: 'meet-cute', description: 'First meeting between romantic leads', order: 2, targetWordCount: 3000 },
    { name: 'No Way', type: 'resistance', description: 'Why this romance can never work', order: 3, targetWordCount: 5000 },
    { name: 'Deepening Desire', type: 'deepening', description: 'Growing attraction despite resistance', order: 4, targetWordCount: 8000 },
    { name: 'First Kiss', type: 'first-kiss', description: 'Physical intimacy milestone', order: 5, targetWordCount: 3000, steamLevel: 2 },
    { name: 'Inkling', type: 'first-spark', description: 'Emotional realization begins', order: 6, targetWordCount: 5000 },
    { name: 'Midpoint', type: 'false-victory', description: 'Relationship seems to be working', order: 7, targetWordCount: 8000, steamLevel: 3 },
    { name: 'Crisis', type: 'resistance', description: 'External or internal conflict threatens', order: 8, targetWordCount: 5000 },
    { name: 'Black Moment', type: 'black-moment', description: 'All seems lost for the relationship', order: 9, targetWordCount: 5000 },
    { name: 'Grand Gesture', type: 'grand-gesture', description: 'One lead makes a bold move', order: 10, targetWordCount: 3000 },
    { name: 'HEA/HFN', type: 'hea', description: 'Happy ending or happy for now', order: 11, targetWordCount: 5000 },
  ],
};

export const SAVE_THE_CAT_ROMANCE_TEMPLATE: BeatSheetTemplate = {
  id: 'save-the-cat-romance',
  name: 'Save the Cat! Romance',
  description: 'Blake Snyder beat sheet adapted for romance',
  beats: [
    { name: 'Opening Image', type: 'setup', description: 'Snapshot of protagonist before love', order: 1, targetWordCount: 2000 },
    { name: 'Theme Stated', type: 'setup', description: 'Hint at what love will teach them', order: 2, targetWordCount: 1000 },
    { name: 'Setup', type: 'setup', description: 'Establish world, wound, and want', order: 3, targetWordCount: 5000 },
    { name: 'Catalyst', type: 'meet-cute', description: 'The meeting that changes everything', order: 4, targetWordCount: 3000 },
    { name: 'Debate', type: 'resistance', description: 'Should they pursue this attraction?', order: 5, targetWordCount: 5000 },
    { name: 'Break Into Two', type: 'first-spark', description: 'Deciding to explore the connection', order: 6, targetWordCount: 3000 },
    { name: 'Fun & Games', type: 'deepening', description: 'The promise of the romance premise', order: 7, targetWordCount: 10000, steamLevel: 2 },
    { name: 'Midpoint', type: 'false-victory', description: 'False victory or defeat in love', order: 8, targetWordCount: 5000, steamLevel: 3 },
    { name: 'Bad Guys Close In', type: 'resistance', description: 'External and internal conflicts mount', order: 9, targetWordCount: 8000 },
    { name: 'All Is Lost', type: 'black-moment', description: 'The relationship breaks', order: 10, targetWordCount: 5000 },
    { name: 'Dark Night', type: 'black-moment', description: 'Processing the loss', order: 11, targetWordCount: 3000 },
    { name: 'Break Into Three', type: 'grand-gesture', description: 'Realization of what matters', order: 12, targetWordCount: 2000 },
    { name: 'Finale', type: 'grand-gesture', description: 'Fighting for love', order: 13, targetWordCount: 5000 },
    { name: 'Final Image', type: 'hea', description: 'Snapshot of protagonist transformed by love', order: 14, targetWordCount: 3000 },
  ],
};

export const DARK_ROMANCE_ARC_TEMPLATE: BeatSheetTemplate = {
  id: 'dark-romance-arc',
  name: 'Dark Romance Arc',
  description: 'Structure for morally gray or villain romances',
  beats: [
    { name: 'World of Shadows', type: 'setup', description: 'Establish the dark setting and stakes', order: 1, targetWordCount: 5000 },
    { name: 'Collision', type: 'meet-cute', description: 'Dangerous first encounter', order: 2, targetWordCount: 4000 },
    { name: 'Captivity/Proximity', type: 'resistance', description: 'Forced closeness', order: 3, targetWordCount: 8000, steamLevel: 2 },
    { name: 'Crack in the Armor', type: 'first-spark', description: 'Villain shows vulnerability', order: 4, targetWordCount: 6000 },
    { name: 'Dark Desire', type: 'deepening', description: 'Attraction despite everything', order: 5, targetWordCount: 8000, steamLevel: 4 },
    { name: 'Betrayal/Choice', type: 'black-moment', description: 'Trust is shattered', order: 6, targetWordCount: 5000 },
    { name: 'Burn It Down', type: 'grand-gesture', description: 'Destroy everything for love', order: 7, targetWordCount: 4000 },
    { name: 'Dark HEA', type: 'hea', description: 'Morally gray happy ending', order: 8, targetWordCount: 5000, steamLevel: 5 },
  ],
};

export const EPIC_FANTASY_ROMANCE_TEMPLATE: BeatSheetTemplate = {
  id: 'epic-fantasy-romance',
  name: 'Epic Fantasy Romance',
  description: 'For romantasy with complex world-building and political stakes',
  beats: [
    { name: 'The Ordinary World', type: 'setup', description: 'Establish protagonist and magical world', order: 1, targetWordCount: 6000 },
    { name: 'Call to Adventure', type: 'setup', description: 'Inciting incident with romantic implications', order: 2, targetWordCount: 4000 },
    { name: 'Meeting the Other', type: 'meet-cute', description: 'First encounter with love interest', order: 3, targetWordCount: 4000 },
    { name: 'Tests & Allies', type: 'deepening', description: 'Building trust through challenges', order: 4, targetWordCount: 10000 },
    { name: 'Approaching the Innermost Cave', type: 'first-kiss', description: 'Emotional and physical vulnerability', order: 5, targetWordCount: 5000, steamLevel: 3 },
    { name: 'The Ordeal', type: 'resistance', description: 'Major conflict tests the relationship', order: 6, targetWordCount: 8000 },
    { name: 'Reward/Seizing the Sword', type: 'false-victory', description: 'Moment of connection before the fall', order: 7, targetWordCount: 5000, steamLevel: 4 },
    { name: 'The Road Back', type: 'black-moment', description: 'Consequences catch up', order: 8, targetWordCount: 6000 },
    { name: 'Resurrection', type: 'grand-gesture', description: 'Sacrifice and transformation', order: 9, targetWordCount: 6000 },
    { name: 'Return with Elixir', type: 'hea', description: 'Love triumphant, world changed', order: 10, targetWordCount: 6000 },
  ],
};

/** All available beat sheet templates */
export const BEAT_SHEET_TEMPLATES: BeatSheetTemplate[] = [
  ROMANCING_THE_BEAT_TEMPLATE,
  SAVE_THE_CAT_ROMANCE_TEMPLATE,
  DARK_ROMANCE_ARC_TEMPLATE,
  EPIC_FANTASY_ROMANCE_TEMPLATE,
];

/** Common romance tropes */
export const COMMON_TROPES: TropeDefinition[] = [
  {
    id: 'enemies-to-lovers',
    name: 'Enemies to Lovers',
    category: 'relationship-dynamic',
    description: 'Characters who start as adversaries and fall in love',
    examples: ['Pride and Prejudice', 'The Hating Game', 'A Court of Mist and Fury'],
    compatibleWith: ['forced-proximity', 'slow-burn', 'grumpy-sunshine'],
    conflictsWith: ['love-at-first-sight', 'childhood-sweethearts'],
  },
  {
    id: 'forced-proximity',
    name: 'Forced Proximity',
    category: 'situation',
    description: 'Characters are forced to spend time together',
    examples: ['Snowed in', 'Fake dating', 'Shared apartment'],
    compatibleWith: ['enemies-to-lovers', 'slow-burn', 'one-bed'],
    conflictsWith: [],
  },
  {
    id: 'fated-mates',
    name: 'Fated Mates',
    category: 'plot-device',
    description: 'Characters are destined to be together by fate/magic',
    examples: ['Soul bonds', 'Mate marks', 'Prophesied pairs'],
    compatibleWith: ['paranormal', 'fantasy', 'instant-attraction'],
    conflictsWith: ['slow-burn'],
  },
  {
    id: 'slow-burn',
    name: 'Slow Burn',
    category: 'relationship-dynamic',
    description: 'Romance develops gradually over time',
    examples: ['Long courtship', 'Building tension', 'Delayed gratification'],
    compatibleWith: ['enemies-to-lovers', 'friends-to-lovers', 'forced-proximity'],
    conflictsWith: ['insta-love', 'fated-mates'],
  },
  {
    id: 'found-family',
    name: 'Found Family',
    category: 'subplot',
    description: 'Characters form a family bond with non-blood relatives',
    examples: ['Ragtag crew', 'Chosen family', 'Band of misfits'],
    compatibleWith: ['any'],
    conflictsWith: [],
  },
  {
    id: 'grumpy-sunshine',
    name: 'Grumpy/Sunshine',
    category: 'character-type',
    description: 'Pairing of an optimistic character with a pessimistic one',
    examples: ['The Beach Read', 'The Flatshare'],
    compatibleWith: ['enemies-to-lovers', 'forced-proximity', 'opposites-attract'],
    conflictsWith: [],
  },
];
