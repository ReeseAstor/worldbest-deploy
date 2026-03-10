<<<<<<< Local
// Core exports - using selective exports to avoid conflicts
export * from './ai';
export * from './api';
export type { User, UserPreferences } from './auth';
export * from './billing';
// entities has conflicts with ai.ts (AIGenerationParams, AIPersona), export selectively
export {
  // Base
  type BaseEntity,
  // Project
  type Project,
  type ProjectSettings,
  type AIPreferences,
  type RomantasySubgenre,
  type SeriesInfo,
  type ProjectCollaborator,
  // Book
  type Book,
  type Chapter,
  type Scene,
  // Character
  type Character,
  type RomanceRole,
  type SpeechPatterns,
  type RomanceAttributes,
  type AppearanceDetails,
  // World
  type TimelineEvent,
  type Era,
  // Content
  type Placeholder,
  type BibleReference,
  type TextVersion,
  // Style
  type StyleProfile,
  type ToneSettings,
  type PacingSettings,
  type VocabularyPreferences,
  // Enums from entities
  ContentRating,
  BookStatus,
  ChapterStatus,
  ProjectRole,
  RelationshipType,
  PlaceholderType,
  PlaceholderIntensity,
  RenderingMode,
  EconomyType,
} from './entities';
export * from './enums';

// Ember-specific exports
export * from './steam';
export * from './voice';
export * from './beat-sheets';
=======
// Core exports – entities is the canonical source for domain types.
export * from './entities';

// Billing has the canonical SubscriptionPlan enum (STARTER/PRO/STUDIO/ENTERPRISE).
export * from './billing';

// AI – skip AIPersona and AIGenerationParams (already in entities).
export {
  type AIGenerationRequest,
  type ContextReference,
  ContextType,
  AIIntent,
  // AIPersona – already exported from entities
  // AIGenerationParams – already exported from entities
  type SafetyOverrides,
  type AIGenerationResponse,
  type AIResponseMetadata,
  type AISuggestion,
  type AIUsageMetrics,
  type SafetyFlag,
  SafetyFlagType,
  type PromptTemplate,
  type PromptVariable,
  type PromptExample,
  type ModelConfig,
  AIProvider,
  type ModelCapabilities,
  type ModelPricing,
  type BulkDiscountTier,
  type ModelLimits,
  type AIBatchRequest,
  BatchStatus,
  type BatchError,
  type FineTuneJob,
  type HyperParameters,
  type TrainingMetrics,
  FineTuneStatus,
  type VectorEmbedding,
  type SemanticSearchRequest,
  type SemanticSearchResult,
  type AICache,
  SlashCommand,
  SLASH_COMMAND_LABELS,
  SLASH_COMMAND_DESCRIPTIONS,
} from './ai';

// API – skip EmailNotificationSettings (already in auth).
export {
  type ApiResponse,
  type ApiError,
  type ResponseMetadata,
  type PaginationParams,
  type FilterParams,
  type BulkOperationRequest,
  type BulkOperation,
  type BulkOperationResponse,
  type BulkOperationResult,
  type WebSocketMessage,
  WebSocketMessageType,
  type CollaborationUpdate,
  type PresenceUpdate,
  type ExportRequest as ApiExportRequest,
  ExportFormat,
  type ExportOptions,
  type FormatSpecificOptions,
  type ExportJob as ApiExportJob,
  ExportStatus,
  type ImportRequest,
  ImportFormat,
  type ImportOptions,
  type ImportJob,
  type ImportStatistics,
  ImportStatus,
  type AnalyticsQuery,
  type AnalyticsResponse,
  type AnalyticsDataPoint,
  type NotificationPreferences,
  // EmailNotificationSettings – skip, already exported from auth
  type InAppNotificationSettings,
  type PushNotificationSettings,
  type PushDevice,
  type Notification,
  NotificationType,
} from './api';

// Auth – skip SubscriptionPlan (canonical in billing) and
// EmailNotificationSettings (keep auth version as canonical).
export {
  type User as AuthUser,
  type UserPreferences,
  type EmailNotificationSettings,
  type EditorSettings,
  type UserAISettings,
  type UserMetadata,
  type Achievement,
  AchievementCategory,
  UserRole,
  // SubscriptionPlan – canonical version in billing
  type Session as AuthSession,
  type ApiKey,
  type Permission,
  type Role,
  type TeamMember,
  TeamRole,
  TeamMemberStatus,
  type Team,
  type TeamSettings,
  type AuditLog,
  type LoginRequest,
  type SignupRequest,
  type AuthResponse,
  type PasswordResetRequest,
  type PasswordResetConfirm,
  type EmailVerificationRequest,
  type TwoFactorSetupResponse,
  type OAuth2Provider,
  type SSOConfig,
} from './auth';

// Enums – skip Currency (already in entities as an interface).
export {
  Environment,
  LogLevel,
  CacheStrategy,
  QueuePriority,
  JobStatus,
  FileType,
  ImageFormat,
  DocumentFormat,
  AudioFormat,
  Locale,
  // Currency – skip, entities exports Currency interface
  TimeZone,
  SortOrder,
  Visibility,
  SharePermission,
  CommentStatus,
  ReactionType,
  ModerationStatus,
  ModerationReason,
  ErrorCode,
  FeatureFlag,
  MetricType,
  HealthStatus,
} from './enums';

>>>>>>> Remote