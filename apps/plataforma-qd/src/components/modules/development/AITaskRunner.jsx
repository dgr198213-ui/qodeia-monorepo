/**
 * Plataforma-qd/src/components/modules/development/AITaskRunner.jsx
 * 
 * ACTUALIZADO: Sincronización automática con agente al cargar proyecto
 */

import React, { useState, useEffect } from 'react';
import agentApiClient from '@/services/AgentApiClient';
import contextMemoryEngine from '@/services/ContextMemoryEngine';
import { logger } from '@/utils/logger';

const TASK_TEMPLATES = [
  {
    id: 'security-audit',
    name: 'Security Audit',
    description: 'Perform comprehensive security audit of the codebase',
    icon: '🔒',
    type: 'audit',
    estimatedTime: '2-3 min'
  },
  {
    id: 'performance-analysis',
    name: 'Performance Analysis',
    description: 'Analyze code for performance bottlenecks and optimization opportunities',
    icon: '⚡',
    type: 'analysis',
    estimatedTime: '3-5 min'
  },
  {
    id: 'code-review',
    name: 'Code Review',
    description: 'Review code quality, best practices, and suggest improvements',
    icon: '👀',
    type: 'review',
    estimatedTime: '2-4 min'
  },
  {
    id: 'generate-tests',
    name: 'Generate Tests',
    description: 'Generate unit tests for selected components',
    icon: '🧪',
    type: 'generation',
    estimatedTime: '5-10 min'
  },
  {
    id: 'refactor-suggestion',
    name: 'Refactor Suggestions',
    description: 'Suggest refactoring opportunities to improve code structure',
    icon: '🔧',
    type: 'suggestion',
    estimatedTime: '3-5 min'
  },
  {
    id: 'documentation',
    name: 'Generate Documentation',
    description: 'Create comprehensive documentation for the project',
    icon: '📚',
    type: 'generation',
    estimatedTime: '5-8 min'
  }
];

