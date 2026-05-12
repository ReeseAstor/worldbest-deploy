import { test, expect } from '@playwright/test'

test.describe('Auth Flow', () => {
  test('signup page loads', async ({ page }) => {
    await page.goto('/signup')
    
    // Check that signup page elements are present
    await expect(page.getByRole('heading', { name: /sign up|create account|get started/i })).toBeVisible()
  })

  test('login page loads', async ({ page }) => {
    await page.goto('/login')
    
    // Check that login page elements are present
    await expect(page.getByRole('heading', { name: /sign in|log in|welcome back/i })).toBeVisible()
  })

  test('can navigate between signup and login', async ({ page }) => {
    // Start on signup page
    await page.goto('/signup')
    
    // Look for link to login
    const loginLink = page.getByRole('link', { name: /sign in|log in|already have an account/i })
    await expect(loginLink).toBeVisible()
    await loginLink.click()
    
    // Should be on login page
    await expect(page).toHaveURL(/\/login/)
    
    // Look for link to signup
    const signupLink = page.getByRole('link', { name: /sign up|create account|don't have an account/i })
    await expect(signupLink).toBeVisible()
    await signupLink.click()
    
    // Should be back on signup page
    await expect(page).toHaveURL(/\/signup/)
  })

  test('login form validation shows errors for invalid input', async ({ page }) => {
    await page.goto('/login')
    
    // Find email and password inputs
    const emailInput = page.getByLabel(/email/i)
    const passwordInput = page.getByLabel(/password/i)
    const submitButton = page.getByRole('button', { name: /sign in|log in|submit/i })
    
    // Try to submit with invalid email
    await emailInput.fill('invalid-email')
    await passwordInput.fill('short')
    await submitButton.click()
    
    // Should show validation error
    await expect(page.getByText(/valid email|invalid email/i)).toBeVisible()
  })

  test('signup form validation shows errors for invalid input', async ({ page }) => {
    await page.goto('/signup')
    
    // Find email and password inputs
    const emailInput = page.getByLabel(/email/i)
    const passwordInput = page.getByLabel(/password/i)
    const submitButton = page.getByRole('button', { name: /sign up|create account|submit|get started/i })
    
    // Try to submit with short password
    await emailInput.fill('test@example.com')
    await passwordInput.fill('123')
    await submitButton.click()
    
    // Should show validation error about password requirements
    await expect(page.getByText(/password|characters|minimum/i)).toBeVisible()
  })

  test('signup page has social login options', async ({ page }) => {
    await page.goto('/signup')
    
    // Check for Google sign-in button
    const googleButton = page.getByRole('button', { name: /google|continue with google/i })
    await expect(googleButton).toBeVisible()
  })

  test('login page has forgot password link', async ({ page }) => {
    await page.goto('/login')
    
    // Check for forgot password link
    const forgotPasswordLink = page.getByRole('link', { name: /forgot password|reset password/i })
    await expect(forgotPasswordLink).toBeVisible()
  })
})
