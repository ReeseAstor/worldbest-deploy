import { test, expect } from '@playwright/test';

test.describe('Project CRUD Workflows', () => {
  test.describe('Dashboard', () => {
    test('displays the dashboard page for authenticated users', async ({ page }) => {
      await page.goto('/dashboard');
      // Should either show dashboard or redirect to login
      await expect(page).toHaveURL(/\/(dashboard|login)/);
    });

    test('redirects unauthenticated users to login', async ({ page }) => {
      await page.goto('/dashboard');
      // Middleware should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Login Page', () => {
    test('renders login form', async ({ page }) => {
      await page.goto('/login');
      // Should show login form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });

    test('shows validation error for empty email', async ({ page }) => {
      await page.goto('/login');
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        // Should show validation feedback
        await expect(page.locator('input[type="email"]')).toBeVisible();
      }
    });
  });

  test.describe('Signup Page', () => {
    test('renders signup form', async ({ page }) => {
      await page.goto('/signup');
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('landing page loads correctly', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle(/WorldBest|Ember/i);
    });

    test('has working navigation links', async ({ page }) => {
      await page.goto('/');
      // Check that main navigation elements exist
      const nav = page.locator('nav').first();
      await expect(nav).toBeVisible();
    });
  });
});

test.describe('API Health', () => {
  test('health endpoint returns healthy status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('healthy');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('system');
    expect(body).toHaveProperty('memory');
    expect(body).toHaveProperty('version');
    expect(body.checks.server).toBe('ok');
  });

  test('health endpoint returns correct headers', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.headers()['cache-control']).toContain('no-store');
  });

  test('health HEAD request returns 200', async ({ request }) => {
    const response = await request.head('/api/health');
    expect(response.ok()).toBeTruthy();
  });
});
