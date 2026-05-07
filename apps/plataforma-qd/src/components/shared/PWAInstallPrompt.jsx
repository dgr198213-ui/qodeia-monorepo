import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detectar si ya está instalada
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detectar iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Verificar si fue descartado recientemente (7 días)
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Para iOS, mostrar instrucciones después de un delay
    if (isIOSDevice) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Para Android/Desktop, escuchar evento de instalación
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Detectar si se instaló
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // No mostrar si está instalada o no hay prompt
  if (isInstalled || !showPrompt) return null;

  // Instrucciones especiales para iOS
  if (isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 bg-[#192233] border border-[#13ecc8]/30 rounded-xl p-4 z-50 shadow-2xl animate-fade-in">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#13ecc8]/10 rounded-xl flex-shrink-0">
            <Download size={28} className="text-[#13ecc8]" />
          </div>

          <div className="flex-1 pr-6">
            <h4 className="font-bold text-white text-base mb-2">Instalar Howard OS</h4>
            <p className="text-sm text-gray-300 mb-3">
              Añade esta app a tu pantalla de inicio para acceder más rápido:
            </p>
            <ol className="text-xs text-gray-400 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-[#13ecc8]/20 rounded-full flex items-center justify-center text-[#13ecc8] font-bold text-[10px]">1</span>
                <span>Toca el botón <Share size={14} className="inline text-blue-400 mx-1" /> Compartir</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-[#13ecc8]/20 rounded-full flex items-center justify-center text-[#13ecc8] font-bold text-[10px]">2</span>
                <span>Selecciona &quot;Añadir a pantalla de inicio&quot;</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 bg-[#13ecc8]/20 rounded-full flex items-center justify-center text-[#13ecc8] font-bold text-[10px]">3</span>
                <span>Toca &quot;Añadir&quot; para confirmar</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // Prompt para Android/Desktop
  return (
    <div className="fixed bottom-20 left-4 right-4 bg-[#192233] border border-[#13ecc8]/30 rounded-xl p-4 z-50 shadow-2xl animate-fade-in">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
        aria-label="Cerrar"
      >
        <X size={20} />
      </button>

      <div className="flex items-center gap-4">
        <div className="p-3 bg-[#13ecc8]/10 rounded-xl flex-shrink-0">
          <Download size={28} className="text-[#13ecc8]" />
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-white text-base mb-1">Instalar Howard OS</h4>
          <p className="text-xs text-gray-400">Accede más rápido y usa offline</p>
        </div>

        <button
          onClick={handleInstall}
          className="px-5 py-2.5 bg-[#13ecc8] text-[#10221f] rounded-lg text-sm font-bold hover:bg-[#0fc9a8] transition-colors flex-shrink-0"
        >
          Instalar
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
