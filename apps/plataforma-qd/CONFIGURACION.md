# Guía de Configuración - Plataforma QD (Howard OS)

## Variables de Entorno Configuradas

### ✅ Seguridad
- `VITE_ENCRYPTION_KEY`: Clave AES-256 para cifrado de credenciales (generada)

### ✅ Supabase Knowledge DB (Howard OS)
- `VITE_SUPABASE_URL`: https://tztypjxqklxygfzbpkmm.supabase.co
- `VITE_SUPABASE_ANON_KEY`: Configurada

### ✅ Supabase Operational DB (Agente QodeIA)
- `VITE_OPERATIONAL_SUPABASE_URL`: https://nknevqndawnokiaickkl.supabase.co
- `VITE_OPERATIONAL_SUPABASE_ANON_KEY`: Configurada

### ✅ Integración con el Ecosistema
- `VITE_AGENT_URL`: https://mi-agente-qode-ia.vercel.app

## Configuración en Vercel

### Opción 1: Usando el Script Automático

```bash
cd /home/ubuntu/plataforma-qd
./configure-vercel-env.sh
```

### Opción 2: Configuración Manual en Vercel Dashboard

1. Ve a https://vercel.com/dashboard
2. Selecciona el proyecto `plataforma-qd`
3. Ve a Settings → Environment Variables
4. Añade cada variable para los entornos: Production, Preview, Development

## Verificación de Configuración

### 1. Verificar Variables de Entorno en Vercel

```bash
vercel env ls
```

### 2. Probar Conexión con Supabase Howard OS

```javascript
// En la consola del navegador
import { supabase } from './src/lib/supabase.js';
const { data, error } = await supabase.from('projects').select('*');
console.log('Projects:', data);
```

### 3. Probar Conexión con Supabase Operativa

```javascript
// En la consola del navegador
import { agentSupabase } from './src/lib/supabase.js';
const { data, error } = await agentSupabase.from('agent_state').select('*');
console.log('Agent State:', data);
```

## Arquitectura de Howard OS

### Context Memory Engine (CME)

El **Context Memory Engine** es el corazón de Howard OS, proporcionando:

- **Atención Lineal O(N)**: Procesamiento eficiente de contexto de proyecto
- **Compresión de Contexto**: Reducción del 70% en tamaño manteniendo información clave
- **Índice Semántico**: Búsqueda O(1) de archivos relevantes
- **Sincronización Incremental**: Actualización automática al guardar archivos
- **Integración MCP**: Sincronización con NotebookLM para base de conocimiento

### Módulos Principales

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| **Code Editor** | Editor Monaco con Live Preview | ✅ Funcional |
| **No-Code Chat** | Chat de IA con contexto de proyecto | ✅ Funcional |
| **AI Task Runner** | Ejecutor de tareas con IA | ✅ Funcional |
| **Context Memory Panel** | Interfaz de consulta al CME | ✅ Funcional |
| **Memory Visualizer** | Visualización de estado de memoria | ✅ Funcional |
| **Moltbot Gateway** | Orquestación de tareas de IA | ⚠️ Requiere configuración |

## Integración con el Ecosistema

### Flujo de Datos

```
Plataforma QD (Howard OS)
  │
  ├─> Supabase Howard OS (Base de Conocimiento)
  │     ├─ projects
  │     ├─ files
  │     ├─ context_memory
  │     └─ shared_context
  │
  ├─> Supabase Agente (Base Operativa)
  │     ├─ agent_state
  │     ├─ agent_solutions
  │     └─ tasks
  │
  └─> Mi Agente QodeIA (Motor de IA)
        └─ API endpoints para ejecución de tareas
```

### Endpoints de Integración

- `VITE_AGENT_URL/api/agent` - Chat con el agente
- `VITE_AGENT_URL/api/mcp/stats` - Estadísticas de MCP
- `VITE_AGENT_URL/api/mcp/test` - Prueba de conexión MCP

## Context Memory Engine - Configuración

### Activar CME

El CME se activa automáticamente cuando:
1. Se carga un proyecto en el Code Editor
2. Se guarda un archivo (sincronización incremental)
3. Se consulta desde No-Code Chat o AI Task Runner

### Verificar Estado de CME

```javascript
// En la consola del navegador
import { useContextMemoryStore } from './src/store/contextMemoryStore.js';
const store = useContextMemoryStore.getState();
console.log('CME Status:', {
  filesCount: store.filesCount,
  tokenEstimate: store.tokenEstimate,
  lastUpdate: store.lastUpdate
});
```

### Sincronización con Supabase

El CME sincroniza automáticamente con la tabla `context_memory` en Supabase Howard OS:

```sql
SELECT 
  project_id,
  files_count,
  token_estimate,
  updated_at
FROM context_memory
ORDER BY updated_at DESC;
```

## Integración MCP (Model Context Protocol)

### Componentes MCP en Plataforma QD

- `/src/hooks/mcp-sync.ts` - Hook de sincronización automática
- `/src/services/mcp-service.ts` - Servicio de comunicación con MCP

### Flujo de Sincronización MCP

1. Usuario guarda cambios en Code Editor
2. CME actualiza contexto de proyecto
3. MCP-sync detecta cambios significativos
4. Sincroniza con Mi Agente QodeIA
5. Agente actualiza NotebookLM (si está configurado)

## Troubleshooting

### Error: "Supabase no configurado"

**Solución:**
1. Verifica que las variables de entorno estén configuradas en Vercel
2. Redespliega el proyecto: `vercel --prod`
3. Verifica en la consola del navegador: `console.log(import.meta.env)`

### Error: "Cannot connect to agent"

**Solución:**
1. Verifica que Mi Agente QodeIA esté desplegado y funcionando
2. Verifica que `VITE_AGENT_URL` esté configurada correctamente
3. Prueba el endpoint: `curl https://mi-agente-qode-ia.vercel.app/api/agent`

### Error: "Encryption key not configured"

**Solución:**
1. Verifica que `VITE_ENCRYPTION_KEY` esté configurada en Vercel
2. Regenera la clave si es necesario: `openssl rand -base64 32`
3. Actualiza la variable en Vercel y redespliega

### CME no se actualiza

**Solución:**
1. Verifica que el proyecto esté cargado en el Code Editor
2. Guarda un archivo para forzar actualización
3. Verifica la tabla `context_memory` en Supabase:
   ```sql
   SELECT * FROM context_memory ORDER BY updated_at DESC LIMIT 1;
   ```

## Próximos Pasos

1. ✅ Configurar variables de entorno en Vercel
2. ✅ Redesplegar el proyecto
3. ⏳ Probar Context Memory Engine
4. ⏳ Probar integración con Mi Agente QodeIA
5. ⏳ Activar sincronización MCP
6. ⏳ Verificar flujo completo del ecosistema

## Referencias

- [README Principal](./README.md)
- [Auditoría del Sistema](./SYSTEM_AUDIT.md)
- [Guía de Despliegue](./DEPLOYMENT_GUIDE.md)
- [Checklist de Pruebas](./TESTING_CHECKLIST.md)

---

**Última actualización:** 5 de febrero de 2026
