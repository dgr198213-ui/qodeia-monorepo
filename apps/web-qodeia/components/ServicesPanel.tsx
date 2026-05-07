'use client';

import { useAgentStatus } from '@/hooks/useAgentStatus';
import Link from 'next/link';

export function ServicesPanel() {
  const { status, isLoading } = useAgentStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-green-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Servicios QodeIA</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)}`} />
            <div>
              <h3 className="font-semibold">Agente de IA</h3>
              <p className="text-sm text-gray-600">
                {isLoading ? 'Verificando...' : 
                 status.status === 'ok' ? 'Operativo' : 'No disponible'}
              </p>
            </div>
          </div>

          {status.status === 'ok' && (
            <Link
              href="/ide"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Abrir IDE
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
