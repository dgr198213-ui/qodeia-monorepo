import { useState, useEffect } from 'react';
import { Shield, Folder, Search, Key, Code, MessageSquare, Link2, Radar, Zap, LogOut, Bot, Users, BookOpen } from 'lucide-react';
import { MODULES } from '../../constants/modules';
import SystemHealth from './SystemHealth';
import { useAuthStore } from '../../store/authStore';

const ModuleCard = ({ icon, title, description, color, onClick }) => {
  const colors = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    teal: 'text-[#13ecc8] bg-[#13ecc8]/10 border-[#13ecc8]/20',
    cyan: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-[#192233] rounded-xl p-4 border border-white/5 hover:border-[#13ecc8]/30 transition-all text-left"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-white mb-1">{title}</h4>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
    </button>
  );
};

const Dashboard = ({ onNavigate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, signOut } = useAuthStore();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#10221f] text-white pb-24">
      <div className="sticky top-0 z-10 bg-[#10221f]/90 backdrop-blur-md border-b border-white/5 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#13ecc8]/10 rounded-xl flex items-center justify-center">
              <Shield className="text-[#13ecc8]" size={24} />
            </div>
            <div>
              <div className="text-xs text-[#13ecc8] font-bold">QODEIA HOWARD</div>
              <div className="text-sm text-white/60">{currentTime.toLocaleTimeString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Usuario</span>
                <span className="text-xs text-white/80">{user.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-[#13ecc8]/10 px-3 py-1 rounded-full border border-[#13ecc8]/20">
              <div className="w-2 h-2 rounded-full bg-[#13ecc8] animate-pulse"></div>
              <span className="text-xs text-[#13ecc8] font-bold">SISTEMA ACTIVO</span>
            </div>
            {user && (
              <button
                onClick={signOut}
                className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#13ecc8]" size={20} />
          <input
            type="text"
            placeholder="Buscar herramientas, proyectos, comandos..."
            className="w-full bg-[#192233] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#13ecc8]/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 mb-6">
        <div className="bg-[#192233] rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-emerald-500" size={18} />
            <span className="text-xs text-gray-400">Bias Firewall</span>
          </div>
          <div className="text-2xl font-bold text-white">98%</div>
          <div className="text-xs text-emerald-500">Safe</div>
        </div>
        <div className="bg-[#192233] rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <Folder className="text-[#13ecc8]" size={18} />
            <span className="text-xs text-gray-400">Proyectos</span>
          </div>
          <div className="text-2xl font-bold text-white">12</div>
          <div className="text-xs text-[#13ecc8]">Activos</div>
        </div>
      </div>

      <div className="px-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Desarrollo & Herramientas</h3>
        <div className="space-y-3">
          <ModuleCard
            icon={<Key size={24} />}
            title="Credenciales"
            description="Gestiona APIs, tokens y accesos"
            color="purple"
            onClick={() => onNavigate(MODULES.CREDENTIALS)}
          />
          <ModuleCard
            icon={<Code size={24} />}
            title="Editor de Código"
            description="IDE completo con terminal integrada"
            color="cyan"
            onClick={() => onNavigate(MODULES.CODE_EDITOR)}
          />
          <ModuleCard
            icon={<MessageSquare size={24} />}
            title="No-Code Chat"
            description="Desarrollo por conversación con IA"
            color="teal"
            onClick={() => onNavigate(MODULES.NO_CODE_CHAT)}
          />
          <ModuleCard
            icon={<Link2 size={24} />}
            title="Conectores"
            description="Integra GitHub, APIs y servicios"
            color="orange"
            onClick={() => onNavigate(MODULES.CONNECTORS)}
          />
          <ModuleCard
            icon={<Folder size={24} />}
            title="Proyectos & Documentos"
            description="Gestión completa de archivos"
            color="teal"
            onClick={() => onNavigate(MODULES.PROJECTS)}
          />
          <ModuleCard
            icon={<Bot size={24} />}
            title="Moltbot Gateway"
            description="AI Task Automation & Orchestration"
            color="purple"
            onClick={() => onNavigate(MODULES.MOLTBOT)}
          />
          <ModuleCard
            icon={<Bot size={24} />}
            title="AI Task Runner"
            description="Automatización inteligente con Claude"
            color="purple"
            onClick={() => onNavigate(MODULES.AI_TASKS)}
          />
          <ModuleCard
            icon={<Search size={24} />}
            title="Context Memory"
            description="Motor de memoria persistente inspirado en MiniMax"
            color="teal"
            onClick={() => onNavigate(MODULES.CONTEXT_MEMORY)}
          />
          <ModuleCard
            icon={<Radar size={24} />}
            title="Memory Visualizer"
            description="Visualización del estado de memoria"
            color="cyan"
            onClick={() => onNavigate(MODULES.MEMORY_VISUALIZER)}
          />
        </div>

        <SystemHealth />

        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 mt-6">Análisis & Auditoría</h3>
        <div className="space-y-3">
          <ModuleCard
            icon={<Shield size={24} />}
            title="Bias Firewall"
            description="Auditoría de sesgos en tiempo real"
            color="emerald"
            onClick={() => onNavigate(MODULES.BIAS_FIREWALL)}
          />
          <ModuleCard
            icon={<Radar size={24} />}
            title="Hype Detector"
            description="Filtra ruido de señal en noticias"
            color="teal"
            onClick={() => onNavigate(MODULES.HYPE_DETECTOR)}
          />
          <ModuleCard
            icon={<Zap size={24} />}
            title="SolveIt Iterator"
            description="Gestión iterativa pragmática"
            color="orange"
            onClick={() => onNavigate(MODULES.SOLVEIT)}
          />
        </div>

        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 mt-6">Comunidad & Recursos</h3>
        <div className="space-y-3">
          <ModuleCard
            icon={<Users size={24} />}
            title="Comunidad"
            description="Conecta con otros builders hispanohablantes"
            color="teal"
            onClick={() => onNavigate(MODULES.COMMUNITY)}
          />
          <ModuleCard
            icon={<BookOpen size={24} />}
            title="Recursos"
            description="Guías, tutoriales y snippets compartidos"
            color="cyan"
            onClick={() => onNavigate(MODULES.RESOURCES)}
          />
        </div>
      </div>

      <div className="px-4 mt-6">
        <div className="bg-[#192233] rounded-xl p-4 border border-white/5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ecosistema QodeIA</h3>
          <div className="flex flex-col md:flex-row gap-2 text-sm">
            <a className="text-[#13ecc8] hover:underline" href="https://mi-agente-qode-ia.vercel.app" target="_blank" rel="noreferrer">QodeIA Agent</a>
            <a className="text-[#13ecc8] hover:underline" href="https://web-qodeia.vercel.app" target="_blank" rel="noreferrer">QodeIA Community</a>
            <a className="text-[#13ecc8] hover:underline" href="https://plataforma-qd.vercel.app" target="_blank" rel="noreferrer">QodeIA Howard</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
