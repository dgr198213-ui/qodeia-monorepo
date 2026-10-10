import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const {
  mockGetUser,
  mockFrom,
  mockInsert,
  mockProcessRequest,
  mockSearch,
  mockInitializeProject,
  mockCleanup,
} = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockFrom: vi.fn(),
  mockInsert: vi.fn(),
  mockProcessRequest: vi.fn(),
  mockSearch: vi.fn(),
  mockInitializeProject: vi.fn(),
  mockCleanup: vi.fn(),
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
    cleanup: mockCleanup,
  })),
}));

vi.mock('@/agent/core/EnhancedContextMemory', () => ({
  EnhancedContextMemoryEngine: vi.fn().mockImplementation(() => ({
    search: mockSearch,
    initializeProject: mockInitializeProject,
  })),
}));

import { POST as legacyAgentPost } from './route';
import { POST as chatPost } from './chat/route';
import { POST as executePost } from './execute/route';
import { POST as memoryPost } from './memory/route';
import { POST as reloadPost } from './reload/route';

type ProtectedRoute = {
  route: string;
  path: string;
  handler: (request: NextRequest) => Promise<Response>;
  body: Record<string, unknown>;
};

const protectedRoutes: ProtectedRoute[] = [
  {
    route: 'POST /api/agent/execute',
    path: '/api/agent/execute',
    handler: executePost,
    body: { task: { type: 'analysis', description: 'Comprobar contención' } },
  },
  {
    route: 'POST /api/agent/chat',
    path: '/api/agent/chat',
    handler: chatPost,
    body: { message: 'Comprobar contención' },
  },
  {
    route: 'POST /api/agent/memory',
    path: '/api/agent/memory',
    handler: memoryPost,
    body: { projectId: 'project-test', query: 'contexto' },
  },
  {
    route: 'POST /api/agent (legacy)',
    path: '/api/agent',
    handler: legacyAgentPost,
    body: { message: 'Comprobar contención' },
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

const reloadRequest = (authorization?: string) =>
  makeRequest('/api/agent/reload', {}, authorization);

describe('contención P0 de rutas del agente', () => {
  const originalMcpClient = (global as any).__mcp_client;
  const hadOriginalMcpClient = Object.prototype.hasOwnProperty.call(global, '__mcp_client');

  beforeAll(() => {
    if (!hadOriginalMcpClient) delete (global as any).__mcp_client;
  });

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
    mockCleanup.mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (hadOriginalMcpClient) {
      (global as any).__mcp_client = originalMcpClient;
    } else {
      delete (global as any).__mcp_client;
    }
  });

  afterAll(() => {
    if (hadOriginalMcpClient) {
      (global as any).__mcp_client = originalMcpClient;
    } else {
      delete (global as any).__mcp_client;
    }
  });

  it.each(protectedRoutes)('$route devuelve 401 sin Authorization', async ({ path, handler, body }) => {
    const response = await handler(makeRequest(path, body));
    expect(response.status).toBe(401);
  });

  it.each(protectedRoutes)('$route devuelve 403 a un usuario no administrador', async ({ path, handler, body }) => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', app_metadata: { role: 'user' } } },
      error: null,
    });
    const response = await handler(makeRequest(path, body, 'Bearer user-token'));
    expect(response.status).toBe(403);
  });

  it.each(protectedRoutes)('$route permite a un administrador alcanzar el handler', async ({ path, handler, body }) => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', app_metadata: { role: 'admin' } } },
      error: null,
    });
    const response = await handler(makeRequest(path, body, 'Bearer admin-token'));
    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
  });

  it('POST /api/agent/reload devuelve 401 sin Authorization y conserva el cliente MCP global', async () => {
    const mcpClient = { connection: 'sin cambios' };
    (global as any).__mcp_client = mcpClient;

    const response = await reloadPost(reloadRequest());

    expect(response.status).toBe(401);
    expect((global as any).__mcp_client).toBe(mcpClient);
  });

  it('POST /api/agent/reload devuelve 403 a un usuario no administrador', async () => {
    const mcpClient = { connection: 'sin cambios' };
    (global as any).__mcp_client = mcpClient;
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', app_metadata: { role: 'user' } } },
      error: null,
    });

    const response = await reloadPost(reloadRequest('Bearer user-token'));

    expect(response.status).toBe(403);
    expect((global as any).__mcp_client).toBe(mcpClient);
  });

  it('POST /api/agent/reload permite a un administrador ejecutar la recarga', async () => {
    const mcpClient = { connection: 'se debe retirar durante la recarga' };
    (global as any).__mcp_client = mcpClient;
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', app_metadata: { role: 'admin' } } },
      error: null,
    });

    const response = await reloadPost(reloadRequest('Bearer admin-token'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    expect((global as any).__mcp_client).toBeUndefined();
  });

  it('restaura el cliente MCP global original después de cada prueba', () => {
    if (hadOriginalMcpClient) {
      expect((global as any).__mcp_client).toBe(originalMcpClient);
    } else {
      expect(Object.prototype.hasOwnProperty.call(global, '__mcp_client')).toBe(false);
    }
  });

});
