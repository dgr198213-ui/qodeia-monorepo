import { createClient } from '@supabase/supabase-js';

// Base de datos de Conocimiento (Howard OS)
const knowledgeUrl = import.meta.env.VITE_SUPABASE_URL;
const knowledgeKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Base de datos Operativa (Agente QodeIA)
const operationalUrl = import.meta.env.VITE_OPERATIONAL_SUPABASE_URL;
const operationalKey = import.meta.env.VITE_OPERATIONAL_SUPABASE_ANON_KEY;

if (!knowledgeUrl || !knowledgeKey) {
  console.warn('⚠️ Supabase Knowledge URL o Anon Key no encontradas. La persistencia estará desactivada.');
}

// Cliente Principal (Howard OS - Knowledge)
export const supabase = (knowledgeUrl && knowledgeKey)
  ? createClient(knowledgeUrl, knowledgeKey)
  : {
      from: () => ({
        select: () => ({ order: () => Promise.resolve({ data: [], error: { message: 'Supabase no configurado' } }) }),
        insert: () => Promise.resolve({ data: [], error: { message: 'Supabase no configurado' } }),
        update: () => Promise.resolve({ data: [], error: { message: 'Supabase no configurado' } }),
        delete: () => Promise.resolve({ data: [], error: { message: 'Supabase no configurado' } }),
        upsert: () => Promise.resolve({ data: [], error: { message: 'Supabase no configurado' } }),
        eq: () => ({
          eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } }) }),
          select: () => ({ single: () => Promise.resolve({ data: null, error: { message: 'Supabase no configurado' } }) })
        })
      }),
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: () => Promise.resolve({ data: {}, error: { message: 'Supabase no configurado' } }),
        signInWithOAuth: () => Promise.resolve({ data: {}, error: { message: 'Supabase no configurado' } }),
        signUp: () => Promise.resolve({ data: {}, error: { message: 'Supabase no configurado' } }),
        signOut: () => Promise.resolve({ error: null })
      }
    };

// Cliente Operativo (Agente - Operational)
export const agentSupabase = (operationalUrl && operationalKey)
  ? createClient(operationalUrl, operationalKey)
  : supabase; // Fallback al principal

export default supabase;
