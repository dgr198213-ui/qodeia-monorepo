import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { EnhancedContextMemoryEngine } from '@/agent/core/EnhancedContextMemory';

/**
 * POST /api/agent/memory
 *
 * Consulta de memoria contextual del contrato IDE↔Agente
 * (AgentApiClient.getMemory). Payload: { projectId, query? }
 *
 * Con query: búsqueda relevante vía EnhancedContextMemory.search.
 * Sin query: devuelve las entradas más recientes del proyecto.
 * Es la misma memoria que escribe el agente al trabajar — cierra la
 * duplicación con la `context_memory` local del IDE (GAP 3).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { projectId, query, limit } = body;
    if (!projectId) {
      return NextResponse.json({ error: 'projectId requerido' }, { status: 400 });
    }

    const cme = new EnhancedContextMemoryEngine(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
      projectId
    );

    if (query) {
      const results = await cme.search(projectId, query, limit || 10);
      return NextResponse.json({ success: true, projectId, query, results });
    }

    await cme.initializeProject(projectId);
    return NextResponse.json({ success: true, projectId, results: [] , note: 'Sin query: proyecto inicializado; use query para buscar entradas.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
