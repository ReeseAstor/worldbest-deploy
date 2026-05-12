import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('landing page loads successfully', async ({ page }) => {
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/Ember/i)
  })

  test('navigation links are visible', async ({ page }) => {
    // Check for main navigation elements
    await expect(page.getByRole('link', { name: /features/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /pricing/i })).toBeVisible()
  })

  test('hero section displays correctly', async ({ page }) => {
    // Check hero headline
    await expect(page.getByText(/Finish Your Novel/i)).toBeVisible()
    await expect(page.getByText(/3x Faster/i)).toBeVisible()
    
    // Check CTA buttons
    await expect(page.getByRole('button', { name: /Start Writing Free/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Watch Demo/i })).toBeVisible()
    
    // Check social proof
    await expect(page.getByText(/10,000\+ writers/i)).toBeVisible()
  })

  test('can scroll to pricing section', async ({ page }) => {
    // Click on pricing link
    await page.getByRole('link', { name: /pricing/i }).click()
    
    // Wait for scroll and check pricing section is visible
    await expect(page.locator('#pricing')).toBeInViewport()
    await expect(page.getByText(/Simple, Transparent Pricing/i)).toBeVisible()
  })

  test('pricing section shows all tiers', async ({ page }) => {
    // Scroll to pricing section
    await page.locator('#pricing').scrollIntoViewIfNeeded()
    
    // Check all pricing tiers are visible
    await expect(page.getByText('Spark')).toBeVisible()
    await expect(page.getByText('Flame')).toBeVisible()
    await expect(page.getByText('Inferno')).toBeVisible()
  })

  test('FAQ accordion works', async ({ page }) => {
    // Scroll to FAQ section
    await page.locator('#faq').scrollIntoViewIfNeeded()
    
    // Check FAQ title is visible
    await expect(page.getByText(/Frequently Asked Questions/i)).toBeVisible()
    
    // Click on first FAQ question
    const firstQuestion = page.getByText(/How does the AI writing assistant work/i)
    await firstQuestion.click()
    
    // Check that the answer is now visible
    await expect(page.getByText(/Ember uses three specialized AI personas/i)).toBeVisible()
  })

  test('features section displays all features', async ({ page }) => {
    // Scroll to features area
    await page.getByText(/Everything You Need to Write Your Bestseller/i).scrollIntoViewIfNeeded()
    
    // Check feature cards
    await expect(page.getByText('AI Writing Assistant')).toBeVisible()
    await expect(page.getByText('Story Bible Management')).toBeVisible()
    await expect(page.getByText('Character Development')).toBeVisible()
  })
})
