# CLAUDE.md — Contexto de trabajo del monorepo QodeIA

> Documento de continuidad para sesiones de trabajo (humanas o con agentes).
> **Actualízalo al final de cada sesión que cambie el estado del repo.**
> Última actualización: 2026-07-10 (Fase 3C completada — CI sin exclusiones).

## Qué es este repo

Monorepo **pnpm 10 + Turborepo 2** (Node >= 20) de la plataforma agent-first QodeIA:
un orquestador multi-agente (`packages/agent-core`) + apps web que lo exponen.
La descripción funcional y el diagrama están en el README.

## Estado actual (leer antes de tocar nada)

| Área | Estado |
|---|---|
| CI (`.github/workflows/ci.yml`) | ✅ Verde. `--frozen-lockfile` obligatorio. Un único workflow. |
| `@qodeia/agent-core` | ✅ En el pipeline. 0 errores TS, 96/96 tests. |
| `@qodeia/arch` (qodeia-arch) | ✅ En el pipeline (Fase 3C): 0 errores TS. App Vite+Express generada por Manus; saneada (plugin manus-runtime y 5 componentes shadcn muertos eliminados). Sigue en la raíz porque el Root Directory de su proyecto Vercel apunta ahí — moverla a `apps/` requiere cambiar ese ajuste en el dashboard a la vez. |
| Deploys Vercel | ✅ 4 proyectos en producción: web-qodeia, plataforma-qd, agent-core, qodeia-arch. `api`/`api-houh` son Fastify y NO se pueden desplegar en Vercel. |
| Env vars en Vercel | ⚠️ Pendientes de configurar por Dani. El código usa fallbacks `placeholder` que permiten compilar pero no conectar. |

## Historial de fases

