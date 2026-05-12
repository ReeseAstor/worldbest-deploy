import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/onboarding', '/settings'];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ['/login', '/signup'];

// Routes that bypass CSRF validation (have their own signature verification)
const CSRF_BYPASS_ROUTES = [
  '/api/webhooks/stripe',
  '/api/cron',
];

// Security headers to add to all responses
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// Get client IP for rate limiting
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

// Add security headers to response
function addSecurityHeaders(response: NextResponse): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session
  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const method = request.method;

  // Add security headers to all responses
  addSecurityHeaders(supabaseResponse);

  // Redirect unauthenticated users trying to access protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const redirectResponse = NextResponse.redirect(url);
    addSecurityHeaders(redirectResponse);
    return redirectResponse;
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    const redirectResponse = NextResponse.redirect(url);
    addSecurityHeaders(redirectResponse);
    return redirectResponse;
  }

  // CSRF validation for API routes with state-changing methods
  const isApiRoute = pathname.startsWith('/api/');
  const isMutationMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  const shouldBypassCsrf = CSRF_BYPASS_ROUTES.some((route) => pathname.startsWith(route));

  if (isApiRoute && isMutationMethod && !shouldBypassCsrf && process.env.CSRF_SECRET) {
    const csrfToken = request.headers.get('x-csrf-token');
    const csrfCookie = request.cookies.get('csrf_token')?.value;

    // Simple token validation in middleware (compare header to cookie)
    // More robust validation happens in API routes if needed
    if (!csrfToken || !csrfCookie || csrfToken !== csrfCookie) {
      // Log for debugging but don't block in development
      if (process.env.NODE_ENV === 'production') {
        const errorResponse = NextResponse.json(
          { error: 'Invalid CSRF token' },
          { status: 403 }
        );
        addSecurityHeaders(errorResponse);
        return errorResponse;
      }
    }
  }

  // Add rate limit identifier to request headers for API routes
  if (isApiRoute) {
    const identifier = user?.id || getClientIP(request);
    supabaseResponse.headers.set('x-rate-limit-identifier', identifier);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
