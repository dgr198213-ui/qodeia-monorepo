import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Cliente para la Base de Datos Operativa (Agente QodeIA)
 * Gestiona: Sesiones de usuario, Proyectos, Estado del Agente.
 * Utiliza @supabase/ssr para integrarse con Next.js en el cliente.
 */
export const getOperativeSupabase = () => createBrowserClient(
  // Fallback a placeholder (mismo patrón que knowledgeSupabase y supabase):
  // sin él, el prerender de `next build` lanza excepción cuando las env vars
  // no están definidas (p. ej. en CI) y rompe el build de /admin/mcp.
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

/**
 * Cliente para la Base de Datos de Conocimiento (Howard OS)
 * Gestiona: Base de conocimientos, Contexto de arquitectura.
 * Conexión directa para consultas de lectura/referencia.
 */
export const knowledgeSupabase = createClient(
  process.env.NEXT_PUBLIC_KNOWLEDGE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_KNOWLEDGE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

/**
 * Cliente por defecto (Operativo)
 */
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);
