import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plug, Activity, RefreshCw, CheckCircle2, XCircle, Database, Zap, Clock } from 'lucide-react';
import { AGENT_BASE_URL } from '../../../services/agentAuth';

/**
 * Connectors (Fase 3B): estado real de las conexiones del ecosistema.
 *
 * Antes era un stub de solo UI. Ahora consulta:
 * - GET /api/health → salud del Agente (contrato Fase 3A).
 * - GET /api/mcp/stats → métricas de la capa MCP (endpoint preexistente).
 */
const Connectors = ({ onBack }) => {
  const [health, setHealth] = useState({ state: 'loading' });
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const r = await fetch(`${AGENT_BASE_URL}/api/health`);
      const data = await r.json();
      setHealth(r.ok && data.status === 'ok'
        ? { state: 'ok', service: data.service, timestamp: data.timestamp }
        : { state: 'error' });
    } catch {
      setHealth({ state: 'error' });
    }
    try {
      const r = await fetch(`${AGENT_BASE_URL}/api/mcp/stats`);
      if (r.ok) setStats(await r.json());
    } catch {
      setStats(null);
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const connectors = [
    {
      name: 'Agente QodeIA',
      description: 'CEOOrchestrator + Specialists',
      ok: health.state === 'ok',
      detail: health.state === 'ok' ? `Activo · ${new Date(health.timestamp).toLocaleTimeString()}` : health.state === 'loading' ? 'Comprobando…' : 'Sin conexión',
    },
    {
      name: 'Capa MCP',
      description: 'Servidores de herramientas externas',
      ok: !!stats,
      detail: stats ? `${stats.notebooks_connected ?? 0} fuentes conectadas` : 'Sin datos',
    },
  ];

  return (
    <div className="min-h-screen bg-[#10221f] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-[#13ecc8] transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver al Dashboard</span>
          </button>
          <button
            onClick={load}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#13ecc8]/10 rounded-xl flex items-center justify-center">
              <Plug className="text-[#13ecc8]" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Conectores del Ecosistema</h2>
              <p className="text-sm text-gray-400">Estado en vivo del Agente y la capa MCP</p>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            {connectors.map((c) => (
              <div key={c.name} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  {c.ok ? (
                    <CheckCircle2 className="text-[#13ecc8]" size={20} />
                  ) : (
                    <XCircle className="text-red-400" size={20} />
                  )}
                  <div>
                    <p className="font-bold text-sm">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.description}</p>
                  </div>
                </div>
                <span className={`text-xs ${c.ok ? 'text-[#13ecc8]' : 'text-gray-500'}`}>{c.detail}</span>
              </div>
            ))}
          </div>

          {stats && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <Database className="mx-auto mb-2 text-[#13ecc8]" size={18} />
                <p className="text-lg font-bold">{stats.total_queries ?? 0}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Consultas MCP</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <Zap className="mx-auto mb-2 text-[#13ecc8]" size={18} />
                <p className="text-lg font-bold">{stats.cache_hit_rate ?? 0}%</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cache hit</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <Clock className="mx-auto mb-2 text-[#13ecc8]" size={18} />
                <p className="text-lg font-bold">{stats.avg_response_time ?? 0} ms</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Respuesta media</p>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-2 text-[10px] text-gray-500">
            <Activity size={12} />
            <span>Endpoint: {AGENT_BASE_URL}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connectors;
