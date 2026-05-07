/**
 * Configuración de Conexión del Ecosistema QodeIA
 * Gestiona las URLs del Agente, Howard OS y la Plataforma
 */

export const API_CONFIG = {
  // El motor de ejecución y memoria operativa
  AGENT_URL: process.env.NEXT_PUBLIC_AGENT_URL || 'https://your-agent.vercel.app',
  
  // El sistema experto de arquitectura y contexto (Base de conocimientos)
  HOWARD_OS_URL: process.env.NEXT_PUBLIC_HOWARD_OS_URL || 'http://localhost:3002',
  
  // La plataforma IDE
  IDE_URL: process.env.NEXT_PUBLIC_IDE_URL || 'https://plataforma-qd.vercel.app',

  // Endpoints específicos del Agente
  ENDPOINTS: {
    AGENT_CHAT: '/api/agent',
    MCP_STATS: '/api/mcp/stats',
    MCP_TEST: '/api/mcp/test',
    MCP_AUTH: '/api/mcp/auth/google',
    AGENT_RELOAD: '/api/agent/reload',
    UPDATE_ENV: '/api/mcp/update-env',
  }
};

/**
 * Helper para realizar peticiones al Agente
 * Utilizado por las rutas de API proxy
 */
export async function callAgentBackend(endpoint: string, options: RequestInit = {}) {
  const url = `${API_CONFIG.AGENT_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  return response;
}
