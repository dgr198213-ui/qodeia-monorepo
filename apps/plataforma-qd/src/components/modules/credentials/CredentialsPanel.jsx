import { useState, useEffect } from 'react';
import { ArrowLeft, Shield, Github, Zap, MessageSquare, Cloud, Database, Eye, EyeOff } from 'lucide-react';
import { useCredentialsStore } from '@/store/credentialsStore';
import AutoCredentialManager from './components/AutoCredentialManager';

const ICONS = {
  Github, Zap, MessageSquare, Cloud, Database
};

const CredentialsPanel = ({ onBack }) => {
  const { credentials, loadCredentials, updateCredential, clearAll } = useCredentialsStore();
  const [editingId, setEditingId] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [showValue, setShowValue] = useState(false);

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials]);

  const handleSave = (id) => {
    if (tempValue.trim()) {
      updateCredential(id, tempValue.trim());
      setEditingId(null);
      setTempValue('');
      setShowValue(false);
    }
  };

  const handleEdit = (cred) => {
    setEditingId(cred.id);
    setTempValue(cred.value);
    setShowValue(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setTempValue('');
    setShowValue(false);
  };

  const handleClearAll = () => {
    if (confirm('¿Eliminar todas las credenciales? Esta acción no se puede deshacer.')) {
      clearAll();
    }
  };

  return (
    <div className="min-h-screen bg-[#10221f] text-white pb-24">
      <div className="sticky top-0 bg-[#10221f]/90 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between z-10">
        <button onClick={onBack} className="text-white hover:text-[#13ecc8] transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold">Credenciales & Accesos</h2>
        <button
          onClick={handleClearAll}
          className="text-xs text-red-400 hover:text-red-300"
        >
          Limpiar
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Nuevo Asistente de Configuración Rápida */}
        <AutoCredentialManager />

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="text-blue-500 mt-1 flex-shrink-0" size={20} />
            <div>
              <p className="text-sm font-bold text-white mb-1">Seguridad de Credenciales</p>
              <p className="text-xs text-gray-400">
                Cifrado AES-256 • {import.meta.env.VITE_SUPABASE_URL ? 'Sincronización en la nube activa' : 'Almacenamiento local (Solo dispositivo)'}
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Plataformas Configuradas
        </h3>

        {credentials.map(cred => {
          const Icon = ICONS[cred.icon] || Github;
          const isEditing = editingId === cred.id;

          return (
            <div key={cred.id} className="bg-[#192233] rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${cred.configured ? 'bg-emerald-500/10' : 'bg-gray-500/10'} flex items-center justify-center`}>
                    <Icon className={cred.configured ? 'text-emerald-500' : 'text-gray-500'} size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{cred.name}</h4>
                    <p className="text-xs text-gray-400">
                      {cred.configured ? '✓ Configurado' : 'No configurado'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(cred)}
                  className="text-[#13ecc8] text-sm font-medium hover:text-[#0fc9a8] transition-colors"
                >
                  {cred.configured ? 'Editar' : 'Configurar'}
                </button>
              </div>

              {isEditing && (
                <div className="space-y-3 mt-3 pt-3 border-t border-white/5 animate-fadeIn">
                  <div className="relative">
                    <input
                      type={showValue ? "text" : "password"}
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      placeholder={`Ingresa tu ${cred.name} token`}
                      className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-3 py-2 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#13ecc8]/50 transition-colors"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowValue(!showValue)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showValue ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(cred.id)}
                      disabled={!tempValue.trim()}
                      className="flex-1 bg-[#13ecc8] text-[#10221f] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#0fc9a8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 border border-white/10 rounded-lg text-sm hover:bg-white/5 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CredentialsPanel;
