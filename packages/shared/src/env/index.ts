// Schema de entorno para QodeIA

import { z } from 'zod';

export const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_DB_PASSWORD: z.string().optional(),
  SUPABASE_PROJECT_REF: z.string().optional(),

  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default('QodeIA'),

  AUTH_GITHUB_CLIENT_ID: z.string().optional(),
  AUTH_GITHUB_CLIENT_SECRET: z.string().optional(),
  AUTH_GOOGLE_CLIENT_ID: z.string().optional(),
  AUTH_GOOGLE_CLIENT_SECRET: z.string().optional(),

  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  ENABLE_MCP_SERVER: z.string().transform((v) => v === 'true').default('false'),
  ENABLE_ANALYTICS: z.string().transform((v) => v === 'true').default('false'),
  ENABLE_EXPERIMENTAL_FEATURES: z.string().transform((v) => v === 'true').default('false'),

  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000'),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type EnvSchema = z.infer<typeof envSchema>;

export function validateEnv(env: Record<string, unknown>): EnvSchema {
  const result = envSchema.safeParse(env);

  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    throw new Error(`Invalid environment variables:\n${errors.join('\n')}`);
  }

  return result.data;
}

export function getEnv<K extends keyof EnvSchema>(key: K): EnvSchema[K] {
  const value = process.env[key];
  const schema = envSchema.shape[key];

  if (schema instanceof z.ZodDefault) {
    return (value as EnvSchema[K]) ?? (schema._def.defaultValue as EnvSchema[K]);
  }

  if (!value && !schema.isOptional()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value as EnvSchema[K];
}

export function isServerSide(): boolean {
  return typeof window === 'undefined';
}

export function getPublicEnv(): Partial<EnvSchema> {
  if (isServerSide()) return {};

  return {
    NODE_ENV: process.env.NODE_ENV as EnvSchema['NODE_ENV'],
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    ENABLE_MCP_SERVER: process.env.ENABLE_MCP_SERVER === 'true',
    ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
    ENABLE_EXPERIMENTAL_FEATURES: process.env.ENABLE_EXPERIMENTAL_FEATURES === 'true',
  };
}

export const envExample = `# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=QodeIA

# Auth
AUTH_GITHUB_CLIENT_ID=your-github-client-id
AUTH_GITHUB_CLIENT_SECRET=your-github-client-secret

# API Keys
OPENAI_API_KEY=your-openai-key

# Feature Flags
ENABLE_MCP_SERVER=false
ENABLE_ANALYTICS=false

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Logging
LOG_LEVEL=info`;