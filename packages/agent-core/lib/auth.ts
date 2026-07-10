import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Autenticación compartida de las rutas API del agente.
 *
 * Verifica el JWT de Supabase enviado como `Authorization: Bearer <token>`.
 * Devuelve el usuario o null. Todas las rutas del contrato IDE↔Agente
 * (chat, execute, memory, sync, sync-solution, mcp/sync) usan este helper
 * para que la identidad sea única en todo el ecosistema (ADR-2).
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
);

export async function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

/** Cliente service-role compartido para persistencia desde las rutas. */
export const serviceClient = supabase;
