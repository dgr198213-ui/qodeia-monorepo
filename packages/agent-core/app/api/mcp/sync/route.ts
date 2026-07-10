import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, serviceClient } from '@/lib/auth';

/**
 * POST /api/mcp/sync
 *
 * Ingesta de fuentes del contrato IDE↔Agente (mcpService.syncSource).
 * Payload: { server, file_path, content, metadata }
 *
 * Materializa la capa de conocimiento Howard OS (ADR-3): las fuentes se
 * guardan en `kb_sources` para su posterior indexado/embeddings. El
 * contenido se trunca a un tamaño razonable — la ingesta masiva de ficheros
 * grandes debe ir por lotes.
 */
const MAX_CONTENT_LENGTH = 100_000;

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { server, file_path, content, metadata } = body;
    if (!server || !file_path) {
      return NextResponse.json({ error: 'server y file_path requeridos' }, { status: 400 });
    }

    const { error } = await serviceClient.from('kb_sources').upsert(
      {
        server,
        file_path,
        content: typeof content === 'string' ? content.slice(0, MAX_CONTENT_LENGTH) : null,
        metadata: metadata ?? {},
        user_id: user.id,
        synced_at: new Date().toISOString(),
      },
      { onConflict: 'server,file_path' }
    );

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, server, file_path });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
