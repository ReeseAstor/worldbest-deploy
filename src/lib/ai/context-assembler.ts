/**
 * AI Context Assembler for Ember
 * 
 * Assembles context from the series bible, voice profile, and manuscript
 * for AI generation. Implements the 3-tier context window strategy:
 * - Immediate Context: Current scene/chapter being worked on
 * - Retrieved Context: Relevant bible entries from vector search
 * - Global Context: Always-on rules, voice constraints, steam settings
 */

import type { 
  ContextWindowConfig, 
  AITaskType,
  ModelConfig 
} from '@ember/shared-types';

// Token estimation (rough: ~4 chars per token)
const CHARS_PER_TOKEN = 4;

export interface BibleEntity {
  id: string;
  type: 'character' | 'relationship' | 'location' | 'event' | 'rule';
  name: string;
  content: string;
  embedding?: number[];
  relevanceScore?: number;
}

export interface ChapterSummary {
  chapterId: string;
  chapterNumber: number;
  title: string;
  summary: string;
  keyEvents: string[];
  charactersPresent: string[];
  wordCount: number;
}

export interface VoiceConstraints {
  avgSentenceLength: { min: number; max: number };
  dialogueRatio: { min: number; max: number };
  avoidWords: string[];
  preferredTags: string[];
  povDepth: string;
  signatureStyles: string[];
}

export interface SteamSettings {
  level: 1 | 2 | 3 | 4 | 5;
  vocabularyAllowed: string[];
  vocabularyForbidden: string[];
  explicitness: 'fade-to-black' | 'suggestive' | 'moderate' | 'explicit' | 'graphic';
  emotionFocus: number; // 0-100, higher = more emotional vs physical
}

export interface AssembledContext {
  systemPrompt: string;
  immediateContext: string;
  retrievedContext: string;
  globalContext: string;
  totalTokens: number;
  metadata: {
    taskType: AITaskType;
    steamLevel: number;
    charactersInScope: string[];
    chapterContext: string;
  };
}

export interface ContextAssemblerConfig {
  maxTotalTokens: number;
  immediateTokens: number;
  retrievedTokens: number;
  globalTokens: number;
  includeChapterSummaries: boolean;
  steamLevel: 1 | 2 | 3 | 4 | 5;
}

const DEFAULT_CONFIG: ContextAssemblerConfig = {
  maxTotalTokens: 128000, // GPT-4 Turbo context
  immediateTokens: 8000,
  retrievedTokens: 12000,
  globalTokens: 4000,
  includeChapterSummaries: true,
  steamLevel: 3,
};

/**
 * Estimate token count from text
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Truncate text to fit within token budget
 */
function truncateToTokens(text: string, maxTokens: number): string {
  const maxChars = maxTokens * CHARS_PER_TOKEN;
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 3) + '...';
}

/**
 * Build the global context section (always included)
 */
function buildGlobalContext(
  voiceConstraints: VoiceConstraints,
  steamSettings: SteamSettings,
  continuityRules: string[],
  maxTokens: number
): string {
  const sections: string[] = [];

  // Voice constraints
  sections.push(`## Voice Constraints
- Sentence length: ${voiceConstraints.avgSentenceLength.min}-${voiceConstraints.avgSentenceLength.max} words average
- Dialogue ratio: ${voiceConstraints.dialogueRatio.min}-${voiceConstraints.dialogueRatio.max}%
- POV depth: ${voiceConstraints.povDepth}
- Avoid words: ${voiceConstraints.avoidWords.join(', ')}
- Preferred dialogue tags: ${voiceConstraints.preferredTags.join(', ')}
- Signature styles: ${voiceConstraints.signatureStyles.join('; ')}`);

  // Steam settings
  const steamLabels = ['Closed Door', 'Warm', 'Steamy', 'Spicy', 'Scorching'];
  sections.push(`## Steam Level: ${steamSettings.level} (${steamLabels[steamSettings.level - 1]})
- Explicitness: ${steamSettings.explicitness}
- Emotion vs Physical focus: ${steamSettings.emotionFocus}% emotional
- Allowed vocabulary: ${steamSettings.vocabularyAllowed.slice(0, 10).join(', ')}${steamSettings.vocabularyAllowed.length > 10 ? '...' : ''}
- Forbidden vocabulary: ${steamSettings.vocabularyForbidden.slice(0, 5).join(', ')}${steamSettings.vocabularyForbidden.length > 5 ? '...' : ''}`);

  // Continuity rules
  if (continuityRules.length > 0) {
    sections.push(`## Continuity Rules (MUST FOLLOW)
${continuityRules.map((rule, i) => `${i + 1}. ${rule}`).join('\n')}`);
  }

  const combined = sections.join('\n\n');
  return truncateToTokens(combined, maxTokens);
}