export default function AITaskRunner({ projectId, projectFiles, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [running, setRunning] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | synced | error

  // Sincronizar proyecto al montar el componente
  useEffect(() => {
    syncProjectToAgent();
  }, [projectId, projectFiles]);

  const syncProjectToAgent = async () => {
    if (!projectFiles || projectFiles.length === 0) {
      logger.warn('[AITaskRunner] No hay archivos para sincronizar');
      return;
    }

    setSyncStatus('syncing');
    logger.info('[AITaskRunner] Sincronizando proyecto con agente...');

    try {
      const result = await agentApiClient.syncProject(
        projectId,
        projectFiles,
        {
          name: projectId,
          source: 'howard-os'
        }
      );

      logger.info('[AITaskRunner] Proyecto sincronizado:', result);
      setSyncStatus('synced');

    } catch (error) {
      logger.error('[AITaskRunner] Error sincronizando:', error);
      setSyncStatus('error');
    }
  };

  const executeTask = async (taskTemplate, customDescription) => {
    setRunning(true);
    setSelectedTask(taskTemplate.id);

    const taskId = `task-${Date.now()}`;

    // Añadir tarea a la lista
    const newTask = {
      id: taskId,
      template: taskTemplate,
      description: customDescription || taskTemplate.description,
      status: 'running',
      progress: 0,
      startTime: Date.now(),
      result: null,
      error: null
    };

    setTasks(prev => [newTask, ...prev]);

    try {
      logger.info('[AITaskRunner] Ejecutando tarea:', taskTemplate.name);

      // Ejecutar con el agente
      const result = await agentApiClient.executeTask(
        {
          type: taskTemplate.type,
          description: customDescription || taskTemplate.description,
          files: projectFiles.map(f => f.path),
          options: {
            detailed: true,
            includeExamples: true
          }
        },
        projectId
      );

      logger.info('[AITaskRunner] Tarea completada:', result.status);

      // Actualizar tarea con resultado
      setTasks(prev => prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              status: result.status === 'completed' ? 'completed' : 'failed',
              progress: 100,
              endTime: Date.now(),
              duration: result.metadata?.duration || (Date.now() - t.startTime),
              result: result.result,
              toolsUsed: result.metadata?.toolsUsed || [],
              contextUsed: result.metadata?.contextUsed
            }
          : t
      ));

    } catch (error) {
      logger.error('[AITaskRunner] Error ejecutando tarea:', error);

      setTasks(prev => prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              status: 'failed',
              progress: 0,
              endTime: Date.now(),
              error: error.message
            }
          : t
      ));
    } finally {
      setRunning(false);
      setSelectedTask(null);
    }
  };

  const handleTaskClick = (template) => {
    if (running) return;
    executeTask(template, null);
  };

  const handleCustomTask = () => {
    if (!customPrompt.trim() || running) return;

    const customTemplate = {
      id: 'custom',
      name: 'Custom Task',
      description: customPrompt,
      icon: '✨',
      type: 'custom'
    };

    executeTask(customTemplate, customPrompt);
    setCustomPrompt('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h2 className="text-lg font-semibold">AI Task Runner</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${
              syncStatus === 'synced' ? 'bg-green-500' :
              syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
              syncStatus === 'error' ? 'bg-red-500' :
              'bg-gray-500'
            }`} />
            <p className="text-xs text-gray-400">
              {syncStatus === 'synced' ? `Synced (${projectFiles?.length || 0} files)` :
               syncStatus === 'syncing' ? 'Syncing project...' :
               syncStatus === 'error' ? 'Sync failed' :
               'Not synced'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Task Templates */}
        <div className="w-80 border-r border-gray-700 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Available Tasks
          </h3>

          <div className="space-y-2">
            {TASK_TEMPLATES.map(template => (
              <button
                key={template.id}
                onClick={() => handleTaskClick(template)}
                disabled={running || syncStatus !== 'synced'}
                className={`w-full text-left p-3 rounded-lg border transition ${
                  selectedTask === template.id
                    ? 'border-blue-500 bg-blue-900/30'
                    : running || syncStatus !== 'synced'
                    ? 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-750'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{template.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{template.name}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      ⏱️ {template.estimatedTime}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Custom Task */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              Custom Task
            </h3>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe what you want the AI to do..."
              disabled={running || syncStatus !== 'synced'}
              className="w-full bg-gray-800 text-white rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              rows={4}
            />
            <button
              onClick={handleCustomTask}
              disabled={running || !customPrompt.trim() || syncStatus !== 'synced'}
              className="mt-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition"
            >
              {running ? 'Running...' : 'Run Custom Task'}
            </button>
          </div>
        </div>

        {/* Task Results */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">
            Task History
          </h3>

          {tasks.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-xl mb-2">🤖</p>
              <p className="text-sm">
                Select a task to get started
              </p>
            </div>
          )}

          <div className="space-y-4">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`border rounded-lg p-4 ${
                  task.status === 'running'
                    ? 'border-blue-500 bg-blue-900/10'
                    : task.status === 'completed'
                    ? 'border-green-500 bg-green-900/10'
                    : 'border-red-500 bg-red-900/10'
                }`}
              >
                {/* Task Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{task.template.icon}</span>
                    <div>
                      <p className="font-medium">{task.template.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(task.startTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    task.status === 'running'
                      ? 'bg-blue-600'
                      : task.status === 'completed'
                      ? 'bg-green-600'
                      : 'bg-red-600'
                  }`}>
                    {task.status.toUpperCase()}
                  </span>
                </div>

                {/* Progress Bar */}
                {task.status === 'running' && (
                  <div className="mb-3 bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full animate-pulse"
                      style={{ width: '50%' }}
                    />
                  </div>
                )}

                {/* Result */}
                {task.result && (
                  <div className="mt-3 p-3 bg-black/30 rounded text-xs text-gray-300 max-h-40 overflow-y-auto font-mono">
                    {task.result}
                  </div>
                )}

                {/* Error */}
                {task.error && (
                  <div className="mt-3 p-3 bg-red-900/30 rounded text-xs text-red-300">
                    {task.error}
                  </div>
                )}

                {/* Metadata */}
                {task.duration && (
                  <div className="mt-3 text-xs text-gray-500">
                    ⏱️ {(task.duration / 1000).toFixed(1)}s
                    {task.toolsUsed?.length > 0 && ` • Tools: ${task.toolsUsed.join(', ')}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
