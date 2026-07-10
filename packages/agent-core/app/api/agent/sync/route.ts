import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, serviceClient } from '@/lib/auth';

/**
 * POST /api/agent/sync
 *
 * Sincronización de estado de proyecto del contrato IDE↔Agente
 * (AgentApiClient.syncProject). Payload:
 * { projectId, metadata?, stats?, fileIndex?: [{path, ...}] }
 *
 * Persiste un snapshot ligero (solo metadatos e índice de ficheros, nunca
 * contenido completo) en `agent_state`, que es la tabla de estado operativo
 * que el agente ya consulta.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { projectId, metadata, stats, fileIndex } = body;
    if (!projectId) {
      return NextResponse.json({ error: 'projectId requerido' }, { status: 400 });
    }

    const { error } = await serviceClient.from('agent_state').upsert(
      {
        // agent_state es un key/value store (key TEXT UNIQUE, value JSONB):
        // el snapshot de cada proyecto vive bajo una clave estable.
        key: `project_sync:${projectId}`,
        value: {
          projectId,
          userId: user.id,
          metadata: metadata ?? {},
          stats: stats ?? {},
          fileIndex: fileIndex ?? [],
          syncedAt: new Date().toISOString(),
          source: 'ide-sync',
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      projectId,
      files: Array.isArray(fileIndex) ? fileIndex.length : 0,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
