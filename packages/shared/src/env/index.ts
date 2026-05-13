/**
 * QodeIA Shared Environment Utilities
 */

export interface QodeIAEnv {
  NODE_ENV: 'development' | 'test' | 'production';
  NEXT_PUBLIC_APP_NAME: string;
  NEXT_PUBLIC_APP_VERSION: string;
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  ENABLE_MCP_SERVER: boolean;
  ENABLE_ANALYTICS: boolean;
  ENABLE_EXPERIMENTAL_FEATURES: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  API_URL: string;
  GITHUB_TOKEN?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
}

const isBrowser = typeof window !== 'undefined';

export const getEnv = <K extends keyof QodeIAEnv>(key: K, defaultValue?: QodeIAEnv[K]): QodeIAEnv[K] => {
  // @ts-ignore
  const value = isBrowser ? (window as any)._env_?.[key] : process.env[key];
  return (value || defaultValue) as QodeIAEnv[K];
};

export const env: QodeIAEnv = {
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  NEXT_PUBLIC_APP_NAME: getEnv('NEXT_PUBLIC_APP_NAME', 'QodeIA'),
  NEXT_PUBLIC_APP_VERSION: getEnv('NEXT_PUBLIC_APP_VERSION', '0.1.0'),
  NEXT_PUBLIC_SUPABASE_URL: getEnv('NEXT_PUBLIC_SUPABASE_URL', ''),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', ''),
  ENABLE_MCP_SERVER: getEnv('ENABLE_MCP_SERVER' as any) === 'true',
  ENABLE_ANALYTICS: getEnv('ENABLE_ANALYTICS' as any) === 'true',
  ENABLE_EXPERIMENTAL_FEATURES: getEnv('ENABLE_EXPERIMENTAL_FEATURES' as any) === 'true',
  LOG_LEVEL: getEnv('LOG_LEVEL', 'info'),
  API_URL: getEnv('API_URL', 'http://localhost:3001'),
  GITHUB_TOKEN: getEnv('GITHUB_TOKEN'),
  OPENAI_API_KEY: getEnv('OPENAI_API_KEY'),
  ANTHROPIC_API_KEY: getEnv('ANTHROPIC_API_KEY'),
};
