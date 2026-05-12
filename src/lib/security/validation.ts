import { z } from 'zod';

// ============================================
// Auth Schemas
// ============================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
});

// ============================================
// Project Schemas
// ============================================

export const genreEnum = z.enum([
  'contemporary-romance',
  'paranormal-romance',
  'dark-romance',
  'romantic-suspense',
  'historical-romance',
  'romantasy',
  'reverse-harem',
  'why-choose',
  'romantic-comedy',
  'new-adult',
  'young-adult-romance',
  'erotic-romance',
  'lgbtq-romance',
  'sci-fi-romance',
  'western-romance',
  'sports-romance',
  'billionaire-romance',
  'mafia-romance',
  'rockstar-romance',
  'military-romance',
  'small-town-romance',
  'enemies-to-lovers',
  'friends-to-lovers',
  'second-chance',
  'fake-relationship',
  'other',
]);

export const projectSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  genre: genreEnum.optional(),
  targetWordCount: z
    .number()
    .min(1000, 'Target word count must be at least 1,000')
    .max(500000, 'Target word count cannot exceed 500,000')
    .optional(),
  description: z
    .string()
    .max(2000, 'Description cannot exceed 2,000 characters')
    .optional(),
});

// ============================================
// Chapter Schemas
// ============================================

export const chapterSchema = z.object({
  title: z
    .string()
    .min(1, 'Chapter title is required')
    .max(200, 'Chapter title cannot exceed 200 characters'),
  content: z
    .string()
    .max(500000, 'Chapter content cannot exceed 500,000 characters'),
  chapterNumber: z
    .number()
    .int('Chapter number must be a whole number')
    .min(1, 'Chapter number must be at least 1'),
});

// ============================================
// Profile Schemas
// ============================================

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name cannot exceed 50 characters'),
  bio: z
    .string()
    .max(500, 'Bio cannot exceed 500 characters')
    .optional(),
});

// ============================================
// Communication Preferences
// ============================================

export const communicationPreferencesSchema = z.object({
  productUpdates: z.boolean(),
  writingTips: z.boolean(),
  marketing: z.boolean(),
});

// ============================================
// Cookie Consent
// ============================================

export const cookieConsentSchema = z.object({
  necessary: z.literal(true), // Always required
  analytics: z.boolean(),
  marketing: z.boolean(),
  preferences: z.boolean(),
});

// ============================================
// Account Deletion
// ============================================

export const accountDeletionSchema = z.object({
  confirmation: z.literal('DELETE', {
    errorMap: () => ({ message: 'Please type DELETE to confirm' }),
  }),
});

// ============================================
// Type Exports
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ChapterInput = z.infer<typeof chapterSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type Genre = z.infer<typeof genreEnum>;
export type CommunicationPreferences = z.infer<typeof communicationPreferencesSchema>;
export type CookieConsent = z.infer<typeof cookieConsentSchema>;
export type AccountDeletionInput = z.infer<typeof accountDeletionSchema>;

// ============================================
// HTML Sanitization Helper
// ============================================

// List of allowed HTML tags (basic formatting only)
const ALLOWED_TAGS = ['b', 'i', 'u', 'em', 'strong', 'p', 'br', 'span'];

// Regex patterns for dangerous content
const SCRIPT_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const EVENT_HANDLER_PATTERN = /\s*on\w+\s*=\s*["'][^"']*["']/gi;
const JAVASCRIPT_URL_PATTERN = /javascript:/gi;
const DATA_URL_PATTERN = /data:/gi;
const STYLE_EXPRESSION_PATTERN = /expression\s*\(/gi;

/**
 * Sanitize HTML input to remove potentially dangerous content
 * Strips script tags, event handlers, and javascript: URLs
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Remove script tags and their content
  sanitized = sanitized.replace(SCRIPT_PATTERN, '');

  // Remove event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(EVENT_HANDLER_PATTERN, '');

  // Remove javascript: URLs
  sanitized = sanitized.replace(JAVASCRIPT_URL_PATTERN, '');

  // Remove data: URLs (can be used for XSS)
  sanitized = sanitized.replace(DATA_URL_PATTERN, '');

  // Remove CSS expressions
  sanitized = sanitized.replace(STYLE_EXPRESSION_PATTERN, '');

  // Remove any remaining HTML tags that aren't in the allowed list
  sanitized = sanitized.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag) => {
    return ALLOWED_TAGS.includes(tag.toLowerCase()) ? match : '';
  });

  return sanitized.trim();
}

/**
 * Strip all HTML tags from input
 * Use when you need plain text only
 */
export function stripHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}
