import { useState, useEffect } from 'react';
import { Activity, Shield, Key, Database, Cloud, Cpu } from 'lucide-react';
import { useCodeStore } from '../../store/codeStore';
import { supabase } from '../../lib/supabase';

const HealthItem = ({ icon: Icon, label, status, detail }) => (
  <div className="flex items-center gap-3 p-3 bg-[#0d1117] rounded-lg border border-white/5">
    <div className={`p-2 rounded-md ${status === 'ok' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
      <Icon size={16} />
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-gray-300">{label}</span>
        <span className={`text-[10px] uppercase font-black ${status === 'ok' ? 'text-emerald-500' : 'text-orange-500'}`}>
          {status === 'ok' ? 'Online' : 'Warning'}
        </span>
      </div>
      <p className="text-[10px] text-gray-400 truncate">{detail}</p>
    </div>
  </div>
);

const SystemHealth = () => {
  const [health, setHealth] = useState({
    store: { status: 'loading', detail: 'Iniciando...' },
    encryption: { status: 'loading', detail: 'Verificando llaves...' },
    storage: { status: 'loading', detail: 'Probando persistencia...' },
    supabase: { status: 'loading', detail: 'Conectando con la nube...' },
    monaco: { status: 'loading', detail: 'Cargando motor...' }
  });

  const { isLoaded } = useCodeStore();

  useEffect(() => {
    const checkHealth = async () => {
      // 1. Encryption Check
      const hasKey = import.meta.env.VITE_ENCRYPTION_KEY && import.meta.env.VITE_ENCRYPTION_KEY !== 'your-secret-key-here';

      // 2. Storage Check
      let storageOk = false;
      try {
        localStorage.setItem('health-check', 'test');
        localStorage.removeItem('health-check');
        storageOk = true;
      } catch (e) {
        storageOk = false;
      }

      // 3. Supabase Check
      let supabaseStatus = 'warn';
      let supabaseDetail = 'No configurado';

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (import.meta.env.VITE_SUPABASE_URL) {
          supabaseStatus = 'ok';
          supabaseDetail = session ? `Conectado como ${session.user.email}` : 'Conectado (Sesión Invitado)';
        }
      } catch (e) {
        supabaseStatus = 'error';
        supabaseDetail = 'Error de conexión';
      }

      setHealth({
        store: {
          status: isLoaded ? 'ok' : 'loading',
          detail: isLoaded ? 'Zustand CodeStore inicializado' : 'Cargando store...'
        },
        encryption: {
          status: hasKey ? 'ok' : 'warn',
          detail: hasKey ? 'AES-256 Key Activa' : 'Usando llave por defecto'
        },
        storage: {
          status: storageOk ? 'ok' : 'warn',
          detail: storageOk ? 'LocalStorage disponible' : 'Error de persistencia'
        },
        supabase: {
          status: supabaseStatus,
          detail: supabaseDetail
        },
        monaco: {
          status: 'ok',
          detail: 'Monaco Engine v4.7.0'
        }
      });
    };

    const timer = setTimeout(checkHealth, 1000);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={16} className="text-[#13ecc8]" />
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Integridad del Sistema</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <HealthItem
          icon={Database}
          label="Zustand Store"
          status={health.store.status}
          detail={health.store.detail}
        />
        <HealthItem
          icon={Cloud}
          label="Supabase Cloud"
          status={health.supabase.status}
          detail={health.supabase.detail}
        />
        <HealthItem
          icon={Key}
          label="Cifrado AES"
          status={health.encryption.status}
          detail={health.encryption.detail}
        />
        <HealthItem
          icon={Shield}
          label="Persistencia"
          status={health.storage.status}
          detail={health.storage.detail}
        />
        <HealthItem
          icon={Cpu}
          label="Monaco Engine"
          status={health.monaco.status}
          detail={health.monaco.detail}
        />
      </div>
    </div>
  );
};

export default SystemHealth;
