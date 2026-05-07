import { Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#10221f] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="text-[#13ecc8] animate-spin mx-auto mb-4" size={48} />
        <p className="text-gray-400 text-sm">Cargando módulo...</p>
      </div>
    </div>
  );
}
