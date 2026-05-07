import { useState, useEffect } from 'react';
import { Key, Upload, Zap, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { useCredentialsStore } from '@/store/credentialsStore';

const AutoCredentialManager = () => {
  const { addCredential } = useCredentialsStore();
  const [detectedServices, setDetectedServices] = useState([]);

  // Simulación de detección de servicios (en entorno web real usaríamos APIs específicas o inputs)
  const detectServices = () => {
    const services = [];
    // En un entorno local real, podríamos intentar leer variables de entorno si el backend lo permite
    // Aquí simulamos la detección para la interfaz
    if (import.meta.env.VITE_APP_MODE === 'local') {
      services.push({ id: 'github', name: 'GitHub', icon: '🐙' });
      services.push({ id: 'openai', name: 'OpenAI', icon: '🤖' });
    }
    setDetectedServices(services);
  };

  const handleQuickImport = (service) => {
    const value = prompt(`Introduce tu API Key / Token para ${service.name}:`);
    if (value) {
      addCredential({
        name: service.name,
        username: 'default',
        password: value,
        category: 'API Keys',
        notes: `Importado mediante asistente rápido para ${service.name}`
      });
      alert(`✅ Credencial para ${service.name} guardada con éxito.`);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const creds = JSON.parse(event.target.result);
        // Lógica para importar múltiples credenciales
        Object.entries(creds).forEach(([key, data]) => {
          addCredential({
            name: key.toUpperCase(),
            username: data.username || 'default',
            password: data.token || data.api_key || '',
            category: 'Imported',
            notes: data.notes || 'Importado desde archivo JSON'
          });
        });
        alert('✅ Credenciales importadas correctamente desde el archivo.');
      } catch (err) {
        alert('❌ Error al procesar el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  useEffect(() => {
    detectServices();
  }, []);

  return (
    <div className="bg-[#192233] border border-white/10 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#13ecc8]/10 rounded-lg">
            <Zap size={20} className="text-[#13ecc8]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Asistente de Configuración Rápida</h3>
            <p className="text-[10px] text-gray-400">Configura tus credenciales en segundos</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <ShieldCheck size={12} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Modo Local Seguro</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Detección Automática */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Check size={12} /> Servicios Detectados
          </h4>
          <div className="space-y-2">
            {detectedServices.length > 0 ? (
              detectedServices.map(service => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-[#0d1117] border border-white/5 rounded-lg group hover:border-[#13ecc8]/30 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{service.icon}</span>
                    <span className="text-xs font-medium text-gray-300">{service.name}</span>
                  </div>
                  <button
                    onClick={() => handleQuickImport(service)}
                    className="text-[10px] font-bold text-[#13ecc8] hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    CONFIGURAR
                  </button>
                </div>
              ))
            ) : (
              <div className="p-3 bg-[#0d1117] border border-dashed border-white/10 rounded-lg text-center">
                <p className="text-[10px] text-gray-500 italic">No se detectaron servicios activos</p>
              </div>
            )}
          </div>
        </div>

        {/* Importación Manual/Archivo */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Upload size={12} /> Importación Masiva
          </h4>
          <div className="grid grid-cols-1 gap-2">
            <label className="flex flex-col items-center justify-center p-4 bg-[#0d1117] border border-dashed border-white/10 rounded-lg cursor-pointer hover:border-[#13ecc8]/30 transition-all group">
              <Upload size={20} className="text-gray-500 group-hover:text-[#13ecc8] mb-2" />
              <span className="text-[10px] text-gray-400 group-hover:text-white">Subir credentials.json</span>
              <input type="file" accept=".json" className="hidden" onChange={handleFileUpload} />
            </label>
            <button
              onClick={() => {
                const text = prompt('Pega el JSON de tus credenciales:');
                if (text) {
                  try {
                    const creds = JSON.parse(text);
                    Object.entries(creds).forEach(([key, data]) => {
                      addCredential({
                        name: key.toUpperCase(),
                        username: data.username || 'default',
                        password: data.token || data.api_key || '',
                        category: 'Pasted',
                        notes: 'Importado mediante pegado de JSON'
                      });
                    });
                    alert('✅ Credenciales importadas.');
                  } catch (e) { alert('❌ JSON inválido'); }
                }
              }}
              className="flex items-center justify-center gap-2 p-3 bg-[#0d1117] border border-white/5 rounded-lg text-[10px] font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Key size={14} /> PEGAR JSON MANUALMENTE
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg flex gap-3">
        <AlertCircle size={16} className="text-blue-400 shrink-0" />
        <p className="text-[10px] text-blue-300/80 leading-relaxed">
          <strong>Nota de Seguridad:</strong> Las credenciales se cifran localmente antes de {import.meta.env.VITE_SUPABASE_URL ? 'sincronizarse con tu base de datos Supabase privada' : 'guardarse en el almacenamiento local'}.
        </p>
      </div>
    </div>
  );
};

export default AutoCredentialManager;
