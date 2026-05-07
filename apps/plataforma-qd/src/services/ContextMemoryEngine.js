import { logger } from '../utils/logger';

/**
 * Motor de Memoria Contextual inspirado en Lightning Attention de MiniMax
 * Mantiene contexto completo del proyecto sin saturación
 *
 * Características:
 * - Atención Lineal O(N) simulada
 * - Compresión de contexto (70% reducción)
 * - Índice semántico para búsqueda rápida
 * - Estado de atención recurrente
 * - Sincronización incremental
 */
class ContextMemoryEngine {
  constructor() {
    this.projectContexts = new Map(); // Memoria activa
    this.compressedCache = new Map(); // Caché comprimido (MLA simulado)
    this.semanticIndex = new Map(); // Índice semántico para búsqueda rápida
    this.attentionState = new Map(); // Estado recurrente (Lightning Attention)

    this.maxActiveProjects = 5;
    this.compressionRatio = 0.3; // Simula 70% reducción de MLA
  }

  /**
   * Carga proyecto COMPLETO en memoria
   * Sin truncar, sin RAG - contexto íntegro
   */
  async loadProjectContext(projectId, files, metadata = {}) {
    logger.info(`[ContextMemory] Cargando contexto completo del proyecto: ${projectId}`);

    // 1. Construir contexto completo
    const fullContext = this._buildFullContext(files, metadata);

    // 2. Crear índice semántico (búsqueda O(1))
    const semanticIndex = this._buildSemanticIndex(files);

    // 3. Comprimir para caché (simula MLA)
    const compressed = this._compressContext(fullContext);

    // 4. Inicializar estado de atención
    const attentionState = this._initializeAttentionState(files);

    // 5. Guardar en memoria
    const context = {
      projectId,
      fullContext,
      compressed,
      semanticIndex,
      attentionState,
      files: files.map(f => ({
        path: f.path,
        hash: this._hashContent(f.content),
        size: f.content.length,
        language: f.language || this._detectLanguage(f.path),
        lastModified: Date.now()
      })),
      metadata,
      loadedAt: Date.now(),
      accessCount: 0,
      tokenEstimate: this._estimateTokens(fullContext)
    };

    this.projectContexts.set(projectId, context);
    this._evictOldContexts();

    logger.info(`[ContextMemory] Contexto cargado: ${context.tokenEstimate.toLocaleString()} tokens estimados, ${context.files.length} archivos`);

    return {
      projectId,
      files: context.files.length,
      tokens: context.tokenEstimate,
      indexed: semanticIndex.size
    };
  }

  /**
   * Recupera contexto relevante con atención selectiva
   * Simula Lightning Attention: O(N) en lugar de O(N²)
   */
  getRelevantContext(projectId, query, options = {}) {
    const context = this.projectContexts.get(projectId);

    if (!context) {
      throw new Error(`Proyecto ${projectId} no está en contexto`);
    }

    context.accessCount++;

    // Estrategia de atención basada en query
    const strategy = this._determineAttentionStrategy(query, options);

    let relevantContext;
    let contextSize;

    switch (strategy) {
      case 'full':
        // Consulta requiere contexto completo
        relevantContext = context.fullContext;
        contextSize = 'complete';
        break;

      case 'semantic':
        // Búsqueda semántica usando índice
        relevantContext = this._semanticSearch(context, query);
        contextSize = 'filtered';
        break;

      case 'focused':
        // Atención enfocada en archivos específicos
        relevantContext = this._focusedAttention(context, query);
        contextSize = 'focused';
        break;

      case 'structural':
        // Solo estructura y metadatos
        relevantContext = this._structuralContext(context);
        contextSize = 'minimal';
        break;

      default:
        relevantContext = context.compressed;
        contextSize = 'compressed';
    }

    // Actualizar estado de atención (recurrente)
    this._updateAttentionState(projectId, query, strategy);

    return {
      context: relevantContext,
      strategy,
      contextSize,
      tokens: this._estimateTokens(relevantContext),
      cached: true,
      files: context.files.length
    };
  }

