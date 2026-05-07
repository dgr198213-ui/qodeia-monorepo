/**
 * Servicio de Interconexión MCP para Plataforma-qd
 * Conecta el IDE con el Agente y Howard OS
 */

import { supabase, agentSupabase } from '../lib/supabase';

const AGENT_URL = import.meta.env.VITE_AGENT_URL || 'http://localhost:3001';

export const mcpService = {
  /**
   * Consulta la base de conocimiento de Howard OS
   * Utiliza el scope 'knowledge' o 'howard-os'
   */
  async queryKnowledge(query: string) {
    try {
      const response = await fetch(`${AGENT_URL}/api/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: query }
          ],
          use_mcp: true,
          mcp_scope: 'howard-os', // Base de conocimiento
          mode: 'retrieval'
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error consultando base de conocimiento:', error);
      throw error;
    }
  },

  /**
   * Consulta operativa al Agente
   * Utiliza el scope 'operational' para tareas de ejecución
   */
  async queryAgent(query: string, context = {}) {
    try {
      const response = await fetch(`${AGENT_URL}/api/agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: query }
          ],
          use_mcp: true,
          mcp_scope: 'operational', // Base operativa
          context
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error consultando agente operativo:', error);
      throw error;
    }
  },

  /**
   * Sincroniza una solución validada en el IDE con el Agente
   */
  async syncSolution(solution: any) {
    try {
      // Guardar localmente en la DB de conocimiento
      await supabase.from('agent_solutions').upsert(solution);

      // Notificar al Agente para su sincronización operativa
      const response = await fetch(`${AGENT_URL}/api/agent/sync-solution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(solution)
      });
      return await response.json();
    } catch (error) {
      console.error('Error sincronizando solución:', error);
      throw error;
    }
  },

  /**
   * Sincroniza una fuente genérica con MCP (usado por hooks)
   */
  async syncSource(data: { server: string, file_path: string, content: string, metadata: any }) {
    try {
      const response = await fetch(`${AGENT_URL}/api/mcp/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error sincronizando fuente MCP:', error);
      throw error;
    }
  },

  /**
   * Obtiene el estado del agente desde la DB operativa
   */
  async getAgentState(projectId: string) {
    const { data, error } = await agentSupabase
      .from('agent_state')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) throw error;
    return data;
  }
};

// Para compatibilidad con hooks antiguos
export const getMCPClient = () => mcpService;

export default mcpService;