/**
 * Build the immediate context section (current scene)
 */
function buildImmediateContext(
  currentText: string,
  cursorPosition: number,
  previousChapterSummary: string | null,
  nextBeat: string | null,
  maxTokens: number
): string {
  const sections: string[] = [];

  // Previous chapter context
  if (previousChapterSummary) {
    sections.push(`## Previous Chapter Summary
${previousChapterSummary}`);
  }

  // Current scene text (text around cursor)
  const beforeCursor = currentText.slice(0, cursorPosition);
  const afterCursor = currentText.slice(cursorPosition);
  
  // Take more from before (what's been written) than after
  const beforeBudget = Math.floor(maxTokens * 0.6 * CHARS_PER_TOKEN);
  const afterBudget = Math.floor(maxTokens * 0.2 * CHARS_PER_TOKEN);
  
  const relevantBefore = beforeCursor.slice(-beforeBudget);
  const relevantAfter = afterCursor.slice(0, afterBudget);

  sections.push(`## Current Scene
${relevantBefore}[CURSOR]${relevantAfter}`);

  // Next beat target
  if (nextBeat) {
    sections.push(`## Next Story Beat Target
${nextBeat}`);
  }

  return truncateToTokens(sections.join('\n\n'), maxTokens);
}

/**
 * Build retrieved context from bible entities
 */
