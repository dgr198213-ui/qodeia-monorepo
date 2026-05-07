import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

const DEFAULT_FILES = [
  {
    id: 'main-js',
    name: 'main.js',
    path: '/main.js',
    language: 'javascript',
    content: `// Bienvenido al Editor Howard OS
// Atajos: Cmd+S (guardar), F5 (ejecutar), Cmd+P (buscar archivos)

function saludar(nombre) {
  console.log(\`Hola, \${nombre}!\`);
  return \`Bienvenido, \${nombre}\`;
}

const resultado = saludar("Desarrollador");
console.log(resultado);`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    saved: true
  }
];

const DEFAULT_SNIPPETS = [
  {
    id: 'snippet-default-1',
    name: 'React Component',
    language: 'javascript',
    code: `import React from 'react';

const ComponentName = () => {
  return (
    <div>
      {/* Tu código aquí */}
    </div>
  );
};

export default ComponentName;`,
    category: 'react',
    createdAt: Date.now()
  }
];

export const useCodeStore = create(
  persist(
    (set, get) => ({
      // ==================== ESTADO ====================
      files: DEFAULT_FILES,
      openFiles: ['main-js'],
      currentFileId: 'main-js',
      snippets: [],
      collaborators: [],
      isLoaded: false,
      isSyncing: false,
      error: null,
      terminalOutput: '> Sistema listo. Presiona Run para ejecutar código.\n',
      settings: { theme: 'vs-dark', fontSize: 14 },

      // Proyectos
      projects: [],
      currentProject: null,

      // GIT STATE
      gitStatus: {
        branch: 'main',
        ahead: 0,
        behind: 0
      },
      gitChanges: [],
      gitCommits: [],
      gitBranches: [
        { name: 'main', current: true, lastCommit: 'Ahora' }
      ],

      // ==================== GETTERS ====================
      getCurrentFile: () => {
        const { files = [], currentFileId } = get();
        return files.find(f => f.id === currentFileId) || null;
      },

      getOpenFiles: () => {
        const { files = [], openFiles = [] } = get();
        return openFiles.map(id => files.find(f => f.id === id)).filter(Boolean);
      },

      getFileById: (id) => {
        const { files = [] } = get();
        return files.find(f => f.id === id) || null;
      },

      getAllSnippets: () => {
        const { snippets = [] } = get();
        return [...DEFAULT_SNIPPETS, ...snippets];
      },

      // ==================== PROYECTOS (SUPABASE) ====================
      fetchProjects: async () => {
        try {
          set({ isSyncing: true, error: null });

          const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('updated_at', { ascending: false });

          if (error) throw error;

          set({ projects: data || [], isSyncing: false });
        } catch (error) {
          console.error('Error al obtener proyectos:', error);
          set({ error: error.message, isSyncing: false });
        }
      },

      createRemoteProject: async (name, description = '') => {
        try {
          set({ isSyncing: true, error: null });

          const { data, error } = await supabase
            .from('projects')
            .insert([{ name, description }])
            .select()
            .single();

          if (error) throw error;

          const { projects } = get();
          set({
            projects: [data, ...projects],
            currentProject: data,
            isSyncing: false
          });

          return { success: true, project: data };
        } catch (error) {
          console.error('Error al crear proyecto:', error);
          set({ error: error.message, isSyncing: false });
          return { success: false, error: error.message };
        }
      },

      updateProject: async (id, updates) => {
        try {
          set({ isSyncing: true, error: null });

          const { data, error } = await supabase
            .from('projects')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

          if (error) throw error;

          const { projects } = get();
          set({
            projects: projects.map(p => p.id === id ? data : p),
            isSyncing: false
          });

          return { success: true, project: data };
        } catch (error) {
          console.error('Error al actualizar proyecto:', error);
          set({ error: error.message, isSyncing: false });
          return { success: false, error: error.message };
        }
      },

      deleteProject: async (id) => {
        try {
          set({ isSyncing: true, error: null });

          const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

          if (error) throw error;

          const { projects } = get();
          set({
            projects: projects.filter(p => p.id !== id),
            currentProject: null,
            isSyncing: false
          });

          return { success: true };
        } catch (error) {
          console.error('Error al eliminar proyecto:', error);
          set({ error: error.message, isSyncing: false });
          return { success: false, error: error.message };
        }
      },

      setCurrentProject: (project) => {
        set({ currentProject: project });
      },

      // ==================== ARCHIVOS ====================
      createFile: (name, language = 'javascript', path = null, content = '') => {
        const newFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name,
          path: path || `/${name}`,
          language,
          content,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          saved: true
        };

        set(state => ({
          files: [...(state.files || []), newFile],
          openFiles: [...(state.openFiles || []), newFile.id],
          currentFileId: newFile.id
        }));

        return newFile.id;
      },

      updateFileContent: (fileId, content) => {
        set(state => ({
          files: (state.files || []).map(f =>
            f.id === fileId
              ? { ...f, content, updatedAt: Date.now(), saved: false }
              : f
          )
        }));
      },

      saveFile: (fileId) => {
        set(state => ({
          files: (state.files || []).map(f =>
            f.id === fileId ? { ...f, saved: true, updatedAt: Date.now() } : f
          )
        }));
      },

      saveAllFiles: () => {
        set(state => ({
          files: (state.files || []).map(f => ({ ...f, saved: true, updatedAt: Date.now() }))
        }));
      },

      deleteFile: (fileId) => {
        set(state => {
          const newFiles = (state.files || []).filter(f => f.id !== fileId);
          const newOpenFiles = (state.openFiles || []).filter(id => id !== fileId);

          let newCurrentId = state.currentFileId;
          if (state.currentFileId === fileId) {
            newCurrentId = newOpenFiles[0] || newFiles[0]?.id || null;
          }

          return {
            files: newFiles,
            openFiles: newOpenFiles,
            currentFileId: newCurrentId
          };
        });
      },

      renameFile: (fileId, newName) => {
        const getLanguageFromName = (name) => {
          if (name.endsWith('.py')) return 'python';
          if (name.endsWith('.html')) return 'html';
          if (name.endsWith('.css')) return 'css';
          if (name.endsWith('.json')) return 'json';
          if (name.endsWith('.ts')) return 'typescript';
          if (name.endsWith('.tsx')) return 'typescript';
          if (name.endsWith('.jsx')) return 'javascript';
          return 'javascript';
        };

        set(state => ({
          files: (state.files || []).map(f =>
            f.id === fileId
              ? {
                  ...f,
                  name: newName,
                  path: `/${newName}`,
                  language: getLanguageFromName(newName),
                  updatedAt: Date.now()
                }
              : f
          )
        }));
      },

      // ==================== GIT ACTIONS ====================
      stageFile: (fileName) => {
        set(state => ({
          gitChanges: (state.gitChanges || []).map(change =>
            change.file === fileName ? { ...change, staged: !change.staged } : change
          )
        }));
      },

      stageAll: () => {
        set(state => ({
          gitChanges: (state.gitChanges || []).map(change => ({ ...change, staged: true }))
        }));
      },

      unstageAll: () => {
        set(state => ({
          gitChanges: (state.gitChanges || []).map(change => ({ ...change, staged: false }))
        }));
      },

      commitChanges: (message) => {
        const { gitChanges = [] } = get();
        const stagedFiles = gitChanges.filter(c => c.staged);
        if (stagedFiles.length === 0) return;

        const newCommit = {
          hash: Math.random().toString(36).substring(2, 10),
          author: 'howard-dev',
          message,
          date: new Date().toISOString().replace('T', ' ').substring(0, 19),
          filesChanged: stagedFiles.length
        };

        set(state => ({
          gitCommits: [newCommit, ...(state.gitCommits || [])],
          gitChanges: (state.gitChanges || []).filter(c => !c.staged)
        }));
      },

      checkoutBranch: (branchName) => {
        set(state => ({
          gitBranches: (state.gitBranches || []).map(b => ({ ...b, current: b.name === branchName })),
          gitStatus: { ...(state.gitStatus || {}), branch: branchName }
        }));
      },

      createBranch: (branchName) => {
        set(state => ({
          gitBranches: [{ name: branchName, current: false, lastCommit: 'Nueva' }, ...(state.gitBranches || [])]
        }));
      },

      // ==================== PESTAÑAS ====================
      openFile: (fileId) => {
        set(state => ({
          openFiles: (state.openFiles || []).includes(fileId)
            ? state.openFiles
            : [...(state.openFiles || []), fileId],
          currentFileId: fileId
        }));
      },

      closeFile: (fileId) => {
        set(state => {
          const newOpenFiles = (state.openFiles || []).filter(id => id !== fileId);
          let newCurrentId = state.currentFileId;
          if (state.currentFileId === fileId) {
            newCurrentId = newOpenFiles[newOpenFiles.length - 1] || (state.files && state.files[0]?.id) || null;
          }

          return {
            openFiles: newOpenFiles,
            currentFileId: newCurrentId
          };
        });
      },

      switchFile: (fileId) => {
        const file = get().getFileById(fileId);
        if (file) {
          get().openFile(fileId);
        }
      },

      setActiveFile: (id) => get().switchFile(id),

      // ==================== SNIPPETS ====================
      addSnippet: (snippet) => {
        const newSnippet = {
          id: `snippet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...snippet,
          createdAt: Date.now()
        };
        set(state => ({ snippets: [...(state.snippets || []), newSnippet] }));
        return newSnippet.id;
      },

      // ==================== UTILIDADES ====================
      getUnsavedFiles: () => {
        const { files = [] } = get();
        return files.filter(f => !f.saved);
      },

      setTerminalOutput: (output) => {
        set({ terminalOutput: output });
      },

      appendTerminalOutput: (output) => {
        set(state => ({ terminalOutput: (state.terminalOutput || '') + output }));
      },

      resetStore: () => {
        set({
          files: DEFAULT_FILES,
          openFiles: ['main-js'],
          currentFileId: 'main-js',
          snippets: [],
          collaborators: [],
          projects: [],
          currentProject: null,
          gitStatus: { branch: 'main', ahead: 0, behind: 0 },
          gitChanges: [],
          gitCommits: [],
          gitBranches: [{ name: 'main', current: true, lastCommit: 'Ahora' }]
        });
      },

      loadFiles: () => {}
    }),
    {
      name: 'howard-code-storage',
      partialize: (state) => ({
        files: state.files,
        snippets: state.snippets,
        openFiles: state.openFiles,
        currentFileId: state.currentFileId,
        settings: state.settings,
        projects: state.projects,
        currentProject: state.currentProject,
        gitCommits: state.gitCommits,
        gitBranches: state.gitBranches
      })
    }
  )
);
