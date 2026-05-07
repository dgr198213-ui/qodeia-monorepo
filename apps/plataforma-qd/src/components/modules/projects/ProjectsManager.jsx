import { useEffect } from 'react';
import { ArrowLeft, Code, Download, Eye, Plus, RefreshCw } from 'lucide-react';
import { useCodeStore } from '../../../store/codeStore';

const ProjectsManager = ({ onBack }) => {
  const {
    projects,
    fetchProjects,
    setCurrentProject,
    createRemoteProject,
    isSyncing
  } = useCodeStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async () => {
    const name = prompt('Nombre del nuevo proyecto:');
    if (name) {
      await createRemoteProject(name);
    }
  };

  const handleSelectProject = (id) => {
    setCurrentProject(id);
    onBack(); // Volver al editor
  };

  return (
    <div className="min-h-screen bg-[#10221f] text-white pb-24">
      <div className="sticky top-0 bg-[#10221f]/90 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between z-10">
        <button onClick={onBack} className="text-white hover:text-[#13ecc8] transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold">Gestión de Proyectos</h2>
        <div className="flex gap-3">
          <button onClick={fetchProjects} disabled={isSyncing}>
            <RefreshCw size={20} className={`text-gray-400 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleCreateProject}>
            <Plus size={24} className="text-[#13ecc8]" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {isSyncing && projects.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm">
            Cargando proyectos desde Supabase...
          </div>
        )}

        {!isSyncing && projects.length === 0 && (
          <div className="text-center py-10 bg-[#192233] rounded-xl border border-dashed border-white/10">
            <p className="text-gray-400 text-sm mb-4">No tienes proyectos en la nube.</p>
            <button
              onClick={handleCreateProject}
              className="bg-[#13ecc8] text-[#10221f] px-4 py-2 rounded-lg text-sm font-bold"
            >
              Crear mi primer proyecto
            </button>
          </div>
        )}

        {projects.map(project => (
          <div key={project.id} className="bg-[#192233] rounded-xl p-4 border border-white/5 hover:border-[#13ecc8]/30 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#13ecc8]/10 flex items-center justify-center">
                <Code className="text-[#13ecc8]" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white mb-1">{project.name}</h4>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 uppercase tracking-wider">
                  <span>ID: {project.id.substring(0, 8)}</span>
                  <span>•</span>
                  <span>Actualizado: {new Date(project.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleSelectProject(project.id)}
                className="flex-1 bg-[#13ecc8] text-[#10221f] px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#0fc9a8] transition-colors"
              >
                <Eye size={16} />
                Abrir en Editor
              </button>
              <button className="px-3 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors">
                <Download size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsManager;
