import { useState, useEffect } from 'react';
import { useContextMemoryStore } from '../../../store/contextMemoryStore';

export default function MemoryVisualizer() {
  const { loadedProjects, stats, updateStats, clearProject } = useContextMemoryStore();
  const [selectedProject, setSelectedProject] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, [updateStats]);

  const handleClearProject = (projectId) => {
    if (confirmDelete === projectId) {
      clearProject(projectId);
      setConfirmDelete(null);
      setSelectedProject(null);
    } else {
      setConfirmDelete(projectId);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">📊 Memory Visualizer</h2>

      {/* Global Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-3xl font-bold text-blue-400 mb-1">{stats.activeProjects}</div>
            <div className="text-sm text-gray-400">Proyectos Activos</div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {(stats.totalTokens / 1000000).toFixed(2)}M
            </div>
            <div className="text-sm text-gray-400">Tokens en Memoria</div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-3xl font-bold text-purple-400 mb-1">{stats.totalFiles}</div>
            <div className="text-sm text-gray-400">Archivos Indexados</div>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <div className="text-3xl font-bold text-orange-400 mb-1">
              {stats.avgAccessCount.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">Accesos Promedio</div>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-gray-400 mb-3">Proyectos en Memoria</h3>
        {Object.keys(loadedProjects).length === 0 ? (
          <div className="p-8 bg-gray-800 rounded-lg border border-gray-700 text-center">
            <div className="text-4xl mb-2">💭</div>
            <div className="text-gray-400">No hay proyectos cargados en memoria</div>
          </div>
        ) : (
          Object.entries(loadedProjects).map(([projectId, project]) => (
            <div
              key={projectId}
              className={`p-4 rounded-lg cursor-pointer transition-all border-l-4 ${
                selectedProject === projectId
                  ? 'bg-gray-700 border-blue-500'
                  : 'bg-gray-800 hover:bg-gray-750 border-blue-600'
              }`}
              onClick={() => setSelectedProject(projectId === selectedProject ? null : projectId)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-bold text-lg mb-1">{projectId}</div>
                  <div className="text-sm text-gray-400 flex gap-4">
                    <span>📁 {project.files} archivos</span>
                    <span>🔢 {project.tokens.toLocaleString()} tokens</span>
                    <span>🔍 {project.indexed} índices</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearProject(projectId);
                  }}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    confirmDelete === projectId
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {confirmDelete === projectId ? '⚠️ Confirmar' : '🗑️ Limpiar'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Architecture Info */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="text-lg font-bold mb-4 text-gray-300">Arquitectura del Motor</h3>
        <div className="space-y-2 text-sm font-mono">
          <div className="flex items-center gap-3 p-2 bg-gray-900/50 rounded">
            <span className="text-green-400 text-lg">✓</span>
            <div>
              <div className="font-bold text-green-300">Lightning Attention</div>
              <div className="text-gray-500 text-xs">Complejidad O(N) lineal</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-gray-900/50 rounded">
            <span className="text-green-400 text-lg">✓</span>
            <div>
              <div className="font-bold text-green-300">Context Compression</div>
              <div className="text-gray-500 text-xs">70% reducción de tamaño</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-gray-900/50 rounded">
            <span className="text-green-400 text-lg">✓</span>
            <div>
              <div className="font-bold text-green-300">Semantic Index</div>
              <div className="text-gray-500 text-xs">Búsqueda O(1) constante</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-gray-900/50 rounded">
            <span className="text-green-400 text-lg">✓</span>
            <div>
              <div className="font-bold text-green-300">Recurrent Attention State</div>
              <div className="text-gray-500 text-xs">Estado actualizable en tiempo real</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 bg-gray-900/50 rounded">
            <span className="text-green-400 text-lg">✓</span>
            <div>
              <div className="font-bold text-green-300">Incremental Sync</div>
              <div className="text-gray-500 text-xs">Sincronización eficiente de cambios</div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <h3 className="text-lg font-bold mb-4 text-gray-300">Comparativa vs Otros Modelos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-400">Característica</th>
                <th className="text-left py-2 px-3 text-gray-400">GPT-4</th>
                <th className="text-left py-2 px-3 text-gray-400">Claude 3.5</th>
                <th className="text-left py-2 px-3 text-blue-400">Howard OS</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              <tr className="border-b border-gray-700/50">
                <td className="py-2 px-3">Contexto Máximo</td>
                <td className="py-2 px-3 text-gray-400">128K tokens</td>
                <td className="py-2 px-3 text-gray-400">200K tokens</td>
                <td className="py-2 px-3 text-green-400 font-bold">Ilimitado*</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-2 px-3">Atención</td>
                <td className="py-2 px-3 text-gray-400">O(N²)</td>
                <td className="py-2 px-3 text-gray-400">O(N²)</td>
                <td className="py-2 px-3 text-green-400 font-bold">O(N)</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-2 px-3">RAG Necesario</td>
                <td className="py-2 px-3 text-orange-400">Sí</td>
                <td className="py-2 px-3 text-orange-400">Sí</td>
                <td className="py-2 px-3 text-green-400 font-bold">No</td>
              </tr>
              <tr className="border-b border-gray-700/50">
                <td className="py-2 px-3">Búsqueda Semántica</td>
                <td className="py-2 px-3 text-gray-400">Externa</td>
                <td className="py-2 px-3 text-gray-400">Externa</td>
                <td className="py-2 px-3 text-green-400 font-bold">Integrada</td>
              </tr>
              <tr>
                <td className="py-2 px-3">Costo</td>
                <td className="py-2 px-3 text-gray-400">API</td>
                <td className="py-2 px-3 text-gray-400">API</td>
                <td className="py-2 px-3 text-green-400 font-bold">Gratis</td>
              </tr>
            </tbody>
          </table>
          <div className="text-xs text-gray-500 mt-2">* Limitado solo por RAM del navegador</div>
        </div>
      </div>
    </div>
  );
}
