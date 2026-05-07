import { ArrowLeft, Zap, Play, CheckCircle, AlertTriangle } from 'lucide-react';

const SolveItIterator = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#10221f] text-white pb-24">
      <div className="sticky top-0 bg-[#10221f]/90 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between z-10">
        <button onClick={onBack} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold">SolveIt Iterator</h2>
        <Zap size={24} className="text-orange-500" />
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-orange-500">Sprint Actual: Alpha</h3>
            <p className="text-xs text-gray-400">Iteración #14 en curso</p>
          </div>
          <button className="bg-orange-500 text-[#10221f] p-2 rounded-lg">
            <Play size={20} fill="currentColor" />
          </button>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-gray-400 uppercase">Estado de Tareas</h4>
          <div className="bg-[#192233] rounded-xl border border-white/5 divide-y divide-white/5">
            {[
              { title: 'Optimización de Latencia', status: 'done', icon: <CheckCircle size={16} className="text-[#13ecc8]" /> },
              { title: 'Refactorización de Auth', status: 'pending', icon: <div className="w-4 h-4 rounded-full border-2 border-orange-500" /> },
              { title: 'Bug: Memory Leak', status: 'critical', icon: <AlertTriangle size={16} className="text-red-500" /> }
            ].map((task, i) => (
              <div key={i} className="p-4 flex items-center justify-between">
                <span className="text-sm">{task.title}</span>
                {task.icon}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#192233] rounded-xl border border-white/5 p-4">
          <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Curva de Convergencia</h4>
          <div className="h-32 flex items-end gap-2 px-2">
            {[90, 85, 80, 70, 65, 50, 45, 30].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-orange-500/30 border-t-2 border-orange-500 rounded-t-sm"
                  style={{ height: `${v}%` }}
                ></div>
                <span className="text-[8px] text-gray-600">i{i+1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolveItIterator;