function buildRetrievedContext(
  relevantEntities: BibleEntity[],
  chapterSummaries: ChapterSummary[],
  maxTokens: number
): string {
  const sections: string[] = [];

  // Group entities by type
  const byType: Record<string, BibleEntity[]> = {};
  for (const entity of relevantEntities) {
    if (!byType[entity.type]) byType[entity.type] = [];
    byType[entity.type].push(entity);
  }

  // Characters
  if (byType.character?.length) {
    sections.push(`## Relevant Characters
${byType.character.map(c => `### ${c.name}\n${c.content}`).join('\n\n')}`);
  }

  // Relationships
  if (byType.relationship?.length) {
    sections.push(`## Active Relationships
${byType.relationship.map(r => `- ${r.name}: ${r.content}`).join('\n')}`);
  }

  // Locations
  if (byType.location?.length) {
    sections.push(`## Setting Details
${byType.location.map(l => `### ${l.name}\n${l.content}`).join('\n\n')}`);
  }

  // Recent events
  if (byType.event?.length) {
    sections.push(`## Recent Events
${byType.event.map(e => `- ${e.name}: ${e.content}`).join('\n')}`);
  }

  // Chapter summaries for series context
  if (chapterSummaries.length > 0) {
    sections.push(`## Prior Chapter Context
${chapterSummaries.map(ch => 
  `Chapter ${ch.chapterNumber}: ${ch.title}\n${ch.summary}`
).join('\n\n')}`);
  }

  return truncateToTokens(sections.join('\n\n'), maxTokens);
}

/**
 * Build task-specific system prompt
 */
function buildSystemPrompt(taskType: AITaskType, steamLevel: number): string {
  const basePrompt = `You are an expert romance fiction ghostwriter specializing in the romantasy genre. 
You write with emotional depth, compelling character dynamics, and genre-appropriate heat levels.
Always maintain the author's voice as specified in the constraints.`;

  const taskPrompts: Record<AITaskType, string> = {
    'creative-drafting': `${basePrompt}

Your task is to continue the manuscript, matching the author's voice exactly.
Focus on:
- Advancing the plot toward the next beat
- Deepening character relationships
- Maintaining consistent POV and voice
- Including sensory details and emotional interiority`,

    'steam-scene': `${basePrompt}

Your task is to write an intimate scene at steam level ${steamLevel}.
Focus on:
- Building emotional connection first
- Respecting vocabulary constraints for this heat level
- Balancing physical and emotional description
- Maintaining character voice during intimate moments
- Pacing that serves the emotional arc`,

    'line-editing': `${basePrompt}

Your task is to improve the prose while preserving the author's voice.
Focus on:
- Tightening sentences without losing style
- Strengthening verbs
- Reducing adverb overuse
- Improving dialogue tags
- Enhancing sensory details
Do NOT change plot, character actions, or story events.`,

    'developmental-edit': `${basePrompt}

Your task is to provide developmental feedback on the manuscript.
Focus on:
- Pacing issues (too fast/slow)
- Character arc progression
- Emotional beat execution
- Romance arc alignment with chosen template
- Tension and conflict balance
Provide specific, actionable suggestions.`,

    'continuity-check': `${basePrompt}

Your task is to check for continuity errors in the manuscript.
Focus on:
- Timeline consistency
- Character detail consistency (eye color, names, relationships)
- Location details matching descriptions
- Plot thread continuity
- Previously established facts
List any inconsistencies found with specific references.`,

    'blurb-generation': `${basePrompt}

Your task is to write compelling marketing copy for this romance.
Focus on:
- Hook the reader with the central conflict
- Highlight the romantic tension
- Match the heat level expectations for this subgenre
- Include relevant trope signals
- Keep it concise and enticing
Target length: 150-250 words.`,

    'voice-analysis': `${basePrompt}

Your task is to analyze the author's writing voice.
Focus on:
- Sentence structure patterns
- Vocabulary preferences and complexity
- Dialogue vs. narrative ratio
- POV depth and interiority style
- Pacing tendencies
- Distinctive stylistic markers
Provide quantified metrics where possible.`,

    'summarization': `${basePrompt}

Your task is to create a concise summary of the provided text.
Focus on:
- Key plot events
- Character emotional states
- Relationship developments
- Important details for continuity
Keep the summary brief but comprehensive.`,
  };

  return taskPrompts[taskType] || basePrompt;
}

/**
 * Main context assembler function
 */
export async function assembleContext(
  taskType: AITaskType,
  currentText: string,
  cursorPosition: number,
  relevantEntities: BibleEntity[],
  voiceConstraints: VoiceConstraints,
  steamSettings: SteamSettings,
  continuityRules: string[],
  chapterSummaries: ChapterSummary[] = [],
  previousChapterSummary: string | null = null,
  nextBeat: string | null = null,
  config: Partial<ContextAssemblerConfig> = {}
): Promise<AssembledContext> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Build each context section
  const systemPrompt = buildSystemPrompt(taskType, steamSettings.level);
  
  const globalContext = buildGlobalContext(
    voiceConstraints,
    steamSettings,
    continuityRules,
    finalConfig.globalTokens
  );

  const immediateContext = buildImmediateContext(
    currentText,
    cursorPosition,
    previousChapterSummary,
    nextBeat,
    finalConfig.immediateTokens
  );

  const retrievedContext = buildRetrievedContext(
    relevantEntities,
    finalConfig.includeChapterSummaries ? chapterSummaries : [],
    finalConfig.retrievedTokens
  );

  // Calculate total tokens
  const totalTokens = 
    estimateTokens(systemPrompt) +
    estimateTokens(globalContext) +
    estimateTokens(immediateContext) +
    estimateTokens(retrievedContext);

  // Extract character names in scope
  const charactersInScope = relevantEntities
    .filter(e => e.type === 'character')
    .map(e => e.name);

  return {
    systemPrompt,
    globalContext,
    immediateContext,
    retrievedContext,
    totalTokens,
    metadata: {
      taskType,
      steamLevel: steamSettings.level,
      charactersInScope,
      chapterContext: previousChapterSummary || 'Chapter start',
    },
  };
}

/**
 * Format assembled context for API call
 */
export function formatForAPI(context: AssembledContext): {
  messages: Array<{ role: 'system' | 'user'; content: string }>;
} {
  return {
    messages: [
      {
        role: 'system',
        content: context.systemPrompt,
      },
      {
        role: 'user',
        content: `${context.globalContext}

---

${context.retrievedContext}

---

${context.immediateContext}

Please continue writing from [CURSOR], maintaining voice and advancing toward the story beat.`,
      },
    ],
  };
}

export default {
  assembleContext,
  formatForAPI,
  estimateTokens,
};
