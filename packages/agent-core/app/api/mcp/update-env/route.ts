import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/mcp/update-env
 *
 * Actualiza variables de entorno del proyecto en Vercel.
 *
 * SEGURIDAD: este endpoint modifica configuración de producción, por lo que
 * exige (1) un JWT de Supabase válido y (2) que el usuario tenga rol admin
 * en app_metadata. Sin ambas condiciones responde 401/403.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    // app_metadata solo es modificable server-side (nunca por el propio usuario),
    // por eso es el lugar correcto para el flag de admin.
    if (user.app_metadata?.role !== 'admin') return null;
    return user;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const user = await verifyAdmin(request);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const envVars = await request.json();

    if (!process.env.VERCEL_TOKEN || !process.env.VERCEL_PROJECT_ID) {
      return NextResponse.json(
        { error: 'VERCEL_TOKEN o PROJECT_ID no configurados' },
        { status: 500 }
      );
    }

    // Pendiente de implementación real contra la API de Vercel.
    // Hasta entonces, se devuelve 501 en lugar de un falso success para que
    // ningún cliente asuma que la operación se realizó.
    console.log(
      `[update-env] Solicitud de ${user.id} para actualizar:`,
      Object.keys(envVars)
    );

    return NextResponse.json(
      { error: 'No implementado todavía' },
      { status: 501 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
