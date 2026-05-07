import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, AlertCircle, CheckCircle, Zap } from 'lucide-react';

export default function Dashboard() {
  const { data: status, isLoading } = trpc.status.getOperationalStatus.useQuery(undefined, {
    refetchInterval: 5000, // Actualizar cada 5 segundos
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-900/50 text-green-300 border-green-700';
      case 'degraded':
        return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
      case 'offline':
        return 'bg-red-900/50 text-red-300 border-red-700';
      default:
        return 'bg-slate-900/50 text-slate-300 border-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'degraded':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      case 'offline':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Activity className="h-5 w-5 text-slate-400" />;
    }
  };

  const components = [
    { type: 'n8n', name: 'n8n - Orquestación', icon: Zap },
    { type: 'flowise', name: 'Flowise - IA Cognitiva', icon: Zap },
    { type: 'github', name: 'GitHub - DevOps', icon: Zap },
    { type: 'ama_g', name: 'AMA-G - Gobernanza', icon: CheckCircle },
    { type: 'system', name: 'Sistema - Core', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-white">Dashboard de Monitoreo</h1>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Estado Operativo en Tiempo Real</h2>
          
          {isLoading ? (
            <div className="text-center text-slate-400">Cargando estado...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {components.map((component) => {
                const componentStatus = status?.find(
                  (s) => s.componentType === component.type
                );
                const statusValue = componentStatus?.status || 'offline';

                return (
                  <Card 
                    key={component.type}
                    className={`p-6 border ${getStatusColor(statusValue)}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <component.icon className="h-6 w-6" />
                      {getStatusIcon(statusValue)}
                    </div>
                    <h3 className="font-semibold mb-2">{component.name}</h3>
                    <Badge className={`${getStatusColor(statusValue)} border`}>
                      {statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
                    </Badge>
                    {componentStatus?.lastHeartbeat && (
                      <p className="text-xs mt-3 text-slate-400">
                        Última actualización: {new Date(componentStatus.lastHeartbeat).toLocaleTimeString('es-ES')}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-slate-800 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Información del Sistema</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Versión:</span>
                <span className="text-white font-mono">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Entorno:</span>
                <span className="text-white font-mono">Production</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cifrado:</span>
                <span className="text-white font-mono">AES-256-GCM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Gobernanza:</span>
                <span className="text-white font-mono">AMA-G Activo</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-800 border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Reglas AMA-G Activas</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-slate-300">Veracidad: Información trazable</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-slate-300">Determinismo: Resultados consistentes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-slate-300">No Contaminación: Aislamiento de recursos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-slate-300">Seguridad Epistémica: Operaciones explícitas</span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
