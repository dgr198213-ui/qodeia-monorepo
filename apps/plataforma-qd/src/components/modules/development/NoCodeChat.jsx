import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MessageSquare, Send, Bot, User, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { EditorBridge } from '../../../lib/editor-bridge';

const NoCodeChat = ({ onBack }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const messagesEndRef = useRef(null);

  const AGENT_URL = 'https://mi-agente-qode-ia.vercel.app/api/agent';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Obtener contexto del editor si existe
    const editorContext = EditorBridge.getInstance().getContext();

    try {
      const response = await fetch(AGENT_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input, 
          context: editorContext,
          sessionId: `platform-${user?.id || 'guest'}-${Date.now()}` 
        })
      });

      const data = await response.json();
      
      if (data.response) {
        // Parsear respuesta del agente en busca de bloques de código
        const codeMatch = data.response.match(/```(?:\w+)?\n([\s\S]+?)\n```/);
        if (codeMatch) {
          const code = codeMatch[1];
          // Insertar el código en el editor
          EditorBridge.getInstance().insertCode(code);
        }

        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response, 
          timestamp: new Date().toISOString() 
        }]);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Lo siento, no pude conectar con el Agente QodeIA. Por favor, verifica que las variables de entorno estén configuradas.", 
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#10221f] text-white">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#10221f]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-[#13ecc8] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#13ecc8]/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="text-[#13ecc8]" size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold">No-Code Chat</h2>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#13ecc8] animate-pulse"></span>
                <span className="text-[10px] text-[#13ecc8] font-bold uppercase tracking-wider">Agente Activo</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
          <Sparkles size={14} className="text-[#13ecc8]" />
          <span className="text-[10px] text-gray-400 font-medium">Powered by Howard OS</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-32">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto opacity-60">
            <div className="w-20 h-20 bg-[#13ecc8]/10 rounded-3xl flex items-center justify-center mb-6">
              <Bot size={40} className="text-[#13ecc8]" />
            </div>
            <h3 className="text-xl font-bold mb-2">¡Hola! Soy tu asistente No-Code</h3>
            <p className="text-sm text-gray-400">
              Puedo ayudarte a configurar tu proyecto, gestionar bases de datos o crear automatizaciones sin escribir una sola línea de código.
            </p>
            <div className="grid grid-cols-1 gap-2 mt-8 w-full">
              {['¿Cómo conecto mi GitHub?', 'Crea una tabla en Supabase', 'Explícame qué es Howard OS'].map((hint) => (
                <button 
                  key={hint}
                  onClick={() => { setInput(hint); }}
                  className="text-left px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs transition-colors"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user' ? 'bg-[#13ecc8] text-black' : 'bg-white/10 text-[#13ecc8]'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`rounded-2xl p-4 ${
                msg.role === 'user' 
                ? 'bg-[#13ecc8] text-black rounded-tr-none font-medium' 
                : msg.isError 
                  ? 'bg-red-500/10 border border-red-500/20 text-red-200 rounded-tl-none'
                  : 'bg-white/5 border border-white/10 text-gray-100 rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <span className={`text-[10px] mt-2 block opacity-50 ${msg.role === 'user' ? 'text-black/60' : 'text-gray-500'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-8 bg-gradient-to-t from-[#10221f] via-[#10221f] to-transparent">
        <form 
          onSubmit={sendMessage}
          className="max-w-4xl mx-auto relative group"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu instrucción aquí..."
            className="w-full bg-[#192233] border border-white/10 group-hover:border-[#13ecc8]/30 focus:border-[#13ecc8] rounded-2xl py-4 pl-6 pr-16 focus:outline-none transition-all shadow-2xl text-sm"
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-[#13ecc8] text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
        <p className="text-[10px] text-center text-gray-500 mt-4">
          El Agente QodeIA puede cometer errores. Verifica la información importante.
        </p>
      </div>
    </div>
  );
};

export default NoCodeChat;
