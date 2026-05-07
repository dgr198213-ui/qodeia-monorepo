import { ArrowLeft, Plug } from 'lucide-react';

const Connectors = ({ onBack }) => {
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
              <Plug className="text-[#13ecc8]" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Conectores</h2>
              <p className="text-sm text-gray-400">Módulo en desarrollo</p>
            </div>
          </div>

          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">
              Este módulo está actualmente en desarrollo.
            </p>
            <p className="text-sm text-gray-500">
              Próximamente podrás gestionar integraciones y conectores desde aquí.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connectors;
