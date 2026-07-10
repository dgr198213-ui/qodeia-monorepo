import { NextResponse } from 'next/server';

/**
 * GET /api/health
 *
 * Healthcheck público (sin auth) del contrato IDE↔Agente. Lo consume
 * `AgentApiClient.healthCheck()` y sirve para observabilidad externa.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'qodeia-agent',
    timestamp: new Date().toISOString(),
  });
}
