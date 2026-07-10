import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, serviceClient } from '@/lib/auth';
import { createCEOOrchestrator } from '@/agent/core/CEOOrchestrator';

export const maxDuration = 60;

/**
 * POST /api/agent/execute
 *
 * Ejecución de tareas estructuradas del contrato IDE↔Agente
 * (AgentApiClient.executeTask). Payload:
 * { task: { type, description, files[], options }, projectId?, context? }
 *
 * Convierte la tarea en una instrucción para el CEOOrchestrator y registra
 * la ejecución en `tasks` para trazabilidad.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { task, projectId, context } = body;
    if (!task?.type && !task?.description) {
      return NextResponse.json({ error: 'Tarea inválida: se requiere type o description' }, { status: 400 });
    }

    const filesSection = task.files?.length
      ? `\nARCHIVOS IMPLICADOS:\n${task.files.map((f: any) => `- ${typeof f === 'string' ? f : f.path}`).join('\n')}`
      : '';
    const contextSection = context?.content
      ? `\nCONTEXTO DEL PROYECTO:\n${context.content}\n`
      : '';

    const instruction = `TAREA [${task.type || 'general'}]: ${task.description || ''}${filesSection}${contextSection}`;

    const ceo = await createCEOOrchestrator();
    const result = await ceo.processRequest({
      userMessage: instruction,
      sessionId: user.id,
      context: projectId ? `project:${projectId}` : 'task-execution',
    });

    // Trazabilidad best-effort
    try {
      await serviceClient.from('tasks').insert({
        user_id: user.id,
        project_id: projectId ?? null,
        type: task.type || 'general',
        description: task.description || '',
        status: result.success ? 'completed' : 'failed',
        result: { response: result.response, delegatedTasks: result.delegatedTasks },
      });
    } catch {
      // best-effort
    }

    return NextResponse.json({
      success: result.success,
      status: result.success ? 'completed' : 'error',
      response: result.response,
      result: result.response,
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