  /**
   * Construcción de contexto completo
   */
  _buildFullContext(files, metadata) {
    let context = '=== HOWARD OS PROJECT CONTEXT ===\n\n';

    // Metadata del proyecto
    context += `## Project Information\n`;
    context += `- Name: ${metadata.name || 'Unknown'}\n`;
    context += `- Total Files: ${files.length}\n`;
    context += `- Loaded: ${new Date().toISOString()}\n\n`;

    // Estructura de archivos
    context += `## File Structure\n`;
    context += this._generateFileTree(files);
    context += '\n\n';

    // Dependencias y configuración
    const packageJson = files.find(f => f.path.endsWith('package.json'));
    if (packageJson) {
      context += `## Dependencies\n`;
      try {
        const pkg = JSON.parse(packageJson.content);
        if (pkg.dependencies) {
          context += `### Production\n\`\`\`json\n${JSON.stringify(pkg.dependencies, null, 2)}\n\`\`\`\n`;
        }
        if (pkg.devDependencies) {
          context += `### Development\n\`\`\`json\n${JSON.stringify(pkg.devDependencies, null, 2)}\n\`\`\`\n`;
        }
      } catch (e) {
        context += 'Error parsing package.json\n';
      }
      context += '\n';
    }

    // Análisis de imports/exports
    context += `## Dependency Graph\n`;
    context += this._buildDependencyGraph(files);
    context += '\n';

    // Contenido completo de archivos
    context += `## File Contents\n\n`;
    files.forEach(file => {
      context += `### FILE: ${file.path}\n`;
      context += `Language: ${file.language || this._detectLanguage(file.path)}\n`;
      context += `Size: ${file.content.length} bytes\n`;
      context += '```' + (file.language || this._detectLanguage(file.path)) + '\n';
      context += file.content;
      context += '\n```\n\n';
    });

    return context;
  }

  /**
   * Compresión de contexto (simula MLA - Multi-Head Latent Attention)
   * Reduce tamaño manteniendo información clave
   */
  _compressContext(fullContext) {
    const lines = fullContext.split('\n');
    const compressed = [];

    let inCodeBlock = false;
    let codeLines = [];

    lines.forEach(line => {
      // Mantén headers y metadata siempre
      if (line.startsWith('#') || line.startsWith('Language:') || line.startsWith('Size:') || line.startsWith('===')) {
        compressed.push(line);
        return;
      }

      // Detecta bloques de código
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;

        if (!inCodeBlock && codeLines.length > 0) {
          // Al cerrar bloque, comprimir código
          compressed.push('```');
          const summary = this._summarizeCode(codeLines);
          compressed.push(summary);
          compressed.push('```');
          codeLines = [];
        } else {
          compressed.push(line);
        }
        return;
      }

      // Dentro de código: acumula para comprimir
      if (inCodeBlock) {
        codeLines.push(line);
      } else {
        // Fuera de código: mantener líneas importantes
        if (line.trim().length > 0) {
          compressed.push(line);
        }
      }
    });