- **Fase 0 (PR #5)**: CI consolidado (5 workflows → 1), lockfile raíz regenerado
  (el commiteado era YAML corrupto), fix de typecheck en `shared` y `plataforma-qd`,
  `vitest run` en CI, `private: true` en todos los paquetes, `update-env` con auth.
- **Deploys (PR #6)**: eliminados los `vercel.json` con `npm install` (rompían el
  protocolo `workspace:`), borrado el lockfile anidado corrupto de agent-core,
  Next.js 15.1.0 → **15.5.20** (CVEs React2Shell + mayo 2026), Tailwind de agent-core
  v4-alpha → **v3.4** (la config era estilo v3), fallbacks placeholder en clientes
  Supabase a nivel de módulo, `/home` sin onClick en Server Component.
- **Fase 2 (esta)**: agent-core saneado — 36 errores TS a 0, 60 tests rotos a 0
  (96/96), reincorporado al CI. Eliminada la jerarquía duplicada `__tests__/`
  (codificaba contratos contradictorios con los tests colocados) y el hook muerto
  `hooks/mcp-sync.ts`. Implementado `getPageRankScores` en governance. Reconstruido
  el constructor de `MCPClient` (un merge había fusionado `parseConfig` dentro).

## Decisiones de diseño que NO revertir sin motivo

1. **CI con `--frozen-lockfile`**: barrera deliberada contra cambios de dependencias
   no revisados (histórico de un colaborador agente, "Manus", introduciendo breaking
   changes). Si el install falla en CI, se regenera el lockfile en el PR, no se
   quita el flag.
2. **Tests colocados junto al código** (`modulo.test.ts` al lado de `modulo.ts`).
   No recrear `__tests__/` paralelos: ya provocó contratos duplicados divergentes.
3. **`parseConfig`/`updateConfig` de MCPClient degradan con elegancia**: config
   inválida → log + defaults (constructor) o log + conservar la previa (update).
   Nunca lanzar por config mala; el agente no debe caer por eso.
4. **`getMCPClient` es singleton real**: con config nueva se llama `updateConfig`
   sobre la instancia existente (crear otra dejaría procesos MCP huérfanos), y solo
   si la config trae `mcpServers` no vacío.
5. **Clientes Supabase a nivel de módulo siempre con fallback placeholder**
   (`https://placeholder.supabase.co` / `'placeholder'`): sin esto, `next build`
   muere en prerender cuando no hay env vars (CI, Vercel sin configurar).
6. **Todos los paquetes `"private": true`**. Nada de este repo se publica a npm.
7. **Next.js**: mantener en la última 15.x parcheada (o superior). Vercel bloquea
   deploys con versiones vulnerables.

## Fase 3A — columna vertebral (completada)

- **Contrato IDE↔Agente implementado**: 7 rutas nuevas en agent-core —
  `/api/health`, `/api/agent/{chat,execute,memory,sync,sync-solution}` y
  `/api/mcp/sync` — como fachadas finas sobre CEOOrchestrator y
  EnhancedContextMemory. Auth compartida en `lib/auth.ts` (verifyAuth).
- **Esquema unificado**: `supabase/migrations/0001..0005` es LA fuente de
  verdad (núcleo operativo con RLS corregidas, comunidad, plataforma IDE,
  governance+memoria — incluye tablas que el código usaba sin CREATE TABLE —
  y ecosistema: `kb_sources` + `user_credentials`). Los 9 SQL antiguos están
  en `supabase/legacy/` solo como referencia; NO aplicarlos.
- **JWT único en el IDE**: helper `apps/plataforma-qd/src/services/agentAuth.js`
  (getAgentHeaders/getAgentToken/AGENT_BASE_URL). Cableado en mcp-service,
  NoCodeChat, BiasFirewall, HypeDetector y AgentApiClient (ensureSessionToken).
  AGENT_URL por defecto → `https://qodeia-monorepo-agent-core.vercel.app`.
- **Pendiente manual (Dani)**: aplicar las migraciones 0001..0005 en el
  proyecto Supabase único (SQL Editor, en orden) y poner las env vars reales
  en Vercel. Hasta entonces el contrato existe pero la BD no.

## Fase 3B — prototipos del IDE cerrados (completada)

- **CodeEditor ↔ Agente**: botón "Pedir al Agente" que envía instrucción +
  buffer como `context {language, code}` a POST /api/agent; la respuesta se
  muestra en panel y el código puede insertarse vía EditorBridge.insertCode.
  "Guardar" persiste en `project_files` (upsert por project_id+path).
- **Connectors**: de stub a panel real — GET /api/health + /api/mcp/stats
  con refresco manual.
- **MoltbotPanel**: chat conectado al agente (mensaje prefijado [MOLBOT]
  para que el CEO delegue en MolbotSpecialist).
- **SolveItIterator**: descomposición iterativa de problemas con respuesta
  JSON estructurada (mismo patrón que BiasFirewall) y render del plan.
- Los 4 usan el helper `agentAuth.js` (JWT único de la Fase 3A).

## Fase 3C — higiene estructural (completada)

- **qodeia-arch saneado**: 22 errores TS → 0. Eliminados `vite-plugin-manus-runtime`
  (artefacto del entorno Manus, causa del error de overload en vite.config) y 5
  ficheros muertos (ComponentShowcase, Map, ui/chart, ui/resizable, ui/calendar —
  ninguno ruteado ni importado). Rutas reales: Home, Dashboard, Credentials.
- **Paquetes esqueleto eliminados**: orchestration, workflows, prompts, tools,
  memory (52 líneas de stubs en total, cero importadores). Si algún día se
  extrae la lógica de agent-core, se crearán con contenido real, no vacíos.
- **plataforma-qd**: borrados los dirs raíz components/, hooks/ y lib/ (código
  muerto que dependía del paquete inexistente @qodeia/agent-sdk); lint con
  ratchet `--max-warnings 260` (hoy ~229: pueden bajar, no subir).
- **CI SIN FILTROS por primera vez**: lint/typecheck/test/build sobre el
  monorepo completo.

## Auth del ecosistema (decisión 2026-07-10)

**Email + contraseña como único método** en portal e IDE. Se eliminó el OAuth
de Google (login de usuarios) para evitar el mantenimiento de Google Cloud
Console en fase exploratoria; las rutas `/api/mcp/auth/google` que quedan son
otra cosa (integración NotebookLM de la capa MCP). Si algún día se quiere
recuperar Google: reactivar el proveedor en Supabase y añadir el botón — las
identidades se vinculan por email, no hay migración. Nota operativa: en el
dashboard de Supabase conviene desactivar el proveedor Google y revisar si se
exige confirmación de email en signUp.

## Estudio del ecosistema (leer antes de la Fase 3)

`docs/ARQUITECTURA-ECOSISTEMA.md` contiene el mapa completo de integración:
los 4 gaps que impiden que las piezas funcionen como plataforma (contrato de
API roto entre IDE y agente, identidad fragmentada en 3 Supabases, esquema de
datos dividido, credenciales en localStorage), 4 ADRs con recomendación, el
inventario de los 13 módulos del IDE con su estado real, y el roadmap 3A/3B/3C.
Hallazgo clave: **ningún flujo IDE→Agente funciona hoy de extremo a extremo**
(los endpoints que consume AgentApiClient no existen y los módulos que llaman
a /api/agent no envían JWT).

## Deuda conocida / próximos pasos

- **Fase 3 (pendiente)**: reubicar `qodeia-arch` (es una app full-stack, no docs)
  y arreglar sus 22 errores TS o archivarla; extraer la lógica de agente de
  `agent-core` a un paquete puro sin Next/React y mover su UI a `apps/`;
  completar o eliminar los paquetes esqueleto (`orchestration`, `workflows`,
  `prompts`, `tools`, `memory` — hoy son stubs, la lógica real vive en
  `agent-core/agent/`).
- **Esquemas SQL**: siguen dispersos (7+ ficheros en agent-core, más copias en
  shared y plataforma-qd). Consolidar en un único `supabase/migrations/`.
- **plataforma-qd**: reintroducir `--max-warnings` con ratchet (229 warnings);
  decidir si se borran los dirs raíz `components/`, `hooks/` y `lib/` (código
  muerto excluido del tsconfig, depende del paquete inexistente
  `@qodeia/agent-sdk`).
- **Tipado Supabase real**: sustituir los `SupabaseClient<any>` por tipos
  generados (`supabase gen types typescript`).
- **SecureStorage (plataforma-qd)**: migrar credenciales de `localStorage` a
  almacenamiento server-side. La clave AES actual viaja en el bundle público.
- **Vercel**: borrar los proyectos `qodeia-monorepo-api` y `qodeia-monorepo-api-houh`.

## Convenciones de trabajo

- Rama por fase (`fase2/agent-core`), PR a `main`, merge por **squash** tras CI verde.
- Commits en español, formato convencional (`fix:`, `feat:`, `chore:`), con el
  porqué en el cuerpo.
- Al cerrar una sesión con cambios: actualizar este archivo y la sección de
  estado del README.
- Los tokens de GitHub no se pegan en chats ni se commitean. Si uno se expone,
  se rota inmediatamente.
