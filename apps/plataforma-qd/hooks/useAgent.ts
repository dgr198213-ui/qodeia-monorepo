import { useState, useCallback, useEffect } from 'react';
import { AgentClient } from '@qodeia/agent-sdk';
import { getAuthToken } from '@/lib/supabase/client';

export function useAgent({ projectId, sessionId }) {
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initClient() {
      const token = await getAuthToken();
      if (!token) return;
      
      const agentClient = new AgentClient({
        baseUrl: process.env.NEXT_PUBLIC_AGENT_API_URL,
        token,
        timeout: 30000,
        maxRetries: 3,
      });
      setClient(agentClient);
    }
    initClient();
  }, []);

  const createPlan = useCallback(async (goal, constraints) => {
    if (!client) return null;
    setIsLoading(true);
    try {
      const plan = await client.plan(goal, {
        project_id: projectId,
        session_id: sessionId,
        constraints,
      });
      return plan;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client, projectId, sessionId]);

  const executePlan = useCallback(async (planId, mode = 'dry-run') => {
    if (!client) return null;
    setIsLoading(true);
    try {
      const execution = await client.execute(planId, mode, {
        can_modify_files: mode === 'apply',
        can_execute_code: mode === 'apply',
      });
      return execution;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  const searchMemory = useCallback(async (query, options) => {
    if (!client) return [];
    setIsLoading(true);
    try {
      const results = await client.searchMemory({
        query,
        project_id: projectId,
        ...options,
      });
      return results;
    } catch (err) {
      setError(err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [client, projectId]);

  return {
    isReady: !!client,
    isLoading,
    error,
    createPlan,
    executePlan,
    searchMemory,
  };
}