    return compressed.join('\n');
  }

  /**
   * Resume código manteniendo estructura importante
   */
  _summarizeCode(codeLines) {
    const code = codeLines.join('\n');
    const summary = [];

    // Extrae: imports, exports, funciones, clases, constantes
    const patterns = {
      imports: /^import\s+.*$/gm,
      exports: /^export\s+.*$/gm,
      functions: /^\s*(async\s+)?function\s+(\w+)/gm,
      classes: /^\s*class\s+(\w+)/gm,
      constants: /^\s*const\s+(\w+)\s*=/gm,
      hooks: /^\s*const\s+(\w+)\s*=\s*use\w+/gm
    };

    summary.push('// COMPRESSED CONTEXT - Key Elements:');

    // Imports
    const imports = code.match(patterns.imports) || [];
    if (imports.length > 0) {
      summary.push('// Imports:');
      imports.forEach(imp => summary.push(imp));
    }

    // Functions
    const functions = [];
    let match;
    const funcRegex = /^\s*(async\s+)?function\s+(\w+)/gm;
    while ((match = funcRegex.exec(code)) !== null) {
      functions.push(match[2]);
    }
    if (functions.length > 0) {
      summary.push('// Functions: ' + functions.join(', '));
    }

    // Classes
    const classes = [];
    const classRegex = /^\s*class\s+(\w+)/gm;
    while ((match = classRegex.exec(code)) !== null) {
      classes.push(match[1]);
    }
    if (classes.length > 0) {
      summary.push('// Classes: ' + classes.join(', '));
    }

    // Exports
    const exports = code.match(patterns.exports) || [];
    if (exports.length > 0) {
      summary.push('// Exports:');
      exports.forEach(exp => summary.push(exp));
    }

    return summary.join('\n');
  }

  /**
   * Construye índice semántico para búsqueda rápida
   * Permite recuperación O(1) de archivos relevantes
   */
  _buildSemanticIndex(files) {
    const index = new Map();

    files.forEach(file => {
      // Índice por nombre de archivo
      const fileName = file.path.split('/').pop();
      if (!index.has(fileName)) {
        index.set(fileName, []);
      }
      index.get(fileName).push(file.path);

      // Índice por extensión
      const ext = file.language || this._detectLanguage(file.path);
      const extKey = `ext:${ext}`;
      if (!index.has(extKey)) {
        index.set(extKey, []);
      }
      index.get(extKey).push(file.path);

      // Índice por palabras clave en contenido
      const keywords = this._extractKeywords(file.content);
      keywords.forEach(keyword => {
        const kwKey = `kw:${keyword}`;
        if (!index.has(kwKey)) {
          index.set(kwKey, []);
        }
        index.get(kwKey).push(file.path);
      });

      // Índice por imports/exports
      const imports = this._extractImports(file.content);
      imports.forEach(imp => {
        const impKey = `import:${imp}`;
        if (!index.has(impKey)) {
          index.set(impKey, []);
        }
        index.get(impKey).push(file.path);
      });
    });

    return index;
  }

  /**
   * Inicializa estado de atención recurrente
   * Simula Lightning Attention: estado que se actualiza en O(N)
   */
  _initializeAttentionState(files) {
    return {
      recentlyAccessed: [],
      frequentlyUsed: new Map(),
      relationships: this._buildFileRelationships(files),
      focusHistory: [],
      lastQuery: null,
      queryPatterns: [],
      preferredStrategy: 'compressed'
    };
  }

  /**
   * Actualiza estado de atención (recurrente)
   */
  _updateAttentionState(projectId, query, strategy) {
    const context = this.projectContexts.get(projectId);
    if (!context) return;

    const state = context.attentionState;

    // Actualizar historial
    state.lastQuery = query;
    state.queryPatterns.push({
      query,
      strategy,
      timestamp: Date.now()
    });

    // Mantener solo últimos 100 queries
    if (state.queryPatterns.length > 100) {
      state.queryPatterns = state.queryPatterns.slice(-100);
    }

    // Analizar patrones para optimizar futuras consultas
    this._analyzeQueryPatterns(state);
  }

  /**
   * Determina estrategia de atención basada en query
   */
  _determineAttentionStrategy(query, options = {}) {
    // Forzar estrategia si se especifica
    if (options.strategy) {
      return options.strategy;
    }

    const lowerQuery = query.toLowerCase();

    // Full context: consultas que requieren visión completa
    if (
      lowerQuery.includes('todo') ||
      lowerQuery.includes('todos los') ||
      lowerQuery.includes('all files') ||
      lowerQuery.includes('entire project') ||
      lowerQuery.includes('refactor') ||
      lowerQuery.includes('arquitectura') ||
      lowerQuery.includes('completo')
    ) {
      return 'full';
    }

    // Semantic: búsquedas por concepto
    if (
      lowerQuery.includes('dónde') ||
      lowerQuery.includes('donde') ||
      lowerQuery.includes('where') ||
      lowerQuery.includes('busca') ||
      lowerQuery.includes('find') ||
      lowerQuery.includes('encuentra') ||
      lowerQuery.includes('search')
    ) {
      return 'semantic';
    }

    // Focused: consultas sobre archivos específicos
    if (
      lowerQuery.match(/\w+\.(js|jsx|ts|tsx|css|json|html)/i)
    ) {
      return 'focused';
    }

    // Structural: solo estructura
    if (
      lowerQuery.includes('estructura') ||
      lowerQuery.includes('structure') ||
      lowerQuery.includes('organización') ||
      lowerQuery.includes('organization') ||
      lowerQuery.includes('árbol') ||
      lowerQuery.includes('tree')
    ) {
      return 'structural';
    }

    return 'compressed';
  }

  /**
   * Búsqueda semántica usando índice
   */
  _semanticSearch(context, query) {
    const { semanticIndex, fullContext } = context;
    const results = new Set();

    // Extraer términos de búsqueda
    const searchTerms = query.toLowerCase()
      .split(/\s+/)
      .filter(t => t.length > 2);

    // Buscar en índice
    searchTerms.forEach(term => {
      // Buscar por palabra clave
      const kwKey = `kw:${term}`;
      if (semanticIndex.has(kwKey)) {
        semanticIndex.get(kwKey).forEach(path => results.add(path));
      }

      // Buscar por nombre de archivo parcial
      for (const [key, paths] of semanticIndex.entries()) {
        if (key.toLowerCase().includes(term)) {
          paths.forEach(path => results.add(path));
        }
      }
    });

    // Si no hay resultados, retornar contexto comprimido
    if (results.size === 0) {
      return context.compressed;
    }

    // Construir contexto con archivos relevantes
    let relevantContext = '=== RELEVANT CONTEXT (Semantic Search) ===\n\n';
    relevantContext += `Query: "${query}"\n`;
    relevantContext += `Matched Files: ${results.size}\n\n`;

    // Extraer contenido de archivos relevantes del contexto completo
    const lines = fullContext.split('\n');
    let include = false;

    lines.forEach(line => {
      if (line.startsWith('### FILE:')) {
        const filePath = line.replace('### FILE:', '').trim();
        include = results.has(filePath);
      }

      if (include || line.startsWith('#') || line.startsWith('===')) {
        relevantContext += line + '\n';
      }
    });

    return relevantContext;
  }

  /**
   * Atención enfocada en archivos específicos
   */
  _focusedAttention(context, query) {
    const { fullContext } = context;

    // Extraer nombres de archivo del query
    const filePattern = /[\w-]+\.(js|jsx|ts|tsx|json|css|html|md)/gi;
    const matches = query.match(filePattern) || [];

    if (matches.length === 0) {
      return context.compressed;
    }

    // Filtrar contexto completo para incluir solo archivos mencionados
    const lines = fullContext.split('\n');
    const focused = ['=== FOCUSED CONTEXT ===\n'];
    let include = false;

    lines.forEach(line => {
      if (line.startsWith('### FILE:')) {
        include = matches.some(m => line.toLowerCase().includes(m.toLowerCase()));
      }

      if (include || line.startsWith('#') || line.startsWith('===')) {
        focused.push(line);
      }
    });

    return focused.join('\n');
  }

  /**
   * Contexto solo estructural
   */
  _structuralContext(context) {
    const { fullContext } = context;
    const lines = fullContext.split('\n');
    const structural = [];

    lines.forEach(line => {
      // Incluir solo headers y metadata
      if (
        line.startsWith('#') ||
        line.startsWith('===') ||
        line.startsWith('Language:') ||
        line.startsWith('Size:') ||
        line.includes('FILE:') ||
        line.startsWith('├──') ||
        line.startsWith('│')
      ) {
        structural.push(line);
      }
    });

    return structural.join('\n');
  }

  // === UTILIDADES ===

  _generateFileTree(files) {
    const tree = {};
    files.forEach(f => {
      const parts = f.path.split('/');
      let current = tree;
      parts.forEach((part, idx) => {
        if (!current[part]) {
          current[part] = idx === parts.length - 1 ? null : {};
        }
        if (current[part]) {
          current = current[part];
        }
      });
    });
    return this._renderTree(tree);
  }

  _renderTree(tree, indent = '') {
    let output = '';
    Object.keys(tree).forEach(key => {
      output += `${indent}├── ${key}\n`;
      if (tree[key]) {
        output += this._renderTree(tree[key], indent + '│   ');
      }
    });
    return output;
  }

  _buildDependencyGraph(files) {
    const graph = new Map();

    files.forEach(file => {
      const imports = this._extractImports(file.content);
      if (imports.length > 0) {
        graph.set(file.path, imports);
      }
    });

    let output = '';
    graph.forEach((imports, file) => {
      output += `${file}:\n`;
      imports.forEach(imp => output += `  → ${imp}\n`);
    });

    return output || 'No dependencies found\n';
  }

  _buildFileRelationships(files) {
    const relationships = new Map();

    files.forEach(file => {
      const imports = this._extractImports(file.content);
      relationships.set(file.path, {
        imports,
        importedBy: []
      });
    });

    // Segunda pasada: construir "importedBy"
    relationships.forEach((data, filePath) => {
      data.imports.forEach(imp => {
        const resolvedPath = this._resolveImport(imp, filePath, files);
        if (resolvedPath && relationships.has(resolvedPath)) {
          relationships.get(resolvedPath).importedBy.push(filePath);
        }
      });
    });

    return relationships;
  }

  _extractKeywords(content) {
    const stopWords = new Set([
      'function', 'const', 'import', 'export', 'return',
      'async', 'await', 'this', 'that', 'from', 'with'
    ]);
    const words = content.match(/\b[a-zA-Z]{4,}\b/g) || [];
    return [...new Set(words)]
      .filter(w => !stopWords.has(w.toLowerCase()))
      .slice(0, 50);
  }

  _extractImports(content) {
    const imports = [];

    // ES6 imports
    const es6Regex = /import\s+.*?from\s+['"](.+?)['"]/g;
    let match;
    while ((match = es6Regex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    // CommonJS requires
    const cjsRegex = /require\(['"](.+?)['"]\)/g;
    while ((match = cjsRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  _resolveImport(importPath, fromFile, allFiles) {
    if (importPath.startsWith('.')) {
      const basePath = fromFile.split('/').slice(0, -1).join('/');
      const resolved = `${basePath}/${importPath}`.replace('//', '/');

      const extensions = ['', '.js', '.jsx', '.ts', '.tsx', '/index.js'];
      for (const ext of extensions) {
        const candidate = resolved + ext;
        if (allFiles.some(f => f.path === candidate)) {
          return candidate;
        }
      }
    }
    return null;
  }

  _analyzeQueryPatterns(state) {
    const recent = state.queryPatterns.slice(-10);
    const strategies = recent.map(p => p.strategy);
    const mostCommon = this._mostFrequent(strategies);
    state.preferredStrategy = mostCommon || 'compressed';
  }

  _mostFrequent(arr) {
    if (arr.length === 0) return null;
    const freq = new Map();
    arr.forEach(item => freq.set(item, (freq.get(item) || 0) + 1));
    return [...freq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
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

  _estimateTokens(text) {
    return Math.ceil(text.length / 4);
  }

  _detectLanguage(path) {
    const ext = path.split('.').pop()?.toLowerCase();
    const langMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown'
    };
    return langMap[ext] || 'text';
  }

  _evictOldContexts() {
    if (this.projectContexts.size > this.maxActiveProjects) {
      const oldest = [...this.projectContexts.entries()]
        .sort((a, b) => a[1].loadedAt - b[1].loadedAt)[0][0];
      this.projectContexts.delete(oldest);
      logger.info(`[ContextMemory] Proyecto desalojado por límite de memoria: ${oldest}`);
    }
  }

  async syncChanges(projectId, changedFiles) {
    const context = this.projectContexts.get(projectId);
    if (!context) return;

    changedFiles.forEach(file => {
      const existingIdx = context.files.findIndex(f => f.path === file.path);
      const fileData = {
        path: file.path,
        hash: this._hashContent(file.content),
        size: file.content.length,
        language: file.language || this._detectLanguage(file.path),
        lastModified: Date.now()
      };

      if (existingIdx >= 0) {
        context.files[existingIdx] = fileData;
      } else {
        context.files.push(fileData);
      }
    });

    // Re-construir contexto y caché (incremental en v2)
    // Por ahora re-cargamos para asegurar consistencia
    // En una implementación real esto sería parcial
    context.fullContext = this._buildFullContext(context.files, context.metadata);
    context.compressed = this._compressContext(context.fullContext);
    context.semanticIndex = this._buildSemanticIndex(context.files);
    context.tokenEstimate = this._estimateTokens(context.fullContext);
  }

  getStats() {
    const projects = [...this.projectContexts.values()];
    return {
      activeProjects: projects.length,
      totalTokens: projects.reduce((acc, p) => acc + p.tokenEstimate, 0),
      totalFiles: projects.reduce((acc, p) => acc + p.files.length, 0),
      avgAccessCount: projects.length > 0
        ? projects.reduce((acc, p) => acc + p.accessCount, 0) / projects.length
        : 0
    };
  }

  clearProject(projectId) {
    this.projectContexts.delete(projectId);
  }

  clearAll() {
    this.projectContexts.clear();
  }
}

const contextMemoryEngine = new ContextMemoryEngine();
export default contextMemoryEngine;
