// @qodeia/shared - SDK centralizado para QodeIA

// Tokens (Design System)
export * from './tokens/index.ts';

// Types (Supabase)
export type {
  Database,
  Profile,
  ProfileInsert,
  ProfileUpdate,
  Agent,
  AgentInsert,
  AgentUpdate,
  Conversation,
  ConversationInsert,
  ConversationUpdate,
  Message,
  MessageInsert,
  MessageUpdate,
  ApiKey,
  ApiKeyInsert,
  ApiKeyUpdate,
  UserRole,
  AgentStatus,
  MessageRole,
} from './types/index.ts';

// Auth (Contratos)
export type {
  AuthUser,
  AuthSession,
  AuthState,
  AuthError,
  AuthCredentials,
  AuthSignUpOptions,
  AuthSignInOptions,
  AuthOAuthOptions,
  AuthMFAOptions,
  AuthPasswordResetOptions,
  AuthUpdateOptions,
  AuthListener,
  AuthEvent,
  Permission,
  RolePermissions,
  AuthContextValue,
} from './auth/index.ts';
export {
  rolePermissions,
  isAuthError,
  isSessionExpired,
  getSessionTimeRemaining,
} from './auth/index.ts';

// Utils
export {
  cn,
  formatDate,
  formatRelativeTime,
  truncate,
  generateId,
  debounce,
  throttle,
  deepMerge,
  isEmpty,
  sleep,
  retry,
  safeJsonParse,
  capitalize,
  slugify,
  parseEnvVar,
} from './utils/index.ts';

// Env (Schema)
export {
  envSchema,
  validateEnv,
  getEnv,
  isServerSide,
  getPublicEnv,
  envExample,
  type EnvSchema,
} from './env/index.ts';

// Version
export const SDK_VERSION = '0.1.0';
export const SDK_NAME = '@qodeia/shared';
export const SDK_DESCRIPTION = 'QodeIA Shared packages - Auth, Design System, API Client, Hooks';