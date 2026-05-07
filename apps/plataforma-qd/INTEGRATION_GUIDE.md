# Guía de Integración: CME ↔ Agente QodeIA

## 📋 Resumen

Esta guía documenta la integración completa entre el **Context Memory Engine (CME)** de Plataforma-qd y el **Agente Autónomo** de Mi-agente-QodeIA.

---

## 🔄 Flujo de Integración

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUARIO (Howard OS)                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ├─ Carga Proyecto
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │   Context Memory Engine (CME)          │
        │   - fullContext (completo)             │
        │   - compressed (70% reducción)         │
        │   - semanticIndex (búsqueda O(1))      │
        │   - attentionState (Lightning Attention)│
        └────────────┬─────────────────────────────┘
                     │
                     ├─ syncProject()
                     │
                     ▼
        ┌────────────────────────────────────────┐
        │       AgentApiClient                   │
        │   - executeTask()                      │
        │   - chat()                             │
        │   - syncProject()                      │
        │   - queryMemory()                      │
        └────────────┬─────────────────────────────┘
                     │
                     ├─ POST /api/agent/execute
                     ├─ POST /api/agent/chat
                     ├─ POST /api/agent/sync
                     │
                     ▼
    ┌──────────────────────────────────────────────┐
    │    Mi-agente-QodeIA (Backend)                │
    │                                              │
    │  ┌──────────────────────────────────────┐   │
    │  │  Agent Core                          │   │
    │  │  - Prioriza CME context              │   │
    │  │  - Fallback a pgvector (L2 cache)    │   │
    │  │  - Ejecuta herramientas              │   │
    │  └──────────────────────────────────────┘   │
    │                                              │
    │  ┌──────────────────────────────────────┐   │
    │  │  Supabase                            │   │
    │  │  - memory_vectors (embeddings)       │   │
    │  │  - messages (historial)              │   │
    │  │  - projects (metadata)               │   │
    │  │  - agent_state (estado)              │   │
    │  └──────────────────────────────────────┘   │
    └──────────────────────────────────────────────┘
```

---

## 📦 Archivos Integrados

### Backend (Mi-agente-QodeIA)

| Archivo | Descripción |
|---------|-------------|
| `app/api/agent/execute/route.ts` | Ejecuta tareas con contexto CME |
| `app/api/agent/chat/route.ts` | Chat conversacional con streaming SSE |
| `app/api/agent/sync/route.ts` | Sincroniza proyecto al agente |
| `agent/core/agent.ts` | Core del agente (prioriza CME) |

### Frontend (Plataforma-qd)

| Archivo | Descripción |
|---------|-------------|
| `src/services/AgentApiClient.js` | Cliente API para comunicación |
| `src/components/modules/development/NoCodeChat/NoCodeChat.jsx` | Chat con CME |
| `src/components/modules/development/AITaskRunner.jsx` | Ejecutor de tareas |

---

## 🚀 Configuración Requerida

### 1. Variables de Entorno (Plataforma-qd)

```bash
# .env.local
VITE_AGENT_URL=https://mi-agente-qode-ia.vercel.app
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Variables de Entorno (Mi-agente-QodeIA)

```bash
# .env.local
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### 3. Schema de Supabase

Ejecutar en el SQL Editor de Supabase:

```sql
-- Tabla de Proyectos
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_projects_updated ON projects(updated_at DESC);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔌 Flujos de Uso

### Flujo 1: Chat Conversacional

```javascript
// 1. Usuario escribe mensaje en NoCodeChat
const message = "¿Cuál es la estructura de este proyecto?";

// 2. NoCodeChat llama a AgentApiClient.chat()
const response = await agentApiClient.chat(
  message,
  projectId,
  conversationId
);

// 3. AgentApiClient obtiene contexto del CME
const cmeContext = contextMemoryEngine.getRelevantContext(
  projectId,
  message,
  { strategy: 'auto', maxTokens: 30000 }
);

// 4. Envía a /api/agent/chat con contexto
POST /api/agent/chat {
  message,
  projectId,
  conversationId,
  context: {
    content: cmeContext.context,
    strategy: cmeContext.strategy,
    tokens: cmeContext.tokens,
    source: 'cme'
  }
}

// 5. Agent prioriza contexto CME
if (context.source === 'cme') {
  projectContext = context.content;
} else {
  projectContext = await queryPgvector(query);
}

// 6. Respuesta en streaming SSE
data: { type: 'chunk', content: 'El proyecto tiene...' }
data: { type: 'chunk', content: ' tres módulos principales' }
data: [DONE]
```

### Flujo 2: Ejecución de Tareas

```javascript
// 1. Usuario selecciona "Security Audit" en AITaskRunner
const task = {
  type: 'audit',
  description: 'Perform comprehensive security audit',
  files: ['src/auth.js', 'src/api.js'],
  options: { detailed: true }
};

// 2. AITaskRunner llama a AgentApiClient.executeTask()
const result = await agentApiClient.executeTask(task, projectId);

// 3. AgentApiClient obtiene contexto del CME
const cmeContext = contextMemoryEngine.getRelevantContext(
  projectId,
  task.description,
  { strategy: 'auto', maxTokens: 50000 }
);

// 4. Envía a /api/agent/execute con contexto
POST /api/agent/execute {
  task,
  projectId,
  context: {
    content: cmeContext.context,
    strategy: cmeContext.strategy,
    tokens: cmeContext.tokens,
    source: 'cme'
  }
}

// 5. Agent ejecuta herramientas con contexto completo
// 6. Respuesta JSON con resultado
{
  status: 'completed',
  result: '✅ Security audit completed. Found 2 issues...',
  metadata: {
    duration: 2500,
    toolsUsed: ['analyzeCode', 'checkDependencies'],
    contextUsed: { source: 'cme', strategy: 'full', tokens: 45000 }
  }
}
```

