import { useState } from 'react';
import { ArrowLeft, Code, Save, Sparkles, Send, X, CornerDownLeft, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { EditorBridge } from '../../../lib/editor-bridge';
import { useCodeStore } from '../../../store/codeStore';
import { getAgentHeaders, AGENT_BASE_URL } from '../../../services/agentAuth';
import { supabase } from '../../../lib/supabase';

/**
 * Editor de Código conectado al Agente (Fase 3B).
 *
 * - "Pedir al Agente": envía la instrucción + el buffer actual como
 *   `editorContext` a POST /api/agent (el endpoint ya soportaba este campo
 *   desde el principio — estaba implementado y sin usar).
 * - La respuesta se muestra en un panel; si contiene un bloque de código,
 *   puede insertarse directamente en el editor vía EditorBridge.
 * - "Guardar": persiste el buffer en `project_files` del proyecto activo.
 */
const CodeEditor = ({ onBack }) => {
  const { currentProject } = useCodeStore();
  const [language, setLanguage] = useState('javascript');
  const [theme] = useState('vs-dark');
  const [askOpen, setAskOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [agentReply, setAgentReply] = useState(null); // { text, code }
  const [saveState, setSaveState] = useState('idle'); // idle | saving | saved | error

  function handleEditorDidMount(editor, monaco) {
    EditorBridge.getInstance().setEditor(editor, monaco);
  }

  /** Extrae el primer bloque ```...``` de una respuesta markdown. */
  function extractCode(text) {
    const match = /```[a-zA-Z]*\n([\s\S]*?)```/.exec(text || '');
    return match ? match[1] : null;
  }

  async function askAgent() {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setAgentReply(null);
    try {
      const bridge = EditorBridge.getInstance();
      const code = bridge?.editor?.getValue?.() || '';

      const response = await fetch(`${AGENT_BASE_URL}/api/agent`, {
        method: 'POST',
        headers: await getAgentHeaders(),
        body: JSON.stringify({
          message: prompt,
          projectId: currentProject?.id,
          context: { language, code },
        }),
      });
      if (!response.ok) throw new Error(`Error del agente: ${response.status}`);
      const data = await response.json();
      const text = data.response || 'El agente no devolvió respuesta.';
      setAgentReply({ text, code: extractCode(text) });
    } catch (error) {
      setAgentReply({ text: `⚠️ ${error.message}`, code: null });
    } finally {
      setLoading(false);
    }
  }

  function insertCode() {
    if (agentReply?.code) {
      // insertCode('replace') es la API oficial del bridge para código del agente
      EditorBridge.getInstance().insertCode(agentReply.code, 'replace');
      setAgentReply(null);
      setAskOpen(false);
      setPrompt('');
    }
  }

  async function saveFile() {
    if (!currentProject?.id || saveState === 'saving') return;
    setSaveState('saving');
    try {
      const code = EditorBridge.getInstance()?.editor?.getValue?.() || '';
      const path = `editor/${currentProject.id}.${language === 'python' ? 'py' : language === 'typescript' ? 'ts' : 'js'}`;
      const { error } = await supabase.from('project_files').upsert(
        {
          project_id: currentProject.id,
          path,
          content: code,
          language,
          size: code.length,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'project_id,path' }
      );
      if (error) throw error;
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 2000);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  }

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
              <Code className="text-[#13ecc8]" size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold">Editor de Código</h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                {currentProject?.name || 'Sin Proyecto'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#13ecc8]"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
          </select>

          <button
            onClick={saveFile}
            disabled={!currentProject?.id}
            title={currentProject?.id ? 'Guardar en el proyecto' : 'Selecciona un proyecto para guardar'}
            className="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs transition-all disabled:opacity-40"
          >
            <Save size={14} />
            <span>{saveState === 'saving' ? 'Guardando…' : saveState === 'saved' ? 'Guardado ✓' : saveState === 'error' ? 'Error' : 'Guardar'}</span>
          </button>

          <button
            onClick={() => setAskOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#13ecc8] text-black font-bold rounded-lg text-xs hover:scale-105 transition-all"
          >
            <Sparkles size={14} />
            <span>Pedir al Agente</span>
          </button>
        </div>
      </div>

      {/* Panel del Agente */}
      {askOpen && (
        <div className="p-4 border-b border-white/5 bg-[#0d1117] space-y-3">
          <div className="flex items-center gap-2">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && askAgent()}
              placeholder="P. ej.: genera una función que valide emails, refactoriza este código, explica qué hace…"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#13ecc8]"
            />
            <button
              onClick={askAgent}
              disabled={loading || !prompt.trim()}
              className="p-2 bg-[#13ecc8] text-black rounded-lg disabled:opacity-40"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
            <button onClick={() => { setAskOpen(false); setAgentReply(null); }} className="p-2 text-gray-400 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {agentReply && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-3 max-h-56 overflow-y-auto space-y-2">
              <pre className="text-xs whitespace-pre-wrap text-gray-200 font-mono">{agentReply.text}</pre>
              {agentReply.code && (
                <button
                  onClick={insertCode}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#13ecc8]/10 border border-[#13ecc8]/30 text-[#13ecc8] rounded-lg text-xs hover:bg-[#13ecc8]/20"
                >
                  <CornerDownLeft size={14} />
                  Insertar código en el editor
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          defaultValue="// Escribe tu código aquí o pídele al Agente que lo genere..."
          theme={theme}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 20 },
            fontFamily: "'Fira Code', monospace",
            fontLigatures: true,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
