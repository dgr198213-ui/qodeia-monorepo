import { useState, useEffect } from 'react';
import { useProjectMemory } from '../../../hooks/useProjectMemory';
import { useCodeStore } from '../../../store/codeStore';
import { useContextMemoryStore } from '../../../store/contextMemoryStore';

export default function ContextMemoryPanel() {
  const {
    isMemoryLoaded,
    isLoading,
    error,
    queryContext,
    memoryStats,
    updateStats,
    clearError
  } = useProjectMemory();

  const { currentProject } = useCodeStore();
  const { stats } = useContextMemoryStore();

  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [strategyInfo, setStrategyInfo] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Actualizar stats cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      updateStats();
    }, 5000);
    return () => clearInterval(interval);
  }, [updateStats]);

  const handleQuery = async () => {
    if (!query.trim()) return;

    setProcessing(true);
    try {
      const contextResult = queryContext(query);
      setResult(contextResult.context);
      setStrategyInfo({
        strategy: contextResult.strategy,
        tokens: contextResult.tokens,
        cached: contextResult.cached,
        contextSize: contextResult.contextSize
      });
    } catch (err) {
      console.error('Error consultando contexto:', err);
      setResult(`Error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const exampleQueries = [
    { label: 'Búsqueda Semántica', query: '¿Dónde se maneja la autenticación?', strategy: 'semantic' },
    { label: 'Contexto Completo', query: 'Analiza toda la arquitectura del proyecto', strategy: 'full' },
    { label: 'Archivo Específico', query: '¿Qué hace authStore.js?', strategy: 'focused' },
    { label: 'Estructura', query: 'Muestra la estructura del proyecto', strategy: 'structural' }
  ];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">🧠 Context Memory Engine</h2>
          {isMemoryLoaded && (
            <span className="px-3 py-1 bg-green-600 rounded-full text-xs font-bold">
              ✓ LOADED
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400">
          Memoria persistente sin chunking • Atención O(N) • Índice semántico
        </p>
      </div>

      {/* Project Stats */}
      {isMemoryLoaded && memoryStats && (
        <div className="p-4 border-b border-gray-700 bg-gray-800/50">
          <h3 className="text-xs font-bold mb-2 text-gray-400">PROYECTO ACTUAL</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-400 text-xs">Archivos</div>
              <div className="text-xl font-bold text-blue-400">{memoryStats.files}</div>
            </div>
            <div>
              <div className="text-gray-400 text-xs">Tokens</div>
              <div className="text-xl font-bold text-green-400">
                {memoryStats.tokens.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-xs">Índice</div>
              <div className="text-xl font-bold text-purple-400">{memoryStats.indexed}</div>
            </div>
          </div>
        </div>
      )}

      {/* Global Stats */}
      {stats && (
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-xs font-bold mb-2 text-gray-400">ESTADÍSTICAS GLOBALES</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Proyectos:</span>
              <span className="font-mono font-bold">{stats.activeProjects}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Tokens:</span>
              <span className="font-mono font-bold">{stats.totalTokens.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Archivos:</span>
              <span className="font-mono font-bold">{stats.totalFiles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Accesos Avg:</span>
              <span className="font-mono font-bold">{stats.avgAccessCount.toFixed(1)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Query Interface */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Example Queries */}
          <div>
            <h3 className="text-sm font-bold mb-2 text-gray-400">ESTRATEGIAS DE ATENCIÓN</h3>
            <div className="grid grid-cols-2 gap-2">
              {exampleQueries.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(example.query)}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded text-left text-xs border border-gray-700 transition-colors"
                  disabled={!isMemoryLoaded}
                >
                  <div className="font-bold text-blue-400 mb-1">{example.label}</div>
                  <div className="text-gray-400">{example.strategy}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Query Input */}
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-400">CONSULTA AL CONTEXTO</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe tu consulta... El motor determinará la mejor estrategia de atención."
              className="w-full h-24 p-3 bg-gray-800 border border-gray-700 rounded resize-none text-sm focus:outline-none focus:border-blue-500"
              disabled={!isMemoryLoaded}
            />
            <button
              onClick={handleQuery}
              disabled={!isMemoryLoaded || processing}
              className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-bold text-sm transition-colors"
            >
              {processing ? 'Procesando...' : 'Consultar Contexto'}
            </button>
          </div>

          {/* Strategy Info */}
          {strategyInfo && (
            <div className="p-3 bg-blue-900/30 border border-blue-700 rounded text-sm">
              <div className="font-bold mb-2 text-blue-300">Estrategia Utilizada</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400">Tipo:</span>
                  <span className="ml-2 font-mono text-blue-300 uppercase">{strategyInfo.strategy}</span>
                </div>
                <div>
                  <span className="text-gray-400">Tamaño:</span>
                  <span className="ml-2 font-mono text-blue-300">{strategyInfo.contextSize}</span>
                </div>
                <div>
                  <span className="text-gray-400">Tokens:</span>
                  <span className="ml-2 font-mono text-blue-300">{strategyInfo.tokens.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400">Caché:</span>
                  <span className="ml-2 font-mono text-blue-300">{strategyInfo.cached ? '✓ Si' : '✗ No'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-400">CONTEXTO RECUPERADO</h3>
                <button
                  onClick={() => navigator.clipboard.writeText(result)}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
                >
                  📋 Copiar
                </button>
              </div>
              <div className="p-3 bg-gray-800 border border-gray-700 rounded max-h-96 overflow-y-auto">
                <pre className="text-xs whitespace-pre-wrap font-mono text-gray-300">{result}</pre>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded text-sm">
              <div className="font-bold mb-1 text-red-400">Error</div>
              <div className="text-red-300">{error}</div>
              <button
                onClick={clearError}
                className="mt-2 px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-xs"
              >
                Cerrar
              </button>
            </div>
          )}

          {/* Not Loaded Warning */}
          {!isMemoryLoaded && currentProject && (
            <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded">
              <div className="font-bold mb-2">⚠️ Proyecto no cargado en memoria</div>
              <div className="text-sm text-gray-300">
                {isLoading ? 'Cargando proyecto en memoria...' : 'El proyecto se cargará automáticamente.'}
              </div>
            </div>
          )}

          {!currentProject && (
            <div className="p-4 bg-blue-900/30 border border-blue-700 rounded">
              <div className="font-bold mb-2">ℹ️ No hay proyecto activo</div>
              <div className="text-sm text-gray-300">
                Abre o crea un proyecto para utilizar Context Memory Engine.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-4">
            <span>⚡ Lightning Attention (O(N))</span>
            <span>🗜️ Context Compression (70%)</span>
            <span>🔍 Semantic Index</span>
          </div>
          <div className="text-gray-600">
            Inspirado en MiniMax M2.1 • Sin dependencias externas • 100% Local
          </div>
        </div>
      </div>
    </div>
  );
}
