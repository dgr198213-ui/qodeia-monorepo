import { Suspense, lazy, useState, useEffect } from 'react';
import { ErrorBoundary } from './core/components/ErrorBoundary';
import LoadingScreen from './core/components/LoadingScreen';
import BottomNav from './components/shared/BottomNav';
import { DocumentTitle } from './core/hooks/useDocumentTitle';
import PWAInstallPrompt from './components/shared/PWAInstallPrompt';
import Login from './components/shared/Login';
import { useAuthStore } from './store/authStore';

// Dashboard se carga inmediatamente
import Dashboard from './components/shared/Dashboard';
import { MODULES } from './constants/modules';

// Lazy loading por categoría
const CredentialsPanel = lazy(() => import('./components/modules/credentials/CredentialsPanel'));
const CodeEditor = lazy(() => import('./components/modules/development/CodeEditor'));
const NoCodeChat = lazy(() => import('./components/modules/development/NoCodeChat'));
const Connectors = lazy(() => import('./components/modules/development/Connectors'));
const ProjectsManager = lazy(() => import('./components/modules/projects/ProjectsManager'));
const BiasFirewall = lazy(() => import('./components/modules/analysis/BiasFirewall'));
const HypeDetector = lazy(() => import('./components/modules/analysis/HypeDetector'));
const SolveItIterator = lazy(() => import('./components/modules/analysis/SolveItIterator'));
const MoltbotPanel = lazy(() => import('./components/modules/development/MoltbotPanel'));
const AITaskRunner = lazy(() => import('./components/modules/development/AITaskRunner'));
const ContextMemoryPanel = lazy(() => import('./components/modules/development/ContextMemoryPanel'));
const MemoryVisualizer = lazy(() => import('./components/modules/development/MemoryVisualizer'));
const CommunityPanel = lazy(() => import('./components/modules/community/CommunityPanel'));

const MODULE_CONFIG = {
  [MODULES.DASHBOARD]: {
    component: Dashboard,
    showBottomNav: true,
    title: 'Howard OS'
  },
  [MODULES.CREDENTIALS]: {
    component: CredentialsPanel,
    showBottomNav: false,
    title: 'Credenciales'
  },
  [MODULES.CODE_EDITOR]: {
    component: CodeEditor,
    showBottomNav: false,
    title: 'Editor de Código',
    fullscreen: true
  },
  [MODULES.NO_CODE_CHAT]: {
    component: NoCodeChat,
    showBottomNav: true,
    title: 'No-Code Chat'
  },
  [MODULES.CONNECTORS]: {
    component: Connectors,
    showBottomNav: false,
    title: 'Conectores'
  },
  [MODULES.PROJECTS]: {
    component: ProjectsManager,
    showBottomNav: true,
    title: 'Proyectos'
  },
  [MODULES.BIAS_FIREWALL]: {
    component: BiasFirewall,
    showBottomNav: false,
    title: 'Bias Firewall'
  },
  [MODULES.HYPE_DETECTOR]: {
    component: HypeDetector,
    showBottomNav: false,
    title: 'Hype Detector'
  },
  [MODULES.SOLVEIT]: {
    component: SolveItIterator,
    showBottomNav: false,
    title: 'SolveIt Iterator'
  },
  [MODULES.MOLTBOT]: {
    component: MoltbotPanel,
    showBottomNav: true,
    title: 'Moltbot Gateway'
  },
  [MODULES.AI_TASKS]: {
    component: AITaskRunner,
    showBottomNav: true,
    title: 'AI Task Runner'
  },
  [MODULES.CONTEXT_MEMORY]: {
    component: ContextMemoryPanel,
    showBottomNav: true,
    title: 'Context Memory'
  },
  [MODULES.MEMORY_VISUALIZER]: {
    component: MemoryVisualizer,
    showBottomNav: true,
    title: 'Memory Visualizer'
  },
  [MODULES.COMMUNITY]: {
    component: CommunityPanel,
    showBottomNav: true,
    title: 'Comunidad'
  },
  [MODULES.RESOURCES]: {
    component: CommunityPanel,
    showBottomNav: true,
    title: 'Recursos'
  }
};

export default function App() {
  const [currentModule, setCurrentModule] = useState(MODULES.DASHBOARD);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { user, initialize, loading } = useAuthStore();
  const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    if (isSupabaseConfigured) {
      initialize();
    }
  }, [initialize, isSupabaseConfigured]);

  const config = MODULE_CONFIG[currentModule];
  const Component = config.component;

  const handleNavigate = (module) => {
    if (module === currentModule) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentModule(module);
      setIsTransitioning(false);
    }, 150);
  };

  const handleBack = () => handleNavigate(MODULES.DASHBOARD);

  if (loading && isSupabaseConfigured) return <LoadingScreen />;

  return (
    <ErrorBoundary>
      <div className={`bg-[#10221f] min-h-screen ${config.fullscreen ? 'h-screen overflow-hidden' : ''}`}>
        <DocumentTitle title={config.title} />

        <div className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          {!user && isSupabaseConfigured ? (
            <div className="flex items-center justify-center min-h-screen p-4">
              <Login />
            </div>
          ) : (
            <Suspense fallback={<LoadingScreen />}>
              {currentModule === MODULES.DASHBOARD ? (
                <Component onNavigate={handleNavigate} />
              ) : (
                <Component onBack={handleBack} />
              )}
            </Suspense>
          )}
        </div>

        {config.showBottomNav && (user || !isSupabaseConfigured) && (
          <BottomNav
            currentModule={currentModule}
            onNavigate={handleNavigate}
          />
        )}

        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
      </div>
    </ErrorBoundary>
  );
}
