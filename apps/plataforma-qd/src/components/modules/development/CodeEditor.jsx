import { useState } from 'react';
import { ArrowLeft, Code, Save, Play, Sparkles } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { EditorBridge } from '../../../lib/editor-bridge';
import { useCodeStore } from '../../../store/codeStore';

const CodeEditor = ({ onBack }) => {
  const { currentProject } = useCodeStore();
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');

  function handleEditorDidMount(editor, monaco) {
    EditorBridge.getInstance().setEditor(editor, monaco);
    console.log("Editor Monaco montado y registrado en EditorBridge");
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
          
          <button className="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs transition-all">
            <Save size={14} />
            <span>Guardar</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-1.5 bg-[#13ecc8] text-black font-bold rounded-lg text-xs hover:scale-105 transition-all">
            <Play size={14} fill="currentColor" />
            <span>Ejecutar</span>
          </button>
        </div>
      </div>

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
        
        {/* Floating AI Indicator */}
        <div className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-[#13ecc8]/10 border border-[#13ecc8]/20 rounded-full backdrop-blur-md animate-pulse">
          <Sparkles size={14} className="text-[#13ecc8]" />
          <span className="text-[10px] text-[#13ecc8] font-bold uppercase tracking-wider">AI Bridge Active</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
