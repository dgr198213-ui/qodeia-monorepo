'use client';

/**
 * QodeIA Enhanced Agent Panel
 * Panel de agente mejorado para Howard OS con integración CME
 */

import { useState, useEffect, useRef } from 'react';
import {
  Send,
  Loader2,
  Bot,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Sparkles,
  FileCode2,
  GitBranch,
  Terminal,
  AlertCircle,
  Info,
  Zap,
} from 'lucide-react';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    type?: 'code' | 'file' | 'command' | 'error' | 'info';
    file?: string;
    line?: number;
  };
}

interface PlanStep {
  id: string;
  action: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  result?: string;
  duration?: number;
}

interface Plan {
  id: string;
  title: string;
  steps: PlanStep[];
  status: 'created' | 'executing' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

interface ContextState {
  files: string[];
  imports: string[];
  activeFile?: string;
}

// Context Indicator Component
function ContextIndicator({ context }: { context: ContextState }) {
  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <FileCode2 className="w-3 h-3 text-blue-400" />
          <span className="text-gray-400">{context.files.length} archivos</span>
        </div>
        <div className="flex items-center gap-2">
          <GitBranch className="w-3 h-3 text-green-400" />
          <span className="text-gray-400">{context.imports.length} imports</span>
        </div>
        {context.activeFile && (
          <div className="flex items-center gap-2">
            <span className="text-blue-400">📄</span>
            <span className="text-gray-300 truncate max-w-[200px]">{context.activeFile}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const getIcon = () => {
    if (isUser) return <User className="w-4 h-4" />;
    if (isSystem) return <Info className="w-4 h-4" />;
    if (message.metadata?.type === 'code') return <FileCode2 className="w-4 h-4" />;
    if (message.metadata?.type === 'command') return <Terminal className="w-4 h-4" />;
    if (message.metadata?.type === 'error') return <AlertCircle className="w-4 h-4" />;
    return <Bot className="w-4 h-4" />;
  };

  const getColorClass = () => {
    if (isUser) return 'bg-blue-600 text-white';
    if (isSystem) return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    if (message.metadata?.type === 'error') return 'bg-red-100 text-red-800 border border-red-200';
    return 'bg-gray-700 text-white';
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-green-500' : isSystem ? 'bg-yellow-500' : 'bg-blue-500'} ${isUser || isSystem ? '' : 'text-white'}`}>
        {getIcon()}
      </div>
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block p-4 rounded-2xl ${getColorClass()} ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
          {message.metadata?.type === 'code' && (
            <div className="mb-2 px-2 py-1 bg-black/20 rounded text-xs font-mono">
              {message.metadata.file}
              {message.metadata.line && `:${message.metadata.line}`}
            </div>
          )}
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(message.timestamp).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

// Plan Step Item Component
function PlanStepItem({ step, index, isExpanded, onToggle }: { step: PlanStep; index: number; isExpanded: boolean; onToggle: () => void }) {
  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'skipped': return <Pause className="w-5 h-5 text-gray-400" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className={`border-l-4 rounded-r-lg overflow-hidden ${step.status === 'completed' ? 'border-l-green-500 bg-green-50' : step.status === 'failed' ? 'border-l-red-500 bg-red-50' : step.status === 'running' ? 'border-l-blue-500 bg-blue-50' : 'border-l-gray-200'}`}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 hover:bg-black/5 transition-colors">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step.status === 'completed' ? 'bg-green-500 text-white' : step.status === 'running' ? 'bg-blue-500 text-white animate-pulse' : step.status === 'failed' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
          {index + 1}
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium text-gray-900">{step.action}</p>
          <p className="text-sm text-gray-500">{step.description}</p>
        </div>
        {getStatusIcon()}
        {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>
      {isExpanded && step.result && (
        <div className="px-4 pb-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Resultado:</p>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">{step.result}</pre>
            {step.duration && <p className="text-xs text-gray-500 mt-2">Duración: {step.duration}ms</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// Main Enhanced Agent Panel Component
export function EnhancedAgentPanel({ projectId }: { projectId: string }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [context, setContext] = useState<ContextState>({
    files: ['src/App.tsx', 'src/components/Button.tsx', 'src/hooks/useAuth.ts'],
    imports: ['React', 'useState', 'useEffect'],
    activeFile: 'src/App.tsx',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `He procesado tu solicitud. El Context Memory Engine ha encontrado ${context.files.length} archivos relevantes y ${context.imports.length} dependencias relacionadas.`,
        timestamp: new Date().toISOString(),
        metadata: { type: 'info' },
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Create plan from goal
  const handleCreatePlan = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);

    setTimeout(() => {
      const newPlan: Plan = {
        id: `plan-${Date.now()}`,
        title: 'Plan generado por IA',
        steps: [
          { id: 'step-1', action: 'Analizar código existente', description: 'Revisar estructura del proyecto y dependencias', status: 'pending' },
          { id: 'step-2', action: 'Implementar autenticación', description: 'Agregar sistema de login con Supabase', status: 'pending' },
          { id: 'step-3', action: 'Crear componentes UI', description: 'Desarrollar componentes reutilizables', status: 'pending' },
          { id: 'step-4', action: 'Integrar API', description: 'Conectar frontend con backend', status: 'pending' },
        ],
        status: 'created',
        createdAt: new Date().toISOString(),
      };

      setCurrentPlan(newPlan);
      setMessages((prev) => [
        ...prev,
        { id: `msg-${Date.now()}`, role: 'assistant', content: `He creado un plan con ${newPlan.steps.length} pasos. Revísalo y decide cómo deseas ejecutarlo.`, timestamp: new Date().toISOString(), metadata: { type: 'info' } },
      ]);
      setIsLoading(false);
    }, 2000);
  };

  // Execute plan
  const handleExecutePlan = async (mode: 'dry-run' | 'apply') => {
    if (!currentPlan) return;

    setIsExecuting(true);
    setCurrentPlan({ ...currentPlan, status: 'executing' });

    for (let i = 0; i < currentPlan.steps.length; i++) {
      const step = currentPlan.steps[i];

      setCurrentPlan((prev) => {
        if (!prev) return prev;
        const updatedSteps = [...prev.steps];
        updatedSteps[i] = { ...updatedSteps[i], status: 'running' };
        return { ...prev, steps: updatedSteps };
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const success = Math.random() > 0.2;

      setCurrentPlan((prev) => {
        if (!prev) return prev;
        const updatedSteps = [...prev.steps];
        updatedSteps[i] = {
          ...updatedSteps[i],
          status: success ? 'completed' : 'failed',
          result: success ? `Paso completado exitosamente.\n\nArchivos modificados:\n- src/components/NuevoComponente.tsx\n- src/hooks/useAuth.ts` : 'Error: No se pudo completar el paso.\n\nCausa: Conflicto con dependencias existentes.',
          duration: Math.floor(Math.random() * 2000) + 500,
        };
        return { ...prev, steps: updatedSteps };
      });
    }

    setCurrentPlan((prev) => {
      if (!prev) return prev;
      return { ...prev, status: 'completed', completedAt: new Date().toISOString() };
    });

    setMessages((prev) => [
      ...prev,
      { id: `msg-${Date.now()}`, role: 'assistant', content: `El plan se ha ${currentPlan.steps.every((s) => s.status === 'completed') ? 'completado exitosamente' : 'ejecutado con algunos errores'}.`, timestamp: new Date().toISOString(), metadata: { type: 'info' } },
    ]);

    setIsExecuting(false);
  };

  // Cancel execution
  const handleCancel = () => {
    if (currentPlan) setCurrentPlan({ ...currentPlan, status: 'cancelled' });
    setIsExecuting(false);
  };

  // Reset plan
  const handleReset = () => {
    setCurrentPlan(null);
    setExpandedStep(null);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <ContextIndicator context={context} />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Asistente IA con Context Memory Engine</h3>
            <p className="text-gray-400 max-w-md">Describe lo que quieres construir y el agente analizará tu proyecto para generar un plan de acción inteligente.</p>
          </div>
        )}

        {messages.map((message) => <MessageBubble key={message.id} message={message} />)}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white"><Bot className="w-4 h-4" /></div>
            <div className="bg-gray-700 text-white p-4 rounded-2xl rounded-tl-sm"><Loader2 className="w-5 h-5 animate-spin" /></div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Plan Section */}
      {currentPlan && (
        <div className="border-t border-gray-700 bg-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold text-white">{currentPlan.title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${currentPlan.status === 'completed' ? 'bg-green-500/20 text-green-400' : currentPlan.status === 'executing' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                {currentPlan.status}
              </span>
            </div>
            <div className="flex gap-2">
              {currentPlan.status === 'created' && (
                <>
                  <button onClick={() => handleExecutePlan('dry-run')} disabled={isExecuting} className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-1"><Play className="w-4 h-4" />Simular</button>
                  <button onClick={() => handleExecutePlan('apply')} disabled={isExecuting} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 flex items-center gap-1"><Zap className="w-4 h-4" />Ejecutar</button>
                </>
              )}
              {(currentPlan.status === 'executing' || isExecuting) && (
                <button onClick={handleCancel} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-500 flex items-center gap-1"><XCircle className="w-4 h-4" />Cancelar</button>
              )}
              {(currentPlan.status === 'completed' || currentPlan.status === 'cancelled' || currentPlan.status === 'failed') && (
                <button onClick={handleReset} className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-1"><RotateCcw className="w-4 h-4" />Nuevo Plan</button>
              )}
            </div>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {currentPlan.steps.map((step, index) => (
              <PlanStepItem key={step.id} step={step} index={index} isExpanded={expandedStep === step.id} onToggle={() => setExpandedStep(expandedStep === step.id ? null : step.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyPress} placeholder="Describe tu objetivo o pregunta..." className="w-full bg-gray-800 text-white placeholder-gray-500 rounded-xl px-4 py-3 pr-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700" rows={1} />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <button onClick={handleCreatePlan} disabled={!input.trim() || isLoading} className="p-2 text-green-400 hover:text-green-300 disabled:opacity-50" title="Crear Plan"><Sparkles className="w-5 h-5" /></button>
            </div>
          </div>
          <button onClick={handleSend} disabled={!input.trim() || isLoading} className="px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2"><Send className="w-5 h-5" /></button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Presiona Enter para enviar, Shift+Enter para nueva línea</p>
      </div>
    </div>
  );
}

export default EnhancedAgentPanel;
