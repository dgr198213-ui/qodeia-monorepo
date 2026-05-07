'use client';

import { useEffect, useState, useCallback } from 'react';
import { getOperativeSupabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import AgentChat from '@/components/AgentChat';

export default function AgentePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | undefined>(undefined);
  const supabase = getOperativeSupabase();
  const router = useRouter();

  const loadProjects = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }, [supabase]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);
      await loadProjects(currentUser.id);
      setLoading(false);
    };

    checkUser();
  }, [supabase, router, loadProjects]);

  if (loading) {
    return (
      <div className="min-h-screen bg-qodeia-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-qodeia-mint-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-qodeia-dark-900 pt-20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-white mb-4">
            Agente QodeIA
          </h1>
          <p className="text-xl text-gray-300">
            Tu asistente inteligente para desarrollo y gestión de proyectos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Project Selector */}
          <div className="lg:col-span-1">
            <div className="bg-qodeia-dark-800 rounded-lg p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📁</span>
                Proyectos
              </h2>

              <div className="space-y-2">
                <button
                  onClick={() => setSelectedProject(undefined)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedProject === undefined
                      ? 'bg-gradient-to-r from-qodeia-blue-500 to-qodeia-mint-500 text-white'
                      : 'bg-qodeia-dark-700 text-gray-300 hover:bg-qodeia-dark-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>🌐</span>
                    <span className="font-medium">General</span>
                  </div>
                  <p className="text-xs opacity-75 mt-1">Sin contexto de proyecto</p>
                </button>

                {projects.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No tienes proyectos</p>
                    <a
                      href="/ide"
                      className="text-xs text-qodeia-mint-400 hover:underline mt-2 inline-block"
                    >
                      Crear proyecto en Howard OS
                    </a>
                  </div>
                ) : (
                  projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProject(project.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        selectedProject === project.id
                          ? 'bg-gradient-to-r from-qodeia-blue-500 to-qodeia-mint-500 text-white'
                          : 'bg-qodeia-dark-700 text-gray-300 hover:bg-qodeia-dark-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>📦</span>
                        <span className="font-medium truncate">{project.name}</span>
                      </div>
                      {project.description && (
                        <p className="text-xs opacity-75 mt-1 truncate">
                          {project.description}
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Info Box */}
              <div className="mt-6 p-4 bg-qodeia-blue-500/10 border border-qodeia-blue-500/20 rounded-lg">
                <h3 className="text-sm font-semibold text-qodeia-mint-400 mb-2">
                  💡 Consejo
                </h3>
                <p className="text-xs text-gray-400">
                  Selecciona un proyecto para que el agente tenga contexto completo de tu código y pueda ayudarte mejor.
                </p>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <div className="h-[calc(100vh-200px)]">
              <AgentChat
                projectId={selectedProject}
                className="h-full"
              />
            </div>

            {/* Features Info */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-qodeia-dark-800 p-4 rounded-lg border border-qodeia-blue-500/20">
                <div className="text-2xl mb-2">🐙</div>
                <h3 className="font-semibold text-white mb-1">GitHub</h3>
                <p className="text-xs text-gray-400">
                  Gestiona repositorios, crea branches, commits y PRs
                </p>
              </div>

              <div className="bg-qodeia-dark-800 p-4 rounded-lg border border-qodeia-mint-500/20">
                <div className="text-2xl mb-2">🗄️</div>
                <h3 className="font-semibold text-white mb-1">Supabase</h3>
                <p className="text-xs text-gray-400">
                  Consulta y gestiona datos en tu base de datos
                </p>
              </div>

              <div className="bg-qodeia-dark-800 p-4 rounded-lg border border-qodeia-blue-500/20">
                <div className="text-2xl mb-2">▲</div>
                <h3 className="font-semibold text-white mb-1">Vercel</h3>
                <p className="text-xs text-gray-400">
                  Gestiona deployments y proyectos en Vercel
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
