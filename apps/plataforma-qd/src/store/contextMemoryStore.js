import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import contextMemoryEngine from '../services/ContextMemoryEngine';
import { logger } from '../utils/logger';

/**
 * Store de Zustand para Context Memory Engine
 * Gestiona el estado de proyectos cargados en memoria
 */
export const useContextMemoryStore = create(
  persist(
    (set, get) => ({
      // Estado
      loadedProjects: {}, // { projectId: metadata }
      isLoading: false,
      error: null,
      stats: null,

      /**
       * Cargar proyecto en memoria
       */
      loadProject: async (projectId, files, metadata) => {
        set({ isLoading: true, error: null });

        try {
          logger.info(`[ContextMemoryStore] Iniciando carga de proyecto: ${projectId}`);

          const result = await contextMemoryEngine.loadProjectContext(
            projectId,
            files,
            metadata
          );

          set(state => ({
            loadedProjects: {
              ...state.loadedProjects,
              [projectId]: result
            },
            isLoading: false
          }));

          logger.info(`[ContextMemoryStore] Proyecto cargado exitosamente: ${projectId}`);
          return result;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          logger.error('[ContextMemoryStore] Error cargando proyecto:', error);
          throw error;
        }
      },

      /**
       * Obtener contexto relevante para una consulta
       */
      getContext: (projectId, query, options) => {
        try {
          const result = contextMemoryEngine.getRelevantContext(projectId, query, options);
          logger.info(`[ContextMemoryStore] Contexto recuperado: ${result.strategy} (${result.tokens} tokens)`);
          return result;
        } catch (error) {
          set({ error: error.message });
          logger.error('[ContextMemoryStore] Error obteniendo contexto:', error);
          throw error;
        }
      },

      /**
       * Sincronizar cambios en archivos
       */
      syncChanges: async (projectId, changedFiles) => {
        try {
          await contextMemoryEngine.syncChanges(projectId, changedFiles);
          logger.info(`[ContextMemoryStore] Cambios sincronizados: ${projectId} (${changedFiles.length} archivos)`);
        } catch (error) {
          logger.error('[ContextMemoryStore] Error sincronizando cambios:', error);
          set({ error: error.message });
        }
      },

      /**
       * Actualizar estadísticas globales
       */
      updateStats: () => {
        try {
          const stats = contextMemoryEngine.getStats();
          set({ stats });
        } catch (error) {
          logger.error('[ContextMemoryStore] Error actualizando stats:', error);
        }
      },

      /**
       * Verificar si un proyecto está cargado
       */
      isProjectLoaded: (projectId) => {
        const { loadedProjects } = get();
        return !!loadedProjects[projectId];
      },

      /**
       * Obtener información de un proyecto cargado
       */
      getProjectInfo: (projectId) => {
        const { loadedProjects } = get();
        return loadedProjects[projectId] || null;
      },

      /**
       * Limpiar proyecto específico
       */
      clearProject: (projectId) => {
        try {
          contextMemoryEngine.clearProject(projectId);
          set(state => {
            const { [projectId]: removed, ...rest } = state.loadedProjects;
            if (removed) logger.info(`[ContextMemoryStore] Proyecto removido: ${projectId}`);
            return { loadedProjects: rest };
          });
          logger.info(`[ContextMemoryStore] Proyecto limpiado: ${projectId}`);
        } catch (error) {
          logger.error('[ContextMemoryStore] Error limpiando proyecto:', error);
        }
      },

      /**
       * Reset completo del store
       */
      reset: () => {
        contextMemoryEngine.clearAll();
        set({
          loadedProjects: {},
          isLoading: false,
          error: null,
          stats: null
        });
        logger.info('[ContextMemoryStore] Store reseteado');
      },

      /**
       * Limpiar error
       */
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'context-memory-storage',
      partialize: (state) => ({
        // Solo persistir la lista de proyectos cargados (sin el contenido completo)
        loadedProjects: Object.keys(state.loadedProjects).reduce((acc, key) => {
          acc[key] = {
            projectId: state.loadedProjects[key].projectId,
            files: state.loadedProjects[key].files,
            tokens: state.loadedProjects[key].tokens
          };
          return acc;
        }, {})
      })
    }
  )
);
