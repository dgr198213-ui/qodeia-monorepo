/**
 * Cliente API para comunicación con Mi-agente-QodeIA
 * Integra Context Memory Engine (CME) para contexto optimizado
 * 
 * REEMPLAZA: ClawdbotGateway.js
 */

import contextMemoryEngine from './ContextMemoryEngine';
import { logger } from '../utils/logger';

class AgentApiClient {
  constructor() {
    this.baseUrl = import.meta.env.VITE_AGENT_URL || 'https://mi-agente-qode-ia.vercel.app';
    this.sessionToken = null;
  }

  setSessionToken(token) {
    this.sessionToken = token;
  }

  /**
   * Ejecuta una tarea de IA con contexto CME optimizado
   */
  async executeTask(task, projectId, options = {}) {
    try {
      logger.info('[AgentAPI] Ejecutando tarea:', task.type);

      // 1. Obtener contexto relevante del CME
      let cmeContext = null;
      try {
        cmeContext = contextMemoryEngine.getRelevantContext(
          projectId,
          task.description || task.type,
          {
            strategy: options.strategy || 'auto',
            maxTokens: options.maxTokens || 50000
          }
        );
        logger.info(`[AgentAPI] CME context: ${cmeContext.strategy} strategy, ${cmeContext.tokens} tokens`);
      } catch (error) {
        logger.warn('[AgentAPI] CME no disponible, continuando sin cache:', error.message);
      }

      // 2. Preparar payload
      const payload = {
        task: {
          type: task.type,
          description: task.description,
          files: task.files || [],
          options: task.options || {}
        },
        projectId,
        context: cmeContext ? {
          // Enviar contexto comprimido (no full)
          content: cmeContext.context,
          strategy: cmeContext.strategy,
          tokens: cmeContext.tokens,
          files: cmeContext.files,
          cached: true,
          source: 'cme'
        } : {
          cached: false,
          source: 'none'
        }
      };

      // 3. Llamar al agente
      const response = await fetch(`${this.baseUrl}/api/agent/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.sessionToken && { 'Authorization': `Bearer ${this.sessionToken}` })
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      // 4. Manejar streaming si está disponible
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/event-stream')) {
        return this._handleStreamingResponse(response);
      }

      // 5. Respuesta JSON normal
      const result = await response.json();
      logger.info('[AgentAPI] Tarea completada:', result.status);

      return result;

    } catch (error) {
      logger.error('[AgentAPI] Error ejecutando tarea:', error);
      throw error;
    }
  }

  /**
   * Chat conversacional con contexto CME
   */
  async chat(message, projectId, conversationId = null) {
    try {
      logger.info('[AgentAPI] Enviando mensaje:', message.substring(0, 50) + '...');

      // 1. Obtener contexto del CME
      let cmeContext = null;
      try {
        cmeContext = contextMemoryEngine.getRelevantContext(
          projectId,
          message,
          { strategy: 'auto', maxTokens: 30000 }
        );
      } catch (error) {
        logger.warn('[AgentAPI] CME no disponible para chat');
      }

      // 2. Payload
      const payload = {
        message,
        projectId,
        conversationId,
        context: cmeContext ? {
          content: cmeContext.context,
          strategy: cmeContext.strategy,
          tokens: cmeContext.tokens,
          cached: true,
          source: 'cme'
        } : {
          cached: false,
          source: 'none'
        }
      };

      // 3. Llamada
      const response = await fetch(`${this.baseUrl}/api/agent/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.sessionToken && { 'Authorization': `Bearer ${this.sessionToken}` })
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // 4. Streaming response
      return this._handleStreamingResponse(response);

    } catch (error) {
      logger.error('[AgentAPI] Error en chat:', error);
      throw error;
    }
  }

  /**
   * Consulta la memoria vectorial del agente (L2 cache)
   * Usado cuando CME no tiene el contexto (proyecto nuevo, etc.)
   */
  async queryMemory(projectId, query) {
    try {
      const response = await fetch(`${this.baseUrl}/api/agent/memory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.sessionToken && { 'Authorization': `Bearer ${this.sessionToken}` })
        },
        body: JSON.stringify({ projectId, query })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      logger.info('[AgentAPI] Memoria L2 consultada:', result.results?.length || 0, 'resultados');

      return result;

    } catch (error) {
      logger.error('[AgentAPI] Error consultando memoria:', error);
      throw error;
    }
  }

  /**
   * Sincroniza el proyecto actual al agente
   * Usado cuando el usuario carga un proyecto por primera vez
   */
  async syncProject(projectId, files, metadata = {}) {
    try {
      logger.info(`[AgentAPI] Sincronizando proyecto ${projectId} (${files.length} archivos)`);

      // 1. Cargar en CME primero
      const cmeStats = await contextMemoryEngine.loadProjectContext(
        projectId,
        files,
        metadata
      );

      logger.info('[AgentAPI] CME cargado:', cmeStats);

      // 2. Enviar índice al agente para L2 cache
      const response = await fetch(`${this.baseUrl}/api/agent/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.sessionToken && { 'Authorization': `Bearer ${this.sessionToken}` })
        },
        body: JSON.stringify({
          projectId,
          metadata,
          stats: cmeStats,
          // Solo enviamos metadatos, no contenido completo
          fileIndex: files.map(f => ({
            path: f.path,
            language: f.language || contextMemoryEngine._detectLanguage(f.path),
            size: f.content.length,
            hash: contextMemoryEngine._hashContent(f.content)
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      logger.info('[AgentAPI] Proyecto sincronizado:', result);

      return {
        cme: cmeStats,
        agent: result
      };

    } catch (error) {
      logger.error('[AgentAPI] Error sincronizando proyecto:', error);
      throw error;
    }
  }

  /**
   * Maneja respuestas en streaming (SSE)
   */
  async _handleStreamingResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    return {
      stream: true,
      async *[Symbol.asyncIterator]() {
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data === '[DONE]') {
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  yield parsed;
                } catch (e) {
                  // Línea no es JSON, enviar como texto
                  yield { type: 'text', content: data };
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }
    };
  }

  /**
   * Health check del agente
   */
  async ping() {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return { status: 'error', message: `HTTP ${response.status}` };
      }

      const result = await response.json();
      return { status: 'ok', ...result };

    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

// Singleton
const agentApiClient = new AgentApiClient();
export default agentApiClient;
