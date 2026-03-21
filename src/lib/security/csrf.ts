import { cookies } from 'next/headers';

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

// Simple base64url-safe random token generator
function generateRandomBytes(length: number): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

// Create HMAC signature for token validation
async function createSignature(token: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(token)
  );
  
  return Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

// Verify HMAC signature
async function verifySignature(
  token: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSignature = await createSignature(token, secret);
  
  // Constant-time comparison
  if (signature.length !== expectedSignature.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Generate a CSRF token and store it in a cookie
 * Returns the token to be included in forms/headers
 */
export async function generateCsrfToken(): Promise<string> {
  const secret = process.env.CSRF_SECRET;
  
  if (!secret) {
    console.warn('[CSRF] CSRF_SECRET not configured. CSRF protection disabled.');
    return '';
  }
  
  const token = generateRandomBytes(CSRF_TOKEN_LENGTH);
  const signature = await createSignature(token, secret);
  const signedToken = `${token}.${signature}`;
  
  // Store in HTTP-only cookie
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, signedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
  
  return signedToken;
}

/**
 * Validate a CSRF token from request header against the stored cookie
 */
export async function validateCsrfToken(headerToken: string | null): Promise<boolean> {
  const secret = process.env.CSRF_SECRET;
  
  if (!secret) {
    // If CSRF secret not configured, skip validation (dev mode)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[CSRF] CSRF_SECRET not configured. Skipping validation.');
    }
    return true;
  }
  
  if (!headerToken) {
    return false;
  }
  
  // Get stored token from cookie
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  
  if (!cookieToken) {
    return false;
  }
  
  // Parse tokens
  const [headerRaw, headerSig] = headerToken.split('.');
  const [cookieRaw, cookieSig] = cookieToken.split('.');
  
  if (!headerRaw || !headerSig || !cookieRaw || !cookieSig) {
    return false;
  }
  
  // Tokens must match
  if (headerRaw !== cookieRaw) {
    return false;
  }
  
  // Verify signature
  const isValid = await verifySignature(headerRaw, headerSig, secret);
  
  return isValid;
}

/**
 * Get CSRF token from cookies (for client-side use)
 */
export async function getCsrfToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value ?? null;
}

/**
 * CSRF header name for client to include in requests
 */
export { CSRF_HEADER_NAME, CSRF_COOKIE_NAME };
