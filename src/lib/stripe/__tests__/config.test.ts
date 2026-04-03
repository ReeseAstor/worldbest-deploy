import { describe, it, expect } from 'vitest';
import {
  PLANS,
  PLAN_LIMITS,
  FEATURE_COMPARISON,
  getPlanByPriceId,
  getPriceId,
  getIntervalByPriceId,
  getPlanLimits,
  isUnlimited,
  formatLimit,
} from '../config';

describe('Stripe Config', () => {
  describe('PLANS', () => {
    it('defines three pricing tiers', () => {
      expect(PLANS.spark).toBeDefined();
      expect(PLANS.flame).toBeDefined();
      expect(PLANS.inferno).toBeDefined();
    });

    it('spark is the free tier', () => {
      expect(PLANS.spark.monthlyPrice).toBe(0);
      expect(PLANS.spark.annualPrice).toBe(0);
      expect(PLANS.spark.priceIds.monthly).toBeNull();
      expect(PLANS.spark.priceIds.annual).toBeNull();
    });

    it('flame has correct pricing', () => {
      expect(PLANS.flame.monthlyPrice).toBe(39);
      expect(PLANS.flame.annualPrice).toBe(23);
      expect(PLANS.flame.annualSavings).toBe(192);
    });

    it('inferno has correct pricing', () => {
      expect(PLANS.inferno.monthlyPrice).toBe(79);
      expect(PLANS.inferno.annualPrice).toBe(63);
    });

    it('each plan has required properties', () => {
      for (const plan of Object.values(PLANS)) {
        expect(plan).toHaveProperty('name');
        expect(plan).toHaveProperty('displayName');
        expect(plan).toHaveProperty('description');
        expect(plan).toHaveProperty('features');
        expect(plan.features.length).toBeGreaterThan(0);
      }
    });
  });

  describe('PLAN_LIMITS', () => {
    it('spark limits are restrictive', () => {
      expect(PLAN_LIMITS.spark.projects).toBe(2);
      expect(PLAN_LIMITS.spark.aiPromptsPerDay).toBe(10);
      expect(PLAN_LIMITS.spark.steamLevels).toEqual([1, 2]);
      expect(PLAN_LIMITS.spark.kdpExport).toBe(false);
      expect(PLAN_LIMITS.spark.apiAccess).toBe(false);
    });

    it('flame has expanded limits', () => {
      expect(PLAN_LIMITS.flame.projects).toBe(10);
      expect(PLAN_LIMITS.flame.aiPromptsPerDay).toBe(-1); // Unlimited
      expect(PLAN_LIMITS.flame.steamLevels).toEqual([1, 2, 3, 4, 5]);
      expect(PLAN_LIMITS.flame.kdpExport).toBe(true);
    });

    it('inferno has maximum limits', () => {
      expect(PLAN_LIMITS.inferno.projects).toBe(-1); // Unlimited
      expect(PLAN_LIMITS.inferno.aiPromptsPerDay).toBe(-1);
      expect(PLAN_LIMITS.inferno.teamSeats).toBe(5);
      expect(PLAN_LIMITS.inferno.apiAccess).toBe(true);
      expect(PLAN_LIMITS.inferno.prioritySupport).toBe(true);
    });

    it('export formats expand with tier', () => {
      expect(PLAN_LIMITS.spark.exportFormats).toEqual(['docx']);
      expect(PLAN_LIMITS.flame.exportFormats).toContain('epub');
      expect(PLAN_LIMITS.flame.exportFormats).toContain('kdp');
      expect(PLAN_LIMITS.inferno.exportFormats).toContain('mobi');
    });
  });

  describe('getPlanByPriceId', () => {
    it('returns null for unknown price ID', () => {
      expect(getPlanByPriceId('price_unknown')).toBeNull();
    });

    it('returns null for empty string', () => {
      expect(getPlanByPriceId('')).toBeNull();
    });
  });

  describe('getPriceId', () => {
    it('returns null for spark plan (free tier)', () => {
      expect(getPriceId('spark', 'monthly')).toBeNull();
      expect(getPriceId('spark', 'annual')).toBeNull();
    });
  });

  describe('getIntervalByPriceId', () => {
    it('returns null for unknown price ID', () => {
      expect(getIntervalByPriceId('price_unknown')).toBeNull();
    });
  });

  describe('getPlanLimits', () => {
    it('returns correct limits for each plan', () => {
      expect(getPlanLimits('spark')).toEqual(PLAN_LIMITS.spark);
      expect(getPlanLimits('flame')).toEqual(PLAN_LIMITS.flame);
      expect(getPlanLimits('inferno')).toEqual(PLAN_LIMITS.inferno);
    });

    it('falls back to spark for unknown plans', () => {
      expect(getPlanLimits('unknown' as any)).toEqual(PLAN_LIMITS.spark);
    });
  });

  describe('isUnlimited', () => {
    it('returns true for -1', () => {
      expect(isUnlimited(-1)).toBe(true);
    });

    it('returns false for positive numbers', () => {
      expect(isUnlimited(0)).toBe(false);
      expect(isUnlimited(10)).toBe(false);
    });
  });

  describe('formatLimit', () => {
    it('returns "Unlimited" for -1', () => {
      expect(formatLimit(-1)).toBe('Unlimited');
    });

    it('returns number as string for positive values', () => {
      expect(formatLimit(10)).toBe('10');
      expect(formatLimit(0)).toBe('0');
    });
  });

  describe('FEATURE_COMPARISON', () => {
    it('has entries for key features', () => {
      const featureNames = FEATURE_COMPARISON.map((f) => f.feature);
      expect(featureNames).toContain('Projects');
      expect(featureNames).toContain('AI Prompts');
      expect(featureNames).toContain('Steam Levels');
      expect(featureNames).toContain('KDP Export');
      expect(featureNames).toContain('API Access');
    });

    it('each entry has all three plan values', () => {
      for (const comparison of FEATURE_COMPARISON) {
        expect(comparison).toHaveProperty('spark');
        expect(comparison).toHaveProperty('flame');
        expect(comparison).toHaveProperty('inferno');
      }
    });
  });
});
