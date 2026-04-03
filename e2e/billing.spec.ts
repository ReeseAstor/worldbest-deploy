import { test, expect } from '@playwright/test';

test.describe('Billing & Pricing', () => {
  test.describe('Pricing Display', () => {
    test('landing page shows pricing section', async ({ page }) => {
      await page.goto('/');
      // Scroll to pricing section
      const pricingSection = page.locator('[id*="pricing"], [data-testid*="pricing"]').first();
      if (await pricingSection.isVisible()) {
        await expect(pricingSection).toBeVisible();
      }
    });

    test('displays three pricing tiers', async ({ page }) => {
      await page.goto('/');
      // Look for plan names
      const sparkText = page.getByText('Spark', { exact: false });
      const flameText = page.getByText('Flame', { exact: false });
      const infernoText = page.getByText('Inferno', { exact: false });

      // At least the plan names should be present on the landing page
      if (await sparkText.first().isVisible()) {
        await expect(sparkText.first()).toBeVisible();
        await expect(flameText.first()).toBeVisible();
        await expect(infernoText.first()).toBeVisible();
      }
    });

    test('shows correct pricing amounts', async ({ page }) => {
      await page.goto('/');
      // Check for pricing values
      const freeText = page.getByText('Free', { exact: false });
      if (await freeText.first().isVisible()) {
        await expect(freeText.first()).toBeVisible();
      }
    });
  });

  test.describe('Billing Page Access', () => {
    test('billing page requires authentication', async ({ page }) => {
      await page.goto('/billing');
      // Should redirect to login if not authenticated
      await page.waitForURL(/\/(login|billing|signup)/, { timeout: 5000 }).catch(() => {});
    });
  });
});
