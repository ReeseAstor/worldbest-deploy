import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { expect } from 'vitest'

// Custom render function that wraps components with necessary providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add any providers/context options here
}

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  )
}

const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// Override render with custom render
export { customRender as render }

// Helper to create mock Supabase responses
export function createMockSupabaseResponse<T>(data: T | null, error: Error | null = null) {
  return {
    data,
    error,
    count: null,
    status: error ? 400 : 200,
    statusText: error ? 'Bad Request' : 'OK',
  }
}

// Helper to create mock Supabase session
export function createMockSession(userId: string = 'test-user-id') {
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer',
    user: {
      id: userId,
      email: 'test@example.com',
      email_confirmed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      role: 'authenticated',
    },
  }
}

// Helper to wait for element to be removed
export async function waitForElementToBeRemoved(
  callback: () => HTMLElement | null,
  options?: { timeout?: number }
) {
  const { waitFor } = await import('@testing-library/react')
  return waitFor(() => {
    expect(callback()).toBeNull()
  }, options)
}

// Type-safe mock function helper
export async function createMockFn<T extends (...args: unknown[]) => unknown>() {
  const { vi } = await import('vitest')
  return vi.fn<T>()
}
