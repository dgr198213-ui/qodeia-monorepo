import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const {
  mockGetUser,
  mockFrom,
  mockInsert,
  mockProcessRequest,
  mockSearch,
  mockInitializeProject,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockInsert: vi.fn(),
  mockProcessRequest: vi.fn(),
  mockSearch: vi.fn(),
  mockInitializeProject: vi.fn(),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}));

vi.mock('@/agent/core/CEOOrchestrator', () => ({
  createCEOOrchestrator: vi.fn(async () => ({
    processRequest: mockProcessRequest,
  })),
}));

vi.mock('@/agent/core/EnhancedContextMemory', () => ({
  EnhancedContextMemoryEngine: vi.fn().mockImplementation(() => ({
    search: mockSearch,
    initializeProject: mockInitializeProject,
  })),
}));

import { POST as chatPost } from './chat/route';
import { POST as executePost } from './execute/route';
import { POST as memoryPost } from './memory/route';
import { POST as reloadPost } from './reload/route';

type ProtectedRoute = {
  name: string;
  handler: (request: NextRequest) => Promise<Response>;
  body: Record<string, unknown>;
};

const protectedRoutes: ProtectedRoute[] = [
  {
    name: 'execute',
    handler: executePost,
    body: { task: { type: 'analysis', description: 'Comprobar contención' } },
  },
  {
    name: 'chat',
    handler: chatPost,
    body: { message: 'Comprobar contención' },
  },
  {
    name: 'memory',
    handler: memoryPost,
    body: { projectId: 'project-test', query: 'contexto' },
  },
];

function makeRequest(
  path: string,
  body: Record<string, unknown>,
  authorization?: string,
): NextRequest {
  const headers = new Headers({ 'content-type': 'application/json' });
  if (authorization) headers.set('authorization', authorization);

  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

describe('contención P0 de rutas del agente', () => {
  let previousMcpClient: unknown;
  let hadMcpClient: boolean;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({ insert: mockInsert });
    mockInsert.mockResolvedValue({ error: null });
    mockProcessRequest.mockResolvedValue({
      success: true,
      response: 'Respuesta simulada',
      delegatedTasks: [],
      totalExecutionTime: 1,
    });
    mockSearch.mockResolvedValue([]);
    mockInitializeProject.mockResolvedValue(undefined);
    hadMcpClient = Object.prototype.hasOwnProperty.call(global, '__mcp_client');
    previousMcpClient = (global as any).__mcp_client;
  });

  afterEach(() => {
    if (hadMcpClient) {
      (global as any).__mcp_client = previousMcpClient;
    } else {
      delete (global as any).__mcp_client;
    }
  });

  it('devuelve 401 para execute, chat y memory sin Authorization', async () => {
    for (const route of protectedRoutes) {
      const response = await route.handler(makeRequest(`/api/agent/${route.name}`, route.body));
      expect(response.status, route.name).toBe(401);
    }
  });

  it('devuelve 403 para execute, chat y memory con usuario no administrador', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', app_metadata: { role: 'user' } } },
      error: null,
    });

    for (const route of protectedRoutes) {
      const response = await route.handler(
        makeRequest(`/api/agent/${route.name}`, route.body, 'Bearer user-token'),
      );
      expect(response.status, route.name).toBe(403);
    }
  });

  it('permite a administradores alcanzar execute, chat y memory', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', app_metadata: { role: 'admin' } } },
      error: null,
    });

    for (const route of protectedRoutes) {
      const response = await route.handler(
        makeRequest(`/api/agent/${route.name}`, route.body, 'Bearer admin-token'),
      );
      expect(response.status, route.name).not.toBe(401);
      expect(response.status, route.name).not.toBe(403);
    }

    expect(mockProcessRequest).toHaveBeenCalledTimes(2);
    expect(mockSearch).toHaveBeenCalledWith('project-test', 'contexto', 10);
  });

  it('protege reload y conserva el cliente MCP global sin credencial de administrador', async () => {
    const mcpClient = { connection: 'sin cambios' };
    (global as any).__mcp_client = mcpClient;

    const response = await reloadPost(makeRequest('/api/agent/reload', {}));

    expect(response.status).toBe(401);
    expect((global as any).__mcp_client).toBe(mcpClient);
  });
});
