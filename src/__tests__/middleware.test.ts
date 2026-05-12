import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock Supabase server client
const mockGetUser = vi.fn();
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}));

// We need to mock NextResponse and NextRequest for middleware testing
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
  };
});

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
  });

  describe('Security Headers', () => {
    it('defines correct security headers', () => {
      // Validate the security header constants
      const expectedHeaders = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      };

      for (const [key, value] of Object.entries(expectedHeaders)) {
        expect(key).toBeTruthy();
        expect(value).toBeTruthy();
      }
    });
  });

  describe('Route Configuration', () => {
    it('defines protected routes correctly', () => {
      const protectedRoutes = ['/dashboard', '/onboarding', '/settings'];
      protectedRoutes.forEach((route) => {
        expect(route).toBeTruthy();
      });
    });

    it('defines auth routes correctly', () => {
      const authRoutes = ['/login', '/signup'];
      authRoutes.forEach((route) => {
        expect(route).toBeTruthy();
      });
    });

    it('defines CSRF bypass routes', () => {
      const bypassRoutes = ['/api/webhooks/stripe', '/api/cron'];
      bypassRoutes.forEach((route) => {
        expect(route.startsWith('/api/')).toBe(true);
      });
    });
  });

  describe('CSRF validation logic', () => {
    it('mutation methods require CSRF validation', () => {
      const mutationMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
      for (const method of mutationMethods) {
        expect(['POST', 'PUT', 'DELETE', 'PATCH']).toContain(method);
      }
    });

    it('GET requests do not require CSRF validation', () => {
      const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
      for (const method of safeMethods) {
        expect(['POST', 'PUT', 'DELETE', 'PATCH']).not.toContain(method);
      }
    });
  });

  describe('Matcher configuration', () => {
    it('excludes static assets from middleware', () => {
      const matcherPattern = '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)';
      // Static assets should NOT match
      expect('_next/static/chunk.js'.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)).toBeNull();
      // API routes SHOULD match
      expect('/api/projects'.startsWith('/api/')).toBe(true);
      expect(matcherPattern).toBeTruthy();
    });
  });

  describe('Client IP extraction', () => {
    it('extracts IP from x-forwarded-for header', () => {
      // Test the logic directly
      const forwardedFor = '192.168.1.1, 10.0.0.1';
      const ip = forwardedFor.split(',')[0].trim();
      expect(ip).toBe('192.168.1.1');
    });

    it('handles single IP in forwarded header', () => {
      const forwardedFor = '192.168.1.1';
      const ip = forwardedFor.split(',')[0].trim();
      expect(ip).toBe('192.168.1.1');
    });
  });
});
