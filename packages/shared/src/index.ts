// @qodeia/shared - SDK centralizado para QodeIA

// Tokens (Design System)
export * from './tokens/index';

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
} from './types/index';

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
} from './auth/index';
export {
  rolePermissions,
  isAuthError,
  isSessionExpired,
  getSessionTimeRemaining,
} from './auth/index';

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
} from './utils/index';

// Env
export {
  getEnv,
  env,
  type QodeIAEnv,
} from './env/index';

// Version
export const SDK_VERSION = '0.1.0';
export const SDK_NAME = '@qodeia/shared';
export const SDK_DESCRIPTION = 'QodeIA Shared packages - Auth, Design System, API Client, Hooks';
