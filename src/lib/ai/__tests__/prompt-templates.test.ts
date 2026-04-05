import { describe, it, expect } from 'vitest';
import {
  BASE_SYSTEM_PROMPT,
  STEAM_LEVELS,
  STEAM_MODIFIERS,
  TASK_PROMPTS,
  BEAT_PROMPTS,
  CHARACTER_VOICE_TEMPLATE,
  generatePrompt,
  generateBeatPrompt,
} from '../prompt-templates';

describe('Prompt Templates', () => {
  describe('BASE_SYSTEM_PROMPT', () => {
    it('contains core principles for romantasy writing', () => {
      expect(BASE_SYSTEM_PROMPT).toContain('romance fiction ghostwriter');
      expect(BASE_SYSTEM_PROMPT).toContain('CORE PRINCIPLES');
      expect(BASE_SYSTEM_PROMPT).toContain('ROMANTASY GENRE CONVENTIONS');
    });

    it('mentions HEA/HFN as non-negotiable', () => {
      expect(BASE_SYSTEM_PROMPT).toContain('HEA/HFN');
    });
  });

  describe('STEAM_LEVELS', () => {
    it('defines all 5 steam levels', () => {
      expect(STEAM_LEVELS[1]).toBeDefined();
      expect(STEAM_LEVELS[2]).toBeDefined();
      expect(STEAM_LEVELS[3]).toBeDefined();
      expect(STEAM_LEVELS[4]).toBeDefined();
      expect(STEAM_LEVELS[5]).toBeDefined();
    });

    it('each level has label and description', () => {
      for (const level of Object.values(STEAM_LEVELS)) {
        expect(level).toHaveProperty('label');
        expect(level).toHaveProperty('description');
      }
    });

    it('has correct labels', () => {
      expect(STEAM_LEVELS[1].label).toBe('Closed Door');
      expect(STEAM_LEVELS[3].label).toBe('Steamy');
      expect(STEAM_LEVELS[5].label).toBe('Scorching');
    });
  });

  describe('STEAM_MODIFIERS', () => {
    it('defines modifiers for all 5 levels', () => {
      expect(Object.keys(STEAM_MODIFIERS)).toHaveLength(5);
    });

    it('level 1 contains closed-door guidance', () => {
      expect(STEAM_MODIFIERS[1]).toContain('Closed Door');
      expect(STEAM_MODIFIERS[1]).toContain('Fade to black');
    });

    it('level 5 contains explicit guidance', () => {
      expect(STEAM_MODIFIERS[5]).toContain('Scorching');
      expect(STEAM_MODIFIERS[5]).toContain('explicit');
    });
  });

  describe('TASK_PROMPTS', () => {
    const expectedTasks = [
      'creative-drafting',
      'steam-scene',
      'line-editing',
      'developmental-edit',
      'continuity-check',
      'blurb-generation',
      'voice-analysis',
      'summarization',
    ];

    it('defines prompts for all task types', () => {
      for (const task of expectedTasks) {
        expect(TASK_PROMPTS[task as keyof typeof TASK_PROMPTS]).toBeDefined();
      }
    });

    it('creative-drafting focuses on voice matching', () => {
      expect(TASK_PROMPTS['creative-drafting']).toContain('Voice Matching');
      expect(TASK_PROMPTS['creative-drafting']).toContain('500-1000 words');
    });

    it('line-editing preserves author voice', () => {
      expect(TASK_PROMPTS['line-editing']).toContain('PRESERVE ABSOLUTELY');
      expect(TASK_PROMPTS['line-editing']).toContain("author's sentence rhythm");
    });

    it('blurb-generation has structure guidance', () => {
      expect(TASK_PROMPTS['blurb-generation']).toContain('HOOK');
      expect(TASK_PROMPTS['blurb-generation']).toContain('150-250 words');
    });
  });

  describe('BEAT_PROMPTS', () => {
    it('defines standard romance beats', () => {
      expect(BEAT_PROMPTS['meet-cute']).toBeDefined();
      expect(BEAT_PROMPTS['first-spark']).toBeDefined();
      expect(BEAT_PROMPTS['first-kiss']).toBeDefined();
      expect(BEAT_PROMPTS['black-moment']).toBeDefined();
      expect(BEAT_PROMPTS['grand-gesture']).toBeDefined();
      expect(BEAT_PROMPTS['hea']).toBeDefined();
    });

    it('meet-cute includes chemistry requirement', () => {
      expect(BEAT_PROMPTS['meet-cute']).toContain('chemistry');
    });

    it('black-moment creates emotional low point', () => {
      expect(BEAT_PROMPTS['black-moment']).toContain('emotional low point');
    });
  });

  describe('CHARACTER_VOICE_TEMPLATE', () => {
    it('contains template variables', () => {
      expect(CHARACTER_VOICE_TEMPLATE).toContain('{{name}}');
      expect(CHARACTER_VOICE_TEMPLATE).toContain('{{sentenceStyle}}');
      expect(CHARACTER_VOICE_TEMPLATE).toContain('{{vocabularyLevel}}');
    });
  });

  describe('generatePrompt', () => {
    it('combines base prompt, steam modifier, and task prompt', () => {
      const result = generatePrompt('creative-drafting', 3);
      expect(result).toContain(BASE_SYSTEM_PROMPT);
      expect(result).toContain(STEAM_MODIFIERS[3]);
      expect(result).toContain(TASK_PROMPTS['creative-drafting']);
    });

    it('includes additional context when provided', () => {
      const result = generatePrompt('creative-drafting', 2, 'The heroine is a fire mage');
      expect(result).toContain('ADDITIONAL CONTEXT');
      expect(result).toContain('The heroine is a fire mage');
    });

    it('works with all steam levels', () => {
      for (const level of [1, 2, 3, 4, 5] as const) {
        const result = generatePrompt('creative-drafting', level);
        expect(result).toContain(STEAM_MODIFIERS[level]);
      }
    });

    it('works with all task types', () => {
      const tasks = Object.keys(TASK_PROMPTS);
      for (const task of tasks) {
        const result = generatePrompt(task as any, 3);
        expect(result).toContain(TASK_PROMPTS[task as keyof typeof TASK_PROMPTS]);
      }
    });
  });

  describe('generateBeatPrompt', () => {
    it('combines base prompt, steam modifier, and beat prompt', () => {
      const result = generateBeatPrompt('first-kiss', 4);
      expect(result).toContain(BASE_SYSTEM_PROMPT);
      expect(result).toContain(STEAM_MODIFIERS[4]);
      expect(result).toContain(BEAT_PROMPTS['first-kiss']);
    });

    it('includes character profiles when provided', () => {
      const profiles = ['Aria: Fire mage, stubborn', 'Kael: Shadow warrior, stoic'];
      const result = generateBeatPrompt('meet-cute', 2, profiles);
      expect(result).toContain('CHARACTERS IN SCENE');
      expect(result).toContain('Aria: Fire mage, stubborn');
      expect(result).toContain('Kael: Shadow warrior, stoic');
    });

    it('falls back to creative-drafting for unknown beat types', () => {
      const result = generateBeatPrompt('unknown-beat', 3);
      expect(result).toContain(TASK_PROMPTS['creative-drafting']);
    });
  });
});
