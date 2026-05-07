/**
 * Plataforma-qd/src/components/modules/development/NoCodeChat/NoCodeChat.jsx
 * 
 * ACTUALIZADO: Usar AgentApiClient con contexto CME
 */

import React, { useState, useEffect, useRef } from 'react';
import agentApiClient from '@/services/AgentApiClient';
import { logger } from '@/utils/logger';

export default function NoCodeChat({ projectId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId] = useState(() => `conv-${Date.now()}`);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Añadir mensaje del usuario
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setLoading(true);

    try {
      logger.info('[NoCodeChat] Enviando mensaje al agente...');

      // Llamar al agente con contexto CME
      const response = await agentApiClient.chat(
        userMessage,
        projectId,
        conversationId
      );

      // Si es streaming, procesar chunks
      if (response.stream) {
        const assistantMessageId = Date.now();
        let fullResponse = '';

        // Añadir mensaje vacío del asistente
        setMessages(prev => [...prev, {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          streaming: true
        }]);

        // Procesar stream
        for await (const chunk of response) {
          if (chunk.type === 'chunk') {
            fullResponse += chunk.content;

            // Actualizar mensaje en tiempo real
            setMessages(prev => prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: fullResponse }
                : msg
            ));
          } else if (chunk.type === 'error') {
            throw new Error(chunk.error);
          }
        }

        // Finalizar streaming
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, streaming: false }
            : msg
        ));

      } else {
        // Respuesta no streaming (fallback)
        setMessages(prev => [...prev, {
          id: Date.now(),
          role: 'assistant',
          content: response,
          timestamp: new Date()
        }]);
      }

    } catch (error) {
      logger.error('[NoCodeChat] Error:', error);

      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: `❌ Error: ${error.message}`,
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h2 className="text-lg font-semibold">AI Assistant</h2>
          <p className="text-sm text-gray-400">
            Powered by Context Memory Engine
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-xl mb-2">👋 Hi! I'm your AI assistant</p>
            <p className="text-sm">
              I have full context of your project. Ask me anything!
            </p>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : msg.error
                  ? 'bg-red-900/50 text-red-200'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              {msg.streaming && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-400">Typing...</span>
                </div>
              )}
              
              <p className="whitespace-pre-wrap break-words">
                {msg.content}
              </p>

              <p className="text-xs text-gray-400 mt-2">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {loading && !messages.some(m => m.streaming) && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your project..."
            disabled={loading}
            className="flex-1 bg-gray-800 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition"
          >
            {loading ? '⏳' : '📤'}
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Shift + Enter for new line • Enter to send
        </p>
      </div>
    </div>
  );
}
