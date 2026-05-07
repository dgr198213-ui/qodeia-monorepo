import { useEffect, useCallback } from 'react';
import { useContextMemoryStore } from '../store/contextMemoryStore';
import { useCodeStore } from '../store/codeStore';
import { logger } from '../utils/logger';

/**
 * Hook para gestionar memoria de proyecto automáticamente
 * Auto-carga proyectos y sincroniza cambios
 */
export function useProjectMemory() {
  const {
    loadProject,
    getContext,
    syncChanges,
    isLoading,
    error,
    updateStats,
    isProjectLoaded,
    getProjectInfo,
    clearError
  } = useContextMemoryStore();

  const { currentProject, files } = useCodeStore();

  // Auto-cargar proyecto cuando cambia
  useEffect(() => {
    if (currentProject && files.length > 0) {
      const projectId = currentProject.id;
      const isLoaded = isProjectLoaded(projectId);

      if (!isLoaded) {
        logger.info(`[useProjectMemory] Auto-cargando proyecto: ${projectId}`);
        loadProject(projectId, files, {
          name: currentProject.name,
          createdAt: currentProject.createdAt,
          description: currentProject.description
        }).catch(err => {
          logger.error('[useProjectMemory] Error auto-cargando proyecto:', err);
        });
      }
    }
  }, [currentProject, files, isProjectLoaded, loadProject]);

  // Auto-actualizar stats cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      updateStats();
    }, 10000);

    return () => clearInterval(interval);
  }, [updateStats]);

  /**
   * Sincronizar cambio de archivo individual
   */
  const handleFileChange = useCallback((changedFile) => {
    if (currentProject && isProjectLoaded(currentProject.id)) {
      syncChanges(currentProject.id, [changedFile]);
    }
  }, [currentProject, isProjectLoaded, syncChanges]);

  /**
   * Sincronizar múltiples archivos
   */
  const handleMultipleFilesChange = useCallback((changedFiles) => {
    if (currentProject && isProjectLoaded(currentProject.id)) {
      syncChanges(currentProject.id, changedFiles);
    }
  }, [currentProject, isProjectLoaded, syncChanges]);

  /**
   * Obtener contexto inteligente para una consulta
   */
  const queryContext = useCallback((query, options = {}) => {
    if (!currentProject) {
      throw new Error('No hay proyecto activo');
    }

    if (!isProjectLoaded(currentProject.id)) {
      throw new Error('El proyecto no está cargado en memoria');
    }

    return getContext(currentProject.id, query, options);
  }, [currentProject, isProjectLoaded, getContext]);

  /**
   * Verificar si el proyecto actual está cargado
   */
  const isMemoryLoaded = currentProject ? isProjectLoaded(currentProject.id) : false;

  /**
   * Obtener estadísticas del proyecto actual
   */
  const memoryStats = currentProject ? getProjectInfo(currentProject.id) : null;

  return {
    // Estado
    isMemoryLoaded,
    isLoading,
    error,
    memoryStats,

    // Acciones
    queryContext,
    handleFileChange,
    handleMultipleFilesChange,
    updateStats,
    clearError,

    // Información del proyecto
    projectId: currentProject?.id,
    projectName: currentProject?.name
  };
}
