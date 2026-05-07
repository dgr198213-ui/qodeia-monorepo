// Contratos de autenticación para QodeIA

import type { Profile, UserRole } from '../types/index.ts';

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
  session: AuthSession | null;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: 'bearer';
  provider_token: string | null;
  provider_refresh_token: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
}

export interface AuthError {
  code: string;
  message: string;
  status?: number;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthSignUpOptions {
  email: string;
  password: string;
  options?: {
    data?: Record<string, unknown>;
    emailRedirectTo?: string;
  };
}

export interface AuthSignInOptions {
  email: string;
  password: string;
  captchaToken?: string;
}

export interface AuthOAuthOptions {
  provider: 'github' | 'google' | 'gitlab' | 'bitbucket';
  redirectTo?: string;
  scopes?: string;
}

export interface AuthMFAOptions {
  ticket: string;
}

export interface AuthPasswordResetOptions {
  email: string;
  redirectTo?: string;
}

export interface AuthUpdateOptions {
  email?: string;
  password?: string;
  data?: Record<string, unknown>;
}

export interface AuthListener {
  (event: AuthEvent, session: AuthSession | null): void;
}

export type AuthEvent =
  | 'INITIAL_SESSION'
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'MFA_CHALLENGE_VERIFIED';

export interface Permission {
  action: string;
  resource: string;
  condition?: Record<string, unknown>;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

export const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    { action: 'create', resource: 'agent' },
    { action: 'read', resource: 'agent' },
    { action: 'update', resource: 'agent' },
    { action: 'delete', resource: 'agent' },
    { action: 'create', resource: 'conversation' },
    { action: 'read', resource: 'conversation' },
    { action: 'update', resource: 'conversation' },
    { action: 'delete', resource: 'conversation' },
    { action: 'create', resource: 'api_key' },
    { action: 'read', resource: 'api_key' },
    { action: 'delete', resource: 'api_key' },
    { action: 'manage', resource: 'users' },
    { action: 'manage', resource: 'settings' },
  ],
  user: [
    { action: 'create', resource: 'agent' },
    { action: 'read', resource: 'agent' },
    { action: 'update', resource: 'agent', condition: { owner: '${user_id}' } },
    { action: 'delete', resource: 'agent', condition: { owner: '${user_id}' } },
    { action: 'create', resource: 'conversation' },
    { action: 'read', resource: 'conversation', condition: { owner: '${user_id}' } },
    { action: 'update', resource: 'conversation', condition: { owner: '${user_id}' } },
    { action: 'delete', resource: 'conversation', condition: { owner: '${user_id}' } },
    { action: 'create', resource: 'api_key' },
    { action: 'read', resource: 'api_key', condition: { owner: '${user_id}' } },
    { action: 'delete', resource: 'api_key', condition: { owner: '${user_id}' } },
  ],
  guest: [
    { action: 'read', resource: 'agent' },
    { action: 'create', resource: 'conversation' },
    { action: 'read', resource: 'conversation' },
  ],
};

export interface AuthContextValue extends AuthState {
  signIn: (options: AuthSignInOptions) => Promise<AuthUser | null>;
  signUp: (options: AuthSignUpOptions) => Promise<AuthUser | null>;
  signOut: () => Promise<void>;
  signInWithOAuth: (options: AuthOAuthOptions) => Promise<AuthUser | null>;
  signInWithMFA: (options: AuthMFAOptions) => Promise<AuthUser | null>;
  resetPassword: (options: AuthPasswordResetOptions) => Promise<void>;
  updateUser: (options: AuthUpdateOptions) => Promise<AuthUser | null>;
  refreshSession: () => Promise<AuthSession | null>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
}

export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

export function isSessionExpired(session: AuthSession | null): boolean {
  if (!session) return true;
  return Date.now() >= session.expires_at * 1000;
}

export function getSessionTimeRemaining(session: AuthSession): number {
  const remaining = session.expires_at * 1000 - Date.now();
  return Math.max(0, remaining);
}