### Flujo 3: Sincronización de Proyecto

```javascript
// 1. Usuario carga proyecto en Howard OS
// 2. AITaskRunner detecta cambio y llama syncProjectToAgent()

const result = await agentApiClient.syncProject(
  projectId,
  projectFiles,
  { name: projectId, source: 'howard-os' }
);

// 3. AgentApiClient carga en CME primero
const cmeStats = await contextMemoryEngine.loadProjectContext(
  projectId,
  projectFiles,
  metadata
);
// → CME carga: fullContext, compressed, semanticIndex, attentionState

// 4. Envía índice al agente para L2 cache
POST /api/agent/sync {
  projectId,
  metadata,
  stats: cmeStats,
  fileIndex: [
    { path: 'src/app.js', language: 'javascript', size: 2048, hash: 'abc123' },
    ...
  ]
}

// 5. Agente crea embeddings en pgvector
// 6. Respuesta de éxito
{
  status: 'success',
  projectId,
  stats: {
    files: 42,
    embeddings: 42,
    tokens: 125000
  }
}
```

---

## 🧠 Estrategias de Contexto (CME)

El CME elige automáticamente la mejor estrategia según la query:

| Estrategia | Uso | Tokens | Velocidad |
|-----------|-----|--------|-----------|
| `full` | Consultas que requieren contexto completo | 100% | Lenta |
| `semantic` | Búsqueda por palabras clave | 30-50% | Rápida |
| `focused` | Archivos específicos mencionados | 20-40% | Muy rápida |
| `structural` | Solo estructura y metadatos | 5-10% | Instantánea |
| `compressed` | Contexto resumido | 30% | Rápida |

---

## 📊 Métricas Esperadas

### Performance

- **Load time (CME):** < 2s para 100 archivos
- **Sync time (incremental):** < 100ms por archivo
- **Chat response (primera respuesta):** < 3s
- **Task execution:** 2-5 min (depende de la tarea)

### Tokens

- **Reducción vs sin CME:** ~50% (CME comprime + estrategia selectiva)
- **Token usage por chat:** 5,000-30,000 (vs 50,000+ sin CME)
- **Token usage por tarea:** 20,000-50,000 (vs 100,000+ sin CME)

### Precisión

- **Respuestas contextuales:** +85% (vs sin CME)
- **Detección de cambios:** Instantánea (sync incremental)
- **Fallback a pgvector:** < 1% de casos (CME siempre disponible)

---

## 🐛 Troubleshooting

### "CME context not found"

**Causa:** Proyecto no está cargado en memoria.

**Solución:**
```javascript
// Verificar en consola
contextMemoryEngine.projectContexts.size > 0

// Si es 0, cargar manualmente
await contextMemoryEngine.loadProjectContext(
  projectId,
  files,
  metadata
);
```

### "CORS error en fetch"

**Causa:** Headers CORS no configurados en Vercel.

**Solución:** Crear `vercel.json` en Mi-agente-QodeIA:
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type" }
      ]
    }
  ]
}
```

### "Streaming no funciona"

**Causa:** Runtime no es 'edge' o Content-Type incorrecto.

**Solución:** Verificar en `app/api/agent/chat/route.ts`:
```typescript
export const runtime = 'edge';

return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  }
});
```

### "Token limit exceeded"

**Causa:** Contexto demasiado grande.

**Solución:** Reducir maxTokens:
```javascript
cmeContext = contextMemoryEngine.getRelevantContext(
  projectId,
  query,
  { strategy: 'compressed', maxTokens: 20000 }
);
```

---

## 🔐 Seguridad

### Consideraciones

1. **Contexto en Cliente:** El CME vive en el navegador (localStorage). Datos sensibles no deben exponerse.
2. **API Keys:** Nunca enviar API keys en contexto CME. Usar tokens de sesión.
3. **RLS en Supabase:** Habilitar Row Level Security en tablas de memoria.

### Implementación Recomendada

```sql
-- Habilitar RLS
ALTER TABLE public.memory_vectors ENABLE ROW LEVEL SECURITY;

-- Política: solo service_role puede escribir
CREATE POLICY "Allow service_role" ON public.memory_vectors
FOR ALL USING (current_setting('request.role', true) = 'service_role');
```

---

## 📚 Referencias

- [Context Memory Engine - Arquitectura](./src/services/ContextMemoryEngine.js)
- [Agent Core - Lógica](./agent/core/agent.ts)
- [API Reference - Endpoints](./app/api/agent/)
- [Supabase Schema](./supabase_schema.sql)

---

## 🎯 Próximos Pasos

1. ✅ Integración CME ↔ Agente completada
2. ⏳ Implementar MCP sync real con NotebookLM
3. ⏳ Multi-user support (si se requiere)
4. ⏳ WebLLM local para modo offline
5. ⏳ Analytics dashboard para métricas CME

---

**Creado con 💛 para el ecosistema QodeIA**
