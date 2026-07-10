import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, serviceClient } from '@/lib/auth';
import { createCEOOrchestrator } from '@/agent/core/CEOOrchestrator';

export const maxDuration = 60;

/**
 * POST /api/agent/chat
 *
 * Chat conversacional del contrato IDE↔Agente (AgentApiClient.chat).
 * Payload: { message, projectId?, conversationId?, context? }
 * donde context puede traer contenido precomputado por el CME del IDE
 * ({ content, strategy, tokens, cached, source }).
 *
 * Fachada fina sobre el CEOOrchestrator: enriquece el mensaje con el
 * contexto recibido y persiste el intercambio en `messages`.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { message, projectId, conversationId, context } = body;
    if (!message) {
      return NextResponse.json({ error: 'Mensaje inválido' }, { status: 400 });
    }

    let enhancedMessage = message;
    if (context?.content) {
      enhancedMessage = `CONTEXTO DEL PROYECTO (${context.source || 'cme'}, estrategia ${context.strategy || 'auto'}):\n${context.content}\n\nSOLICITUD DEL USUARIO:\n${message}`;
    }

    const ceo = await createCEOOrchestrator();
    const sessionId = conversationId || user.id;
    const result = await ceo.processRequest({
      userMessage: enhancedMessage,
      sessionId,
      context: projectId ? `project:${projectId}` : 'general',
    });

    // Persistir historial (best-effort: un fallo de BD no rompe la respuesta)
    try {
      await serviceClient.from('messages').insert([
        { session_id: sessionId, role: 'user', content: message, user_id: user.id },
        {
          session_id: sessionId,
          role: 'assistant',
          content: result.response,
          user_id: user.id,
          metadata: { endpoint: 'chat', projectId, executionTime: result.totalExecutionTime },
        },
      ]);
    } catch {
      // best-effort
    }

    return NextResponse.json({
      success: result.success,
      status: result.success ? 'completed' : 'error',
      response: result.response,
      conversationId: sessionId,
      metadata: {
        duration: Date.now() - startTime,
        delegatedTasks: result.delegatedTasks,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
