import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useAgentSession({ projectId, autoCreate = true }) {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initSession();
  }, [projectId]);

  async function initSession() {
    setIsLoading(true);
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) throw new Error('No authenticated session');

      const { data: existingSession } = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('user_id', authSession.user.id)
        .eq('project_id', projectId)
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (existingSession) {
        setSession(existingSession);
      } else if (autoCreate) {
        const { data } = await supabase.rpc('create_agent_session', {
          p_user_id: authSession.user.id,
          p_project_id: projectId,
        });
        
        const { data: newSession } = await supabase
          .from('agent_sessions')
          .select('*')
          .eq('id', data)
          .single();
        
        setSession(newSession);
      }
    } catch (err) {
      console.error('Session error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return { session, isLoading };
}
