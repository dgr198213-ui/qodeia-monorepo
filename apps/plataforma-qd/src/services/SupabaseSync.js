import { supabase } from '../lib/supabase';

/**
 * Servicio de Sincronización con Supabase
 * Maneja la persistencia de proyectos, archivos y contexto en Supabase
 * Utiliza la Base de Datos de Conocimiento (Knowledge DB)
 */
class SupabaseSync {
  constructor() {
    this.supabase = supabase;
    this.userId = null;
    this.initialized = false;
  }

  /**
   * Inicializa el servicio con el ID de usuario
   */
  async initialize() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();

      if (session?.user) {
        this.userId = session.user.id;
        this.initialized = true;
        console.log('[SupabaseSync] Inicializado para usuario:', this.userId);
        return true;
      }

      console.warn('[SupabaseSync] No hay sesión activa');
      return false;
    } catch (error) {
      console.error('[SupabaseSync] Error al inicializar:', error);
      return false;
    }
  }

  /**
   * Verifica si el servicio está inicializado
   */
  isInitialized() {
    return this.initialized && this.userId !== null;
  }

  /**
   * Sincroniza un proyecto con Supabase
   */
  async syncProject(project) {
    if (!this.isInitialized() && !(await this.initialize())) {
      throw new Error('SupabaseSync no está inicializado');
    }

    try {
      const projectData = {
        id: project.id,
        user_id: this.userId,
        name: project.name,
        description: project.description || null,
        updated_at: new Date().toISOString()
      };

      // Intentar actualizar, si no existe, insertar
      const { data, error } = await this.supabase
        .from('projects')
        .upsert(projectData, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error;

      console.log('[SupabaseSync] Proyecto sincronizado:', data.name);
      return data;
    } catch (error) {
      console.error('[SupabaseSync] Error al sincronizar proyecto:', error);
      throw error;
    }
  }

  /**
   * Sincroniza archivos de un proyecto
   */
  async syncProjectFiles(projectId, files) {
    if (!this.isInitialized() && !(await this.initialize())) {
      throw new Error('SupabaseSync no está inicializado');
    }

    try {
      // Preparar datos de archivos
      const filesData = files.map(file => ({
        project_id: projectId,
        path: file.path,
        content: file.content,
        language: file.language || this._detectLanguage(file.path),
        hash: this._hashContent(file.content),
        size: file.content.length,
        updated_at: new Date().toISOString()
      }));

      // Eliminar archivos antiguos del proyecto
      await this.supabase
        .from('project_files')
        .delete()
        .eq('project_id', projectId);

      // Insertar nuevos archivos
      const { data, error } = await this.supabase
        .from('project_files')
        .insert(filesData)
        .select();

      if (error) throw error;

      console.log(`[SupabaseSync] ${data.length} archivos sincronizados`);
      return data;
    } catch (error) {
      console.error('[SupabaseSync] Error al sincronizar archivos:', error);
      throw error;
    }
  }

  /**
   * Sincroniza el contexto de memoria de un proyecto
   */
  async syncContextMemory(projectId, contextData) {
    if (!this.isInitialized() && !(await this.initialize())) {
      throw new Error('SupabaseSync no está inicializado');
    }

    try {
      const memoryData = {
        project_id: projectId,
        full_context: contextData.fullContext,
        compressed_context: contextData.compressed,
        semantic_index: contextData.semanticIndex,
        token_estimate: contextData.tokenEstimate,
        files_count: contextData.files.length,
        updated_at: new Date().toISOString()
      };

      // Upsert del contexto
      const { data, error } = await this.supabase
        .from('context_memory')
        .upsert(memoryData, { onConflict: 'project_id' })
        .select()
        .single();

      if (error) throw error;

      console.log('[SupabaseSync] Context Memory sincronizado');
      return data;
    } catch (error) {
      console.error('[SupabaseSync] Error al sincronizar context memory:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los proyectos del usuario
   */
  async getProjects() {
    if (!this.isInitialized() && !(await this.initialize())) {
      throw new Error('SupabaseSync no está inicializado');
    }

    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('user_id', this.userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[SupabaseSync] Error al obtener proyectos:', error);
      throw error;
    }
  }

  /**
   * Obtiene los archivos de un proyecto
   */
  async getProjectFiles(projectId) {
    if (!this.isInitialized() && !(await this.initialize())) {
      throw new Error('SupabaseSync no está inicializado');
    }

    try {
      const { data, error } = await this.supabase
        .from('project_files')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('[SupabaseSync] Error al obtener archivos:', error);
      throw error;
    }
  }

  /**
   * Obtiene el contexto de memoria de un proyecto
   */
  async getContextMemory(projectId) {
    if (!this.isInitialized() && !(await this.initialize())) {
      throw new Error('SupabaseSync no está inicializado');
    }

    try {
      const { data, error } = await this.supabase
        .from('context_memory')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('[SupabaseSync] Error al obtener context memory:', error);
      throw error;
    }
  }

  /**
   * Elimina un proyecto y todos sus datos relacionados
   */
  async deleteProject(projectId) {
    if (!this.isInitialized() && !(await this.initialize())) {
      throw new Error('SupabaseSync no está inicializado');
    }

    try {
      const { error } = await this.supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', this.userId);

      if (error) throw error;

      console.log('[SupabaseSync] Proyecto eliminado');
      return true;
    } catch (error) {
      console.error('[SupabaseSync] Error al eliminar proyecto:', error);
      throw error;
    }
  }

  _detectLanguage(path) {
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap = {
      'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
      'py': 'python', 'java': 'java', 'cpp': 'cpp', 'c': 'c', 'cs': 'csharp',
      'go': 'go', 'rs': 'rust', 'php': 'php', 'rb': 'ruby', 'swift': 'swift',
      'kt': 'kotlin', 'html': 'html', 'css': 'css', 'scss': 'scss', 'json': 'json',
      'md': 'markdown', 'sql': 'sql', 'sh': 'shell', 'yaml': 'yaml', 'yml': 'yaml'
    };
    return languageMap[ext] || 'plaintext';
  }

  _hashContent(content) {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
}

export const supabaseSync = new SupabaseSync();
export default supabaseSync;
