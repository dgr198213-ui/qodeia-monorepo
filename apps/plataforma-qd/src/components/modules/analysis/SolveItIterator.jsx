import { useState } from 'react';
import { ArrowLeft, Zap, Play, CheckCircle, AlertTriangle, Loader2, RotateCcw } from 'lucide-react';
import { getAgentHeaders, AGENT_BASE_URL } from '../../../services/agentAuth';

/**
 * SolveIt Iterator (Fase 3B): resolución iterativa de problemas vía Agente.
 *
 * Antes era un stub con datos falsos. Ahora describe un problema, el agente
 * lo descompone en iteraciones (mismo patrón JSON-estructurado que
 * BiasFirewall) y el panel muestra el plan paso a paso con su estado.
 */
const SolveItIterator = ({ onBack }) => {
  const [problem, setProblem] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [plan, setPlan] = useState(null); // { summary, iterations: [{step, action, expected, risk}] }
  const [errorMessage, setErrorMessage] = useState('');

  async function solve() {
    if (!problem.trim() || status === 'loading') return;
    setStatus('loading');
    setErrorMessage('');
    setPlan(null);
    try {
      const response = await fetch(`${AGENT_BASE_URL}/api/agent`, {
        method: 'POST',
        headers: await getAgentHeaders(),
        body: JSON.stringify({
          message: `Descompón el siguiente problema en un plan iterativo de resolución.
Responde ÚNICAMENTE con un JSON con esta estructura exacta:
{
  "summary": "<resumen del enfoque en una frase>",
  "iterations": [
    {"step": 1, "action": "<qué hacer>", "expected": "<resultado esperado>", "risk": "low|medium|high"}
  ]
}

Problema:
"""
${problem}
"""`,
        }),
      });
      if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
      const data = await response.json();
      const raw = (data.response || '').replace(/```json|```/g, '').trim();
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error('El agente no devolvió un plan válido');
      const parsed = JSON.parse(raw.slice(start, end + 1));
      if (!Array.isArray(parsed.iterations)) throw new Error('Plan sin iteraciones');
      setPlan(parsed);
      setStatus('done');
    } catch (error) {
      setErrorMessage(error.message);
      setStatus('error');
    }
  }

  const riskColor = (r) =>
    r === 'high' ? 'text-red-400' : r === 'medium' ? 'text-orange-400' : 'text-[#13ecc8]';

  return (
    <div className="min-h-screen bg-[#10221f] text-white pb-24">
      <div className="sticky top-0 bg-[#10221f]/90 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between z-10">
        <button onClick={onBack} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold">SolveIt Iterator</h2>
        <Zap size={24} className="text-orange-500" />
      </div>

      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        <div className="bg-[#192233] rounded-xl border border-white/5 p-4 space-y-3">
          <label className="text-sm font-bold text-gray-400 uppercase">Describe el problema</label>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            rows={4}
            placeholder="P. ej.: la app tarda 8 segundos en cargar el dashboard y los usuarios se van…"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={solve}
              disabled={status === 'loading' || !problem.trim()}
              className="flex items-center gap-2 bg-orange-500 text-[#10221f] font-bold px-4 py-2 rounded-lg text-sm disabled:opacity-40"
            >
              {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
              {status === 'loading' ? 'Iterando…' : 'Resolver'}
            </button>
            {plan && (
              <button
                onClick={() => { setPlan(null); setProblem(''); setStatus('idle'); }}
                className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-sm text-gray-300"
              >
                <RotateCcw size={14} /> Nuevo problema
              </button>
            )}
          </div>
        </div>

        {status === 'error' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-sm">
            <AlertTriangle size={18} className="text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {plan && (
          <>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
              <h3 className="font-bold text-orange-500 text-sm">Enfoque</h3>
              <p className="text-sm text-gray-300 mt-1">{plan.summary}</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-400 uppercase">
                Plan iterativo · {plan.iterations.length} pasos
              </h4>
              <div className="bg-[#192233] rounded-xl border border-white/5 divide-y divide-white/5">
                {plan.iterations.map((it, i) => (
                  <div key={i} className="p-4 flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 text-xs font-bold shrink-0">
                      {it.step ?? i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{it.action}</p>
                      {it.expected && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <CheckCircle size={12} className="text-[#13ecc8]" /> {it.expected}
                        </p>
                      )}
                      {it.risk && (
                        <p className={`text-[10px] uppercase tracking-wider mt-1 font-bold ${riskColor(it.risk)}`}>
                          riesgo {it.risk}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SolveItIterator;
