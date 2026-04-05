import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isFeatureEnabled,
  getAllFlags,
  getEnabledFlags,
  getFlagMetadata,
  FEATURE_FLAGS,
} from '../index';

describe('Feature Flags', () => {
  beforeEach(() => {
    // Clear any env variable overrides
    vi.unstubAllEnvs();
  });

  describe('FEATURE_FLAGS', () => {
    it('defines all expected flags', () => {
      expect(FEATURE_FLAGS.NEW_LANDING_PAGE).toBeDefined();
      expect(FEATURE_FLAGS.STRIPE_PAYMENTS).toBeDefined();
      expect(FEATURE_FLAGS.AI_ASSISTANT_V2).toBeDefined();
      expect(FEATURE_FLAGS.COLLABORATION).toBeDefined();
      expect(FEATURE_FLAGS.DARK_MODE).toBeDefined();
      expect(FEATURE_FLAGS.BETA_FEATURES).toBeDefined();
      expect(FEATURE_FLAGS.EXPORT_EPUB).toBeDefined();
      expect(FEATURE_FLAGS.ONBOARDING_V2).toBeDefined();
      expect(FEATURE_FLAGS.ANALYTICS_DASHBOARD).toBeDefined();
      expect(FEATURE_FLAGS.STEAM_CALIBRATION).toBeDefined();
    });

    it('each flag has required properties', () => {
      for (const flag of Object.values(FEATURE_FLAGS)) {
        expect(flag).toHaveProperty('key');
        expect(flag).toHaveProperty('description');
        expect(flag).toHaveProperty('defaultValue');
        expect(typeof flag.key).toBe('string');
        expect(typeof flag.description).toBe('string');
        expect(typeof flag.defaultValue).toBe('boolean');
      }
    });
  });

  describe('isFeatureEnabled', () => {
    it('returns default value when no overrides exist', () => {
      expect(isFeatureEnabled('NEW_LANDING_PAGE')).toBe(true);
      expect(isFeatureEnabled('STRIPE_PAYMENTS')).toBe(false);
      expect(isFeatureEnabled('EXPORT_EPUB')).toBe(true);
      expect(isFeatureEnabled('DARK_MODE')).toBe(false);
    });

    it('respects environment variable overrides', () => {
      vi.stubEnv('NEXT_PUBLIC_FF_STRIPE_PAYMENTS', 'true');
      expect(isFeatureEnabled('STRIPE_PAYMENTS')).toBe(true);
    });

    it('env override false takes precedence over default true', () => {
      vi.stubEnv('NEXT_PUBLIC_FF_NEW_LANDING_PAGE', 'false');
      expect(isFeatureEnabled('NEW_LANDING_PAGE')).toBe(false);
    });

    it('returns false for unknown flag key', () => {
      // @ts-expect-error - testing invalid key
      expect(isFeatureEnabled('NONEXISTENT_FLAG')).toBe(false);
    });
  });

  describe('getAllFlags', () => {
    it('returns all flags with their current state', () => {
      const flags = getAllFlags();
      expect(flags).toHaveProperty('NEW_LANDING_PAGE');
      expect(flags).toHaveProperty('STRIPE_PAYMENTS');
      expect(typeof flags.NEW_LANDING_PAGE).toBe('boolean');
      expect(typeof flags.STRIPE_PAYMENTS).toBe('boolean');
    });

    it('returns correct number of flags', () => {
      const flags = getAllFlags();
      expect(Object.keys(flags)).toHaveLength(Object.keys(FEATURE_FLAGS).length);
    });
  });

  describe('getEnabledFlags', () => {
    it('returns only enabled flags', () => {
      const enabled = getEnabledFlags();
      // Default enabled: NEW_LANDING_PAGE, EXPORT_EPUB, ONBOARDING_V2, STEAM_CALIBRATION
      expect(enabled).toContain('NEW_LANDING_PAGE');
      expect(enabled).toContain('EXPORT_EPUB');
      expect(enabled).toContain('ONBOARDING_V2');
      expect(enabled).toContain('STEAM_CALIBRATION');
      // Default disabled
      expect(enabled).not.toContain('STRIPE_PAYMENTS');
      expect(enabled).not.toContain('DARK_MODE');
    });
  });

  describe('getFlagMetadata', () => {
    it('returns metadata for all flags', () => {
      const metadata = getFlagMetadata();
      expect(metadata).toHaveLength(Object.keys(FEATURE_FLAGS).length);
    });

    it('includes env variable name for each flag', () => {
      const metadata = getFlagMetadata();
      for (const entry of metadata) {
        expect(entry.envVarName).toMatch(/^NEXT_PUBLIC_FF_/);
        expect(entry).toHaveProperty('name');
        expect(entry).toHaveProperty('key');
        expect(entry).toHaveProperty('description');
        expect(entry).toHaveProperty('defaultValue');
      }
    });
  });

  describe('rollout percentage', () => {
    it('produces consistent results for the same user', () => {
      // Add rollout percentage to a flag temporarily - test the hashing
      const result1 = isFeatureEnabled('NEW_LANDING_PAGE', 'user-123');
      const result2 = isFeatureEnabled('NEW_LANDING_PAGE', 'user-123');
      expect(result1).toBe(result2); // Consistent for same user
    });
  });
});
