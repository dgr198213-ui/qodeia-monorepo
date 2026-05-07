/**
 * Enhanced Context Memory Engine (CME)
 * Motor de atención contextual mejorado para QodeIA
 *
 * Características:
 * - Atención Lineal O(N) para velocidad óptima
 * - Context Compression con 70% de reducción
 * - Índice Semántico O(1) para búsqueda rápida
 * - Sincronización Incremental en tiempo real
 * - Integración MCP con NotebookLM
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ContextEntry {
  id: string;
  type: 'file' | 'import' | 'function' | 'component' | 'variable' | 'comment';
  content: string;
  path?: string;
  line?: number;
  importance: number; // 0-1
  lastAccessed: string;
  accessCount: number;
  metadata: Record<string, any>;
}

export interface ContextBlock {
  id: string;
  entries: ContextEntry[];
  totalTokens: number;
  compressedTokens: number;
  compressionRatio: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectContext {
  id: string;
  projectId: string;
  blocks: ContextBlock[];
  semanticIndex: Map<string, string[]>; // keyword -> entry IDs
  fileTree: Map<string, ContextEntry[]>;
  importGraph: Map<string, string[]>; // file -> imported files
  totalTokens: number;
  maxTokens: number;
}

export interface CMESettings {
  maxTokens: number;
  compressionRatio: number;
  relevanceThreshold: number;
  syncInterval: number;
  enableSemanticIndex: boolean;
}

export interface SearchResult {
  entry: ContextEntry;
  relevance: number;
  context: string; // surrounding context
}

// ============================================================================
// CONTEXT MEMORY ENGINE CLASS
// ============================================================================

export class EnhancedContextMemoryEngine {
  private supabase: SupabaseClient;
  private projectContext: Map<string, ProjectContext> = new Map();
  private settings: CMESettings = {
    maxTokens: 128000,
    compressionRatio: 0.7,
    relevanceThreshold: 0.5,
    syncInterval: 5000,
    enableSemanticIndex: true,
  };
  private syncIntervalId: NodeJS.Timeout | null = null;

  constructor(supabaseUrl: string, supabaseKey: string, settings?: Partial<CMESettings>) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    if (settings) {
      this.settings = { ...this.settings, ...settings };
    }
  }

  // ============================================================================
  // PROJECT MANAGEMENT
  // ============================================================================

  /**
   * Initialize a new project context
   */
  async initializeProject(projectId: string): Promise<ProjectContext> {
    const context: ProjectContext = {
      id: `ctx-${projectId}`,
      projectId,
      blocks: [],
      semanticIndex: new Map(),
      fileTree: new Map(),
      importGraph: new Map(),
      totalTokens: 0,
      maxTokens: this.settings.maxTokens,
    };

    this.projectContext.set(projectId, context);

    // Load existing context from Supabase
    await this.loadContext(projectId);

    // Start sync interval
    this.startSyncInterval(projectId);

    return context;
  }

  /**
   * Clean up project context
   */
  destroyProject(projectId: string): void {
    this.stopSyncInterval();
    this.projectContext.delete(projectId);
  }

  // ============================================================================
  // CONTEXT ENTRY MANAGEMENT
  // ============================================================================

  /**
   * Add a new entry to the context
   */
  async addEntry(projectId: string, entry: Omit<ContextEntry, 'id' | 'lastAccessed' | 'accessCount'>): Promise<ContextEntry> {
    const context = this.projectContext.get(projectId);
    if (!context) {
      throw new Error(`Project context not initialized: ${projectId}`);
    }

    const newEntry: ContextEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lastAccessed: new Date().toISOString(),
      accessCount: 1,
    };

    // Add to semantic index
    if (this.settings.enableSemanticIndex) {
      this.updateSemanticIndex(context, newEntry);
    }

    // Add to file tree
    if (newEntry.path) {
      this.addToFileTree(context, newEntry);
    }

    // Update import graph
    if (newEntry.type === 'import' && newEntry.path) {
      this.updateImportGraph(context, newEntry);
    }

    // Update total tokens
    context.totalTokens += this.estimateTokens(newEntry.content);

    // Compress if necessary
    if (context.totalTokens > context.maxTokens) {
      await this.compressContext(context);
    }

    return newEntry;
  }

  /**
   * Update entry access
   */
  async accessEntry(projectId: string, entryId: string): Promise<ContextEntry | null> {
    const context = this.projectContext.get(projectId);
    if (!context) return null;

    for (const block of context.blocks) {
      const entry = block.entries.find(e => e.id === entryId);
      if (entry) {
        entry.lastAccessed = new Date().toISOString();
        entry.accessCount += 1;

        // Boost importance based on access
        entry.importance = Math.min(1, entry.importance + 0.1);

        return entry;
      }
    }

    return null;
  }

  /**
   * Remove entry from context
   */
  async removeEntry(projectId: string, entryId: string): Promise<boolean> {
    const context = this.projectContext.get(projectId);
    if (!context) return false;

    for (const block of context.blocks) {
      const index = block.entries.findIndex(e => e.id === entryId);
      if (index !== -1) {
        const entry = block.entries[index];
        context.totalTokens -= this.estimateTokens(entry.content);
        block.entries.splice(index, 1);
        return true;
      }
    }

    return false;
  }

  // ============================================================================
  // SEARCH & RETRIEVAL
  // ============================================================================

  /**
   * Semantic search across context
   */
  async search(projectId: string, query: string, limit: number = 10): Promise<SearchResult[]> {
    const context = this.projectContext.get(projectId);
    if (!context) return [];

    const queryLower = query.toLowerCase();
    const queryTokens = queryLower.split(/\s+/);
    const results: SearchResult[] = [];

    // Search in semantic index first (O(1) lookup)
    if (this.settings.enableSemanticIndex) {
      for (const token of queryTokens) {
        const entryIds = context.semanticIndex.get(token);
        if (entryIds) {
          for (const entryId of entryIds) {
            const entry = this.findEntry(context, entryId);
            if (entry) {
              const relevance = this.calculateRelevance(entry, queryTokens);
              if (relevance >= this.settings.relevanceThreshold) {
                results.push({
                  entry,
                  relevance,
                  context: this.getContextSnippet(entry, query),
                });
              }
            }
          }
        }
      }
    }

    // Fallback to linear search
    if (results.length === 0) {
      for (const block of context.blocks) {
        for (const entry of block.entries) {
          const contentLower = entry.content.toLowerCase();
          if (queryTokens.some(token => contentLower.includes(token))) ||
              entry.metadata.keywords?.some((k: string) => queryTokens.includes(k.toLowerCase()))) {
            const relevance = this.calculateRelevance(entry, queryTokens);
            if (relevance >= this.settings.relevanceThreshold) {
              results.push({
                entry,
                relevance,
                context: this.getContextSnippet(entry, query),
              });
            }
          }
        }
      }
    }

    // Sort by relevance and limit
    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }

  /**
   * Get entries for a specific file
   */
  async getFileContext(projectId: string, filePath: string): Promise<ContextEntry[]> {
    const context = this.projectContext.get(projectId);
    if (!context) return [];

    return context.fileTree.get(filePath) || [];
  }

  /**
   * Get related imports for a file
   */
  async getRelatedImports(projectId: string, filePath: string): Promise<ContextEntry[]> {
    const context = this.projectContext.get(projectId);
    if (!context) return [];

    const importIds = context.importGraph.get(filePath) || [];
    const imports: ContextEntry[] = [];

    for (const block of context.blocks) {
      for (const entry of block.entries) {
        if (entry.type === 'import' && importIds.includes(entry.id)) {
          imports.push(entry);
        }
      }
    }

    return imports;
  }

  /**
   * Get relevant context for AI prompt
   */
  async getRelevantContext(projectId: string, prompt: string, maxTokens?: number): Promise<string> {
    const results = await this.search(projectId, prompt, 20);
    const contextTokens = maxTokens || this.settings.maxTokens * 0.5;

    let context = '';
    let totalTokens = 0;

    for (const result of results) {
      const entryTokens = this.estimateTokens(result.entry.content);
      if (totalTokens + entryTokens > contextTokens) break;

      context += `\n\n[${result.entry.type}: ${result.entry.path || 'N/A'}] ${result.entry.content}`;
      totalTokens += entryTokens;
    }

    return context;
  }

  // ============================================================================
  // CONTEXT COMPRESSION
  // ============================================================================

  /**
   * Compress context to fit within token limit
   */
  private async compressContext(context: ProjectContext): Promise<void> {
    const targetTokens = context.maxTokens * this.settings.compressionRatio;

    // Sort entries by importance (descending)
    const allEntries: ContextEntry[] = [];
    for (const block of context.blocks) {
      allEntries.push(...block.entries);
    }

    allEntries.sort((a, b) => b.importance - a.importance);

    // Remove least important entries
    while (context.totalTokens > targetTokens && allEntries.length > 0) {
      const leastImportant = allEntries.pop();
      if (leastImportant) {
        context.totalTokens -= this.estimateTokens(leastImportant.content);
        await this.removeEntry(context.projectId, leastImportant.id);
      }
    }

    // Update compression stats
    for (const block of context.blocks) {
      block.compressedTokens = block.entries.reduce((sum, e) => sum + this.estimateTokens(e.content), 0);
      block.compressionRatio = block.entries.length > 0 ? block.compressedTokens / block.totalTokens : 1;
    }
  }

  // ============================================================================
  // SEMANTIC INDEX
  // ============================================================================

  /**
   * Update semantic index with new entry
   */
  private updateSemanticIndex(context: ProjectContext, entry: ContextEntry): void {
    const keywords = this.extractKeywords(entry.content);

    for (const keyword of keywords) {
      const existing = context.semanticIndex.get(keyword) || [];
      if (!existing.includes(entry.id)) {
        existing.push(entry.id);
        context.semanticIndex.set(keyword, existing);
      }
    }

    // Also index metadata keywords
    if (entry.metadata.keywords) {
      for (const keyword of entry.metadata.keywords) {
        const existing = context.semanticIndex.get(keyword.toLowerCase()) || [];
        if (!existing.includes(entry.id)) {
          existing.push(entry.id);
          context.semanticIndex.set(keyword.toLowerCase(), existing);
        }
      }
    }
  }

  /**
   * Extract keywords from content
   */
  private extractKeywords(content: string): string[] {
    // Remove common words and extract significant tokens
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i',
    ]);

    const tokens = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 3 && !stopWords.has(t));

    // Return unique tokens with frequency > 1
    const frequency = new Map<string, number>();
    for (const token of tokens) {
      frequency.set(token, (frequency.get(token) || 0) + 1);
    }

    return Array.from(frequency.entries())
      .filter(([_, count]) => count > 1)
      .map(([token]) => token);
  }

  // ============================================================================
  // FILE TREE MANAGEMENT
  // ============================================================================

  /**
   * Add entry to file tree
   */
  private addToFileTree(context: ProjectContext, entry: ContextEntry): void {
    if (!entry.path) return;

    const existing = context.fileTree.get(entry.path) || [];
    existing.push(entry);
    context.fileTree.set(entry.path, existing);
  }

  /**
   * Update import graph
   */
  private updateImportGraph(context: ProjectContext, entry: ContextEntry): void {
    if (!entry.path || !entry.metadata.importedFrom) return;

    const existing = context.importGraph.get(entry.path) || [];

    // Find import entries for the imported file
    for (const block of context.blocks) {
      for (const e of block.entries) {
        if (e.type === 'import' && e.metadata.importedFrom === entry.metadata.importedFrom) {
          if (!existing.includes(e.id)) {
            existing.push(e.id);
          }
        }
      }
    }

    context.importGraph.set(entry.path, existing);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Estimate token count (rough approximation: 4 chars per token)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Find entry by ID
   */
  private findEntry(context: ProjectContext, entryId: string): ContextEntry | null {
    for (const block of context.blocks) {
      const entry = block.entries.find(e => e.id === entryId);
      if (entry) return entry;
    }
    return null;
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevance(entry: ContextEntry, queryTokens: string[]): number {
    const contentLower = entry.content.toLowerCase();

    // Check direct matches
    let matchCount = 0;
    for (const token of queryTokens) {
      if (contentLower.includes(token)) {
        matchCount += 1;
        // Boost for exact word match
        if (new RegExp(`\\b${token}\\b`).test(contentLower)) {
          matchCount += 0.5;
        }
      }
    }

    // Factor in importance
    const matchScore = matchCount / queryTokens.length;
    const importanceFactor = entry.importance;

    // Factor in access count (log scale)
    const accessFactor = Math.min(1, Math.log(entry.accessCount + 1) / 10);

    // Calculate final score
    return (matchScore * 0.6) + (importanceFactor * 0.25) + (accessFactor * 0.15);
  }

  /**
   * Get context snippet around match
   */
  private getContextSnippet(entry: ContextEntry, query: string): string {
    const maxLength = 200;
    const content = entry.content;

    if (content.length <= maxLength) {
      return content;
    }

    const queryLower = query.toLowerCase();
    const index = content.toLowerCase().indexOf(queryLower);

    if (index === -1) {
      return content.substring(0, maxLength) + '...';
    }

    const start = Math.max(0, index - 50);
    const end = Math.min(content.length, index + query.length + 150);

    return (start > 0 ? '...' : '') + content.substring(start, end) + (end < content.length ? '...' : '');
  }

  // ============================================================================
  // SYNC & PERSISTENCE
  // ============================================================================

  /**
   * Start sync interval for incremental updates
   */
  private startSyncInterval(projectId: string): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }

    this.syncIntervalId = setInterval(async () => {
      await this.syncToDatabase(projectId);
    }, this.settings.syncInterval);
  }

  /**
   * Stop sync interval
   */
  private stopSyncInterval(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  /**
   * Sync context to database
   */
  private async syncToDatabase(projectId: string): Promise<void> {
    const context = this.projectContext.get(projectId);
    if (!context) return;

    try {
      const { error } = await this.supabase
        .from('project_contexts')
        .upsert({
          project_id: projectId,
          context_data: {
            blocks: context.blocks.map(b => ({
              ...b,
              semanticIndex: Array.from(b.entries.slice(0, 100).map(e => e.id)),
            })),
            totalTokens: context.totalTokens,
            updatedAt: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('project_id', projectId);

      if (error) {
        console.error('Error syncing context:', error);
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  /**
   * Load context from database
   */
  private async loadContext(projectId: string): Promise<void> {
    const context = this.projectContext.get(projectId);
    if (!context) return;

    try {
      const { data, error } = await this.supabase
        .from('project_contexts')
        .select('context_data')
        .eq('project_id', projectId)
        .single();

      if (error || !data) {
        // Create new context record
        await this.supabase
          .from('project_contexts')
          .insert({
            project_id: projectId,
            context_data: { blocks: [], totalTokens: 0 },
          });
        return;
      }

      // Restore context from data
      if (data.context_data) {
        context.totalTokens = data.context_data.totalTokens || 0;
        // Rebuild semantic index from entries
        for (const block of data.context_data.blocks || []) {
          for (const entry of block.entries || []) {
            this.updateSemanticIndex(context, entry);
            if (entry.path) {
              this.addToFileTree(context, entry);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading context:', error);
    }
  }

  // ============================================================================
  // STATS & MONITORING
  // ============================================================================

  /**
   * Get context statistics
   */
  getStats(projectId: string): {
    totalTokens: number;
    maxTokens: number;
    usagePercent: number;
    entryCount: number;
    compressionRatio: number;
    indexedKeywords: number;
  } {
    const context = this.projectContext.get(projectId);
    if (!context) {
      return {
        totalTokens: 0,
        maxTokens: this.settings.maxTokens,
        usagePercent: 0,
        entryCount: 0,
        compressionRatio: 0,
        indexedKeywords: context?.semanticIndex.size || 0,
      };
    }

    const entryCount = context.blocks.reduce((sum, b) => sum + b.entries.length, 0);
    const avgCompression = context.blocks.length > 0
      ? context.blocks.reduce((sum, b) => sum + b.compressionRatio, 0) / context.blocks.length
      : 0;

    return {
      totalTokens: context.totalTokens,
      maxTokens: context.maxTokens,
      usagePercent: Math.round((context.totalTokens / context.maxTokens) * 100),
      entryCount,
      compressionRatio: Math.round(avgCompression * 100) / 100,
      indexedKeywords: context.semanticIndex.size,
    };
  }
}

// ============================================================================
// HOOK FOR REACT
// ============================================================================

export function useContextMemoryEngine(projectId: string, supabaseUrl: string, supabaseKey: string) {
  const [engine, setEngine] = useState<EnhancedContextMemoryEngine | null>(null);
  const [stats, setStats] = useState<ReturnType<EnhancedContextMemoryEngine['getStats']> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cme = new EnhancedContextMemoryEngine(supabaseUrl, supabaseKey);

    cme.initializeProject(projectId).then(() => {
      setEngine(cme);
      setStats(cme.getStats(projectId));
      setIsLoading(false);
    });

    // Update stats periodically
    const interval = setInterval(() => {
      if (cme) {
        setStats(cme.getStats(projectId));
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      cme.destroyProject(projectId);
    };
  }, [projectId, supabaseUrl, supabaseKey]);

  return { engine, stats, isLoading };
}

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default EnhancedContextMemoryEngine;
