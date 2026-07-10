/**
 * Autenticación única hacia el Agente (Fase 3A · GAP 2).
 *
 * Todos los módulos del IDE que llaman al Agente deben construir sus
 * cabeceras con getAgentHeaders(): añade el JWT de la sesión Supabase
 * actual, que el Agente verifica en todas sus rutas del contrato.
 * Sin este header, el Agente responde 401.
 */
import { supabase } from '../lib/supabase';

export const AGENT_BASE_URL =
  import.meta.env.VITE_AGENT_URL || 'https://qodeia-monorepo-agent-core.vercel.app';

export async function getAgentToken() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch {
    return null;
  }
}

export async function getAgentHeaders(extra = {}) {
  const token = await getAgentToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}
