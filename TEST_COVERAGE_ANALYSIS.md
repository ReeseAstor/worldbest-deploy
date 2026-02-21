# Test Coverage Analysis

## Current State

**This codebase has zero test files.** There is no testing framework installed (no Jest, Vitest, React Testing Library, Cypress, or Playwright in `package.json`), no test configuration, and no test scripts. This means every area of the codebase is untested.

Below is a prioritized breakdown of where tests would provide the most value, ordered by risk and complexity.

---

## Priority 1 (Critical) -- API Client & Authentication

These modules handle security-sensitive token management, automatic retry logic, and error handling that directly impacts every authenticated user interaction.

### `src/lib/api.ts` -- Axios Instance with Token Refresh
- **What to test:**
  - Request interceptor attaches `Bearer` token from `localStorage`
  - 401 response triggers token refresh flow
  - Successful refresh retries the original request with new token
  - Failed refresh clears tokens and redirects to `/login`
  - Non-401 errors are passed through unmodified
  - Requests without a stored token omit the `Authorization` header
  - The `_retry` flag prevents infinite refresh loops

### `src/lib/api/client.ts` -- `ApiClient` Class
- **What to test:**
  - Cookie-based token extraction and header attachment
  - 401 handling, token refresh, cookie update, and request retry
  - Error transformation (the `apiError` object shape)
  - `upload()` method constructs `FormData`, sets correct content type, and reports progress
  - `setHeaders()` merges headers onto the client defaults
  - SSR safety: `typeof window` checks skip cookie/redirect logic on the server

### `src/lib/api/auth.ts` -- Auth API Functions
- **What to test:**
  - Each method (`login`, `signup`, `logout`, `refreshToken`, `me`, `forgotPassword`, `resetPassword`, `verifyEmail`, `changePassword`, `updateProfile`, `deleteAccount`, `enable2FA`, `verify2FA`, `disable2FA`) calls the correct endpoint with the correct payload
  - Return values are properly unwrapped from `response.data`

### `src/contexts/auth-context.tsx` -- Auth Context (localStorage variant)
- **What to test:**
  - `checkAuth` reads token from `localStorage`, calls `/auth/me`, and sets user
  - `checkAuth` clears tokens and sets `loading=false` when no token exists
  - `login` stores tokens, sets auth header, sets user, navigates to `/dashboard`
  - `signup` stores tokens, sets auth header, sets user, navigates to `/dashboard`
  - `logout` clears tokens, removes auth header, sets user to null, navigates to `/`
  - `refreshToken` updates stored tokens; falls back to `logout` on failure
  - Error cases show appropriate toast messages
  - `useAuth` throws when used outside `AuthProvider`

### `src/components/auth/auth-provider.tsx` -- Auth Provider (cookie variant)
- **What to test:**
  - Same flows as above, but with cookie-based token storage
  - Auto-refresh interval (15-minute timer) starts when user is present, clears on unmount
  - Cookie parsing logic correctly extracts `auth-token`

---

## Priority 2 (High) -- Form Validation & Business Logic

### `src/components/auth/auth-modal.tsx` -- Form Validation
- **What to test:**
  - `validateForm()` rejects empty email, invalid email format, empty password, password < 8 chars
  - In signup mode, validates displayName is required and >= 2 chars
  - `handleSubmit` calls `login` in login mode, `signup` in signup mode
  - Loading state disables inputs during submission
  - Mode switching between login/signup clears state appropriately

### `src/app/projects/page.tsx` -- Project Filtering & Sorting
- **What to test:**
  - `filteredProjects` correctly filters by search query (title + synopsis), genre, and status
  - Sorting works correctly for all 4 modes: `updated`, `created`, `title`, `progress`
  - `toggleStar` correctly toggles the starred flag on the right project
  - `getStatusColor` returns correct CSS classes for each status
  - Progress percentage calculation caps at 100%

### `src/app/projects/new/page.tsx` -- Multi-step Form
- **What to test:**
  - `canProceed()` validation per step: step 1 requires title+synopsis, step 2 requires genre, step 3 requires wordCount > 0
  - `handleGenreSelect` clears subgenres when genre changes
  - `handleSubgenreToggle` toggles subgenres in/out of the array
  - Step navigation (forward/backward) is constrained to 1-4
  - `handleSubmit` triggers form submission

### `src/app/characters/page.tsx` -- Character Filtering
- **What to test:**
  - Multi-dimensional filter (search, project, role, MBTI) correctly combines conditions
  - Search matches on name, description, and aliases
  - Project deduplication: `Array.from(new Set(...))`

---

## Priority 3 (Medium) -- Editor & Real-time Features

### `src/app/projects/[id]/write/page.tsx` -- Write Page
- **What to test:**
  - Word count calculation: strips HTML tags, splits on whitespace, filters empty strings
  - Auto-save debounce: fires after 5 seconds of inactivity, respects `autoSaveEnabled`
  - `handleTextSelection` captures selected text from `window.getSelection()`
  - Progress bar percentage calculation with 100% cap
  - Paragraph count calculation from `</p>` splits
  - Reading time estimation (`Math.ceil(wordCount / 200)`)

