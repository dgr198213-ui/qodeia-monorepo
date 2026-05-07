'use client';

import { useState, useEffect, useRef } from 'react';
import { getOperativeSupabase } from '@/lib/supabase';
import { API_CONFIG } from '@/lib/api-config';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface AgentChatProps {
  projectId?: string;
  className?: string;
}

export default function AgentChat({ projectId, className = '' }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = getOperativeSupabase();

  useEffect(() => {
    // Generar session ID único
    const generateSessionId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setSessionId(`${user.id}-${Date.now()}`);
      }
    };
    generateSessionId();
  }, [supabase]);

  useEffect(() => {
    // Auto-scroll al último mensaje
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Obtener sesión actual
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.');
      }

      // Enviar mensaje al agente a través del proxy local
      const response = await fetch(API_CONFIG.ENDPOINTS.AGENT_CHAT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          message: input,
          sessionId: sessionId,
          projectId: projectId,
          userId: session.user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al comunicarse con el agente');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Error al enviar el mensaje');

      // Agregar mensaje de error
      const errorMessage: Message = {
        role: 'assistant',
        content: `Lo siento, ocurrió un error: ${err.message}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-full bg-qodeia-dark-800 rounded-lg shadow-2xl ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-qodeia-blue-600 to-qodeia-mint-600 rounded-t-lg">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          Agente QodeIA
        </h2>
        <p className="text-sm text-white/80 mt-1">
          Tu asistente inteligente para desarrollo y gestión de proyectos
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            <p className="text-lg mb-2">👋 ¡Hola! Soy el Agente QodeIA</p>
            <p className="text-sm">
              Puedo ayudarte con:
            </p>
            <ul className="text-sm mt-2 space-y-1">
              <li>• Gestión de repositorios en GitHub</li>
              <li>• Consultas y operaciones en Supabase</li>
              <li>• Gestión de deployments en Vercel</li>
              <li>• Análisis de código y proyectos</li>
            </ul>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-qodeia-blue-500 to-qodeia-mint-500 text-white'
                  : 'bg-qodeia-dark-700 text-gray-100 border border-qodeia-blue-500/20'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">
                  {msg.role === 'user' ? '👤' : '🤖'}
                </span>
                <div className="flex-1">
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-qodeia-dark-700 rounded-lg px-4 py-3 border border-qodeia-blue-500/20">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-qodeia-mint-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-qodeia-mint-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-qodeia-mint-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-6 py-2 bg-red-500/10 border-t border-red-500/20">
          <p className="text-sm text-red-400">⚠️ {error}</p>
        </div>
      )}

      {/* Input Area */}
      <div className="px-6 py-4 bg-qodeia-dark-900 rounded-b-lg border-t border-qodeia-blue-500/20">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-4 py-3 bg-qodeia-dark-700 text-white rounded-lg border border-qodeia-blue-500/30 focus:border-qodeia-mint-500 focus:outline-none focus:ring-2 focus:ring-qodeia-mint-500/20 transition-all"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-qodeia-blue-500 to-qodeia-mint-500 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Enviar
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </span>
            )}
          </button>
        </div>

        {projectId && (
          <p className="text-xs text-gray-500 mt-2">
            📁 Contexto del proyecto activo
          </p>
        )}
      </div>
    </div>
  );
}
