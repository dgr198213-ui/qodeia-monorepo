import { useState, useEffect } from 'react';

export function useAgentStatus() {
  const [status, setStatus] = useState<any>({ service: 'agent', status: 'unknown' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  async function checkStatus() {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AGENT_API_URL}/status`,
        { cache: 'no-store' }
      );

      if (response.ok) {
        const data = await response.json();
        setStatus({
          service: data.service,
          status: 'ok',
          version: data.version,
          capabilities: data.capabilities,
        });
      } else {
        setStatus({ service: 'agent', status: 'down' });
      }
    } catch (error) {
      setStatus({ service: 'agent', status: 'down' });
    } finally {
      setIsLoading(false);
    }
  }

  return { status, isLoading, refresh: checkStatus };
}
