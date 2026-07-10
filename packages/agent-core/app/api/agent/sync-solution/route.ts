import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, serviceClient } from '@/lib/auth';

/**
 * POST /api/agent/sync-solution
 *
 * Recibe una solución validada en el IDE (mcpService.syncSolution) y la
 * incorpora a la base de conocimiento operativa (`agent_solutions`) para que
 * el agente pueda reutilizarla (EnhancedContextMemory.findSolution).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const solution = await request.json().catch(() => null);
    if (!solution || !solution.error_signature) {
      return NextResponse.json(
        { error: 'Solución inválida: se requiere error_signature' },
        { status: 400 }
      );
    }

    const { error } = await serviceClient.from('agent_solutions').upsert(
      {
        ...solution,
        user_id: solution.user_id ?? user.id,
        synced_at: new Date().toISOString(),
      },
      { onConflict: 'error_signature' }
    );

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, syncedAt: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