### `src/components/websocket/websocket-provider.tsx` -- WebSocket Management
- **What to test:**
  - Connects when user is present, disconnects when user is null
  - Exponential backoff reconnection: delay = `min(1000 * 2^attempts, 30000)`
  - Max 5 reconnect attempts
  - Server-initiated disconnect (`io server disconnect`) does not reconnect
  - `emit` is no-op when not connected
  - `on`/`off` properly delegate to the socket
  - `useWebSocket` throws when used outside provider
  - Auth token extraction from cookies for socket connection

### `src/app/dashboard/page.tsx` -- Dashboard
- **What to test:**
  - `getProgressPercentage` clamps to 100%
  - `formatDate` uses `Intl.RelativeTimeFormat` correctly

### `src/app/analytics/page.tsx` -- Analytics
- **What to test:**
  - Time range selector updates state
  - `StatCard` renders positive/negative change indicators correctly

---

## Priority 4 (Lower) -- Shared Types & UI Components

### `packages/shared-types/` -- Type Definitions
- While TypeScript types are checked at compile time, the enums in this package contain runtime values. Tests can verify:
  - Enum values match expected strings (regression guard against accidental changes)
  - Type exports are complete (no missing re-exports in `index.ts`)

### `packages/ui-components/` -- UI Component Library
- **What to test:**
  - `Button`, `Card`, `Skeleton`, `Toast`, `Toaster` render without crashing
  - `useToast` hook manages toast state correctly
  - `cn()` utility merges class names (from `src/lib/utils.ts` and `packages/ui-components/src/lib/utils.ts`)

### `src/app/settings/page.tsx` -- Settings Page
- **What to test:**
  - Tab switching (`activeTab` state)
  - `ToggleSwitch` component flips `aria-pressed` state
  - Profile form state updates
  - Notification toggles update the correct key
  - Avatar upload reads file and creates data URL preview

---

## Recommended Testing Stack

Given this is a **Next.js 14 + React 18 + TypeScript** project, the recommended setup is:

| Tool | Purpose |
|---|---|
| **Vitest** | Unit/integration test runner (faster than Jest, native ESM/TS) |
| **React Testing Library** | Component rendering and interaction tests |
| **MSW (Mock Service Worker)** | API mocking for auth flows and data fetching |
| **Playwright** or **Cypress** | End-to-end tests for critical user flows |

### Suggested `package.json` additions:
```json
{
  "devDependencies": {
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jsdom": "^25.0.0",
    "msw": "^2.0.0",
    "@playwright/test": "^1.49.0"
  },
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test"
  }
}
```

---

## Suggested Test File Structure

```
src/
  __tests__/
    lib/
      api.test.ts              # Axios interceptors and token refresh
      api-client.test.ts       # ApiClient class
      api-auth.test.ts         # Auth API function wrappers
      utils.test.ts            # cn() utility
    contexts/
      auth-context.test.tsx    # Auth context (localStorage variant)
    components/
      auth/
        auth-provider.test.tsx # Auth provider (cookie variant)
        auth-modal.test.tsx    # Form validation and submission
      websocket/
        websocket-provider.test.tsx
    app/
      projects/
        page.test.tsx          # Filtering and sorting
        new/page.test.tsx      # Multi-step form validation
      characters/
        page.test.tsx          # Character filtering
      dashboard/
        page.test.tsx          # Progress and date formatting
e2e/
  auth.spec.ts                 # Login/signup/logout flows
  project-creation.spec.ts     # Full project creation wizard
  editor.spec.ts               # Writing editor basic operations
```

---

## Summary Table

| Priority | Area | Risk Level | Complexity | Files |
|---|---|---|---|---|
| P1 | API client + token refresh | Critical | Medium | `api.ts`, `client.ts` |
| P1 | Auth context/provider | Critical | High | `auth-context.tsx`, `auth-provider.tsx` |
| P1 | Auth API layer | Critical | Low | `auth.ts` |
| P2 | Auth modal validation | High | Low | `auth-modal.tsx` |
| P2 | Project filtering/sorting | High | Medium | `projects/page.tsx` |
| P2 | Multi-step form validation | High | Medium | `projects/new/page.tsx` |
| P2 | Character filtering | High | Low | `characters/page.tsx` |
| P3 | Editor word count/auto-save | Medium | Medium | `write/page.tsx` |
| P3 | WebSocket reconnection | Medium | High | `websocket-provider.tsx` |
| P3 | Dashboard utilities | Medium | Low | `dashboard/page.tsx` |
| P4 | Shared types/enums | Low | Low | `packages/shared-types/` |
| P4 | UI components | Low | Low | `packages/ui-components/` |
| P4 | Settings page | Low | Low | `settings/page.tsx` |

The top recommendation is to start with **P1: API client and authentication tests**. These modules sit at the foundation of the entire app -- every authenticated feature depends on them working correctly, and their logic (token refresh, interceptors, error handling, redirect-on-failure) is exactly the kind of code that is easy to break silently during refactoring.
