/**
 * Analytics Event Definitions
 * 
 * All tracking event names and their associated property types.
 * Used across GA4 and optional Mixpanel integrations.
 */

// Event name constants
export const ANALYTICS_EVENTS = {
  // Landing Page
  LANDING_PAGE_VIEW: 'landing_page_view',
  HERO_CTA_CLICK: 'hero_cta_click',
  DEMO_VIDEO_PLAY: 'demo_video_play',
  PRICING_PLAN_SELECTED: 'pricing_plan_selected',
  FAQ_QUESTION_EXPANDED: 'faq_question_expanded',
  
  // Auth
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  LOGIN_COMPLETED: 'login_completed',
  SOCIAL_LOGIN_CLICK: 'social_login_click',
  
  // Onboarding
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  ONBOARDING_SKIPPED: 'onboarding_skipped',
  
  // Projects
  PROJECT_CREATED: 'project_created',
  CHAPTER_CREATED: 'chapter_created',
  WRITING_SESSION_START: 'writing_session_start',
  WORDS_WRITTEN: 'words_written',
  
  // Billing
  UPGRADE_CTA_CLICK: 'upgrade_cta_click',
  CHECKOUT_STARTED: 'checkout_started',
  SUBSCRIPTION_CREATED: 'subscription_created',
} as const;

// Type for event names
export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

// Event property types
export interface LandingPageViewProperties {
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface HeroCtaClickProperties {
  button_text: string;
  position?: 'primary' | 'secondary';
}

export interface DemoVideoPlayProperties {
  video_title?: string;
  video_duration?: number;
}

export interface PricingPlanSelectedProperties {
  plan_name: string;
  plan_price: number;
  billing_period: 'monthly' | 'annual';
}

export interface FaqQuestionExpandedProperties {
  question_index: number;
  question_text: string;
}

export interface SignupStartedProperties {
  method: 'email' | 'google' | 'magic_link';
}

export interface SignupCompletedProperties {
  method: 'email' | 'google' | 'magic_link';
  user_id?: string;
}

export interface LoginCompletedProperties {
  method: 'email' | 'google' | 'magic_link';
  user_id?: string;
}

export interface SocialLoginClickProperties {
  provider: 'google' | 'github' | 'twitter';
}

export interface OnboardingStepCompletedProperties {
  step_number: number;
  step_name: string;
  time_spent_seconds?: number;
}

export interface OnboardingCompletedProperties {
  total_time_seconds?: number;
  steps_completed: number;
}

export interface OnboardingSkippedProperties {
  last_completed_step: number;
  reason?: string;
}

export interface ProjectCreatedProperties {
  project_type?: string;
  genre?: string;
}

export interface ChapterCreatedProperties {
  project_id: string;
  chapter_number: number;
}

export interface WritingSessionStartProperties {
  project_id: string;
  chapter_id?: string;
}

export interface WordsWrittenProperties {
  project_id: string;
  chapter_id?: string;
  word_count: number;
  session_duration_minutes?: number;
}

export interface UpgradeCtaClickProperties {
  source: string;
  current_plan?: string;
}

export interface CheckoutStartedProperties {
  plan_name: string;
  plan_price: number;
  billing_period: 'monthly' | 'annual';
}

export interface SubscriptionCreatedProperties {
  plan_name: string;
  plan_price: number;
  billing_period: 'monthly' | 'annual';
  user_id?: string;
}

// Union type for all event properties
export type EventProperties = 
  | LandingPageViewProperties
  | HeroCtaClickProperties
  | DemoVideoPlayProperties
  | PricingPlanSelectedProperties
  | FaqQuestionExpandedProperties
  | SignupStartedProperties
  | SignupCompletedProperties
  | LoginCompletedProperties
  | SocialLoginClickProperties
  | OnboardingStepCompletedProperties
  | OnboardingCompletedProperties
  | OnboardingSkippedProperties
  | ProjectCreatedProperties
  | ChapterCreatedProperties
  | WritingSessionStartProperties
  | WordsWrittenProperties
  | UpgradeCtaClickProperties
  | CheckoutStartedProperties
  | SubscriptionCreatedProperties
  | Record<string, unknown>;

// Map event names to their property types for type safety
export interface EventPropertiesMap {
  [ANALYTICS_EVENTS.LANDING_PAGE_VIEW]: LandingPageViewProperties;
  [ANALYTICS_EVENTS.HERO_CTA_CLICK]: HeroCtaClickProperties;
  [ANALYTICS_EVENTS.DEMO_VIDEO_PLAY]: DemoVideoPlayProperties;
  [ANALYTICS_EVENTS.PRICING_PLAN_SELECTED]: PricingPlanSelectedProperties;
  [ANALYTICS_EVENTS.FAQ_QUESTION_EXPANDED]: FaqQuestionExpandedProperties;
  [ANALYTICS_EVENTS.SIGNUP_STARTED]: SignupStartedProperties;
  [ANALYTICS_EVENTS.SIGNUP_COMPLETED]: SignupCompletedProperties;
  [ANALYTICS_EVENTS.LOGIN_COMPLETED]: LoginCompletedProperties;
  [ANALYTICS_EVENTS.SOCIAL_LOGIN_CLICK]: SocialLoginClickProperties;
  [ANALYTICS_EVENTS.ONBOARDING_STEP_COMPLETED]: OnboardingStepCompletedProperties;
  [ANALYTICS_EVENTS.ONBOARDING_COMPLETED]: OnboardingCompletedProperties;
  [ANALYTICS_EVENTS.ONBOARDING_SKIPPED]: OnboardingSkippedProperties;
  [ANALYTICS_EVENTS.PROJECT_CREATED]: ProjectCreatedProperties;
  [ANALYTICS_EVENTS.CHAPTER_CREATED]: ChapterCreatedProperties;
  [ANALYTICS_EVENTS.WRITING_SESSION_START]: WritingSessionStartProperties;
  [ANALYTICS_EVENTS.WORDS_WRITTEN]: WordsWrittenProperties;
  [ANALYTICS_EVENTS.UPGRADE_CTA_CLICK]: UpgradeCtaClickProperties;
  [ANALYTICS_EVENTS.CHECKOUT_STARTED]: CheckoutStartedProperties;
  [ANALYTICS_EVENTS.SUBSCRIPTION_CREATED]: SubscriptionCreatedProperties;
}
