import { createClient } from '@supabase/supabase-js';

// 1. Cliente de Supabase del Agente (Operativo)
const agentUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const agentKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

export const supabase = createClient(agentUrl, agentKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 2. Cliente de Supabase de Howard OS (Base de Conocimiento)
// Si no se configuran, por defecto usa las del agente
const howardUrl = process.env.HOWARD_OS_SUPABASE_URL || agentUrl;
const howardKey = process.env.HOWARD_OS_SUPABASE_KEY || agentKey;

export const howardSupabase = createClient(howardUrl, howardKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Helper para obtener el cliente correcto según el contexto
 */
export function getSupabaseClient(context: 'agent' | 'howard' = 'agent') {
  return context === 'howard' ? howardSupabase : supabase;
}
