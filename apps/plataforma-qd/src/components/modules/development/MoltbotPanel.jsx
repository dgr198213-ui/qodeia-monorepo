import { ArrowLeft, Bot } from 'lucide-react';

const MoltbotPanel = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#10221f] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-[#13ecc8] transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Volver al Dashboard</span>
        </button>

        <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#13ecc8]/10 rounded-xl flex items-center justify-center">
              <Bot className="text-[#13ecc8]" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Moltbot Gateway</h2>
              <p className="text-sm text-[#13ecc8] font-bold uppercase tracking-wider">Módulo Activo v4.0</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#13ecc8]/30 transition-all">
              <h3 className="font-bold mb-2">Automatización de Tareas</h3>
              <p className="text-sm text-gray-400 mb-4">Configura flujos de trabajo automáticos para tus proyectos.</p>
              <button className="w-full py-2 bg-[#13ecc8] text-black rounded-lg font-bold text-sm">Configurar Flujo</button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-[#13ecc8]/30 transition-all">
              <h3 className="font-bold mb-2">Integraciones API</h3>
              <p className="text-sm text-gray-400 mb-4">Conecta con Make, Zapier, Slack y más de 1000 aplicaciones.</p>
              <button className="w-full py-2 border border-[#13ecc8] text-[#13ecc8] rounded-lg font-bold text-sm">Gestionar APIs</button>
            </div>
          </div>

          <div className="bg-black/20 rounded-xl p-6 border border-white/5">
            <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-gray-500">Actividad Reciente</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                <span className="text-gray-300">Sincronización GitHub -> Slack</span>
                <span className="text-[#13ecc8]">Activo</span>
              </div>
              <div className="flex items-center justify-between text-sm border-b border-white/5 pb-2">
                <span className="text-gray-300">Backup Semanal Supabase</span>
                <span className="text-[#13ecc8]">Completado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoltbotPanel;
