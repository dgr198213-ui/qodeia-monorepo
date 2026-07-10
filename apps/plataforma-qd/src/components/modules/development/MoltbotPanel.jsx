import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Bot, Send, Loader2, User } from 'lucide-react';
import { getAgentHeaders, AGENT_BASE_URL } from '../../../services/agentAuth';

/**
 * Moltbot Gateway (Fase 3B): conectado al MolbotSpecialist del agente.
 *
 * Antes era un stub de solo UI. Ahora es un chat que envía las peticiones a
 * POST /api/agent con contexto 'molbot' — el CEOOrchestrator delega en el
 * MolbotSpecialist (automatización de mensajería y bots).
 */
const MoltbotPanel = ({ onBack }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const response = await fetch(`${AGENT_BASE_URL}/api/agent`, {
        method: 'POST',
        headers: await getAgentHeaders(),
        body: JSON.stringify({
          message: `[MOLBOT] ${text}`,
          sessionId: 'molbot-panel',
        }),
      });
      if (!response.ok) throw new Error(`Error del agente: ${response.status}`);
      const data = await response.json();
      setMessages((m) => [...m, { role: 'assistant', content: data.response || 'Sin respuesta.' }]);
    } catch (error) {
      setMessages((m) => [...m, { role: 'assistant', content: `⚠️ ${error.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#10221f] text-white">
      <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-[#10221f]/90 backdrop-blur-md">
        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-[#13ecc8]">
          <ArrowLeft size={20} />
        </button>
        <div className="w-10 h-10 bg-[#13ecc8]/10 rounded-xl flex items-center justify-center">
          <Bot className="text-[#13ecc8]" size={20} />
        </div>
        <div>
          <h2 className="text-sm font-bold">Moltbot Gateway</h2>
          <p className="text-[10px] text-[#13ecc8] font-bold uppercase tracking-wider">MolbotSpecialist · vía Agente</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-12">
            <Bot size={40} className="mx-auto mb-3 opacity-40" />
            <p>Pídele a Moltbot que configure automatizaciones,</p>
            <p>bots de mensajería o flujos de notificaciones.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && <Bot size={16} className="text-[#13ecc8] mt-1 shrink-0" />}
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                m.role === 'user' ? 'bg-[#13ecc8]/15 border border-[#13ecc8]/20' : 'bg-white/5 border border-white/10'
              }`}
            >
              {m.content}
            </div>
            {m.role === 'user' && <User size={16} className="text-gray-400 mt-1 shrink-0" />}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Loader2 size={14} className="animate-spin" /> Moltbot está trabajando…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-white/5 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="P. ej.: crea un bot que avise en Telegram cuando falle el deploy…"
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#13ecc8]"
        />
        <button onClick={send} disabled={loading || !input.trim()} className="p-2 bg-[#13ecc8] text-black rounded-lg disabled:opacity-40">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default MoltbotPanel;
