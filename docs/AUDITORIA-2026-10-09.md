# Auditoría de seguridad — 2026-10-09

> Auditoría de solo lectura del commit `33d25cee3808ada69d2d0ee2ba027a3aee03b568`. Lectura de código en GitHub; sin ejecución, sin pruebas de penetración y sin acceso a producción.

## Hallazgos verificados en código en ese commit

1. `SecureStorage.js` cifra las credenciales de `localStorage` con `VITE_ENCRYPTION_KEY` o `default-key-change-me`; las variables `VITE_*` se incrustan en el bundle del cliente, así que el cifrado no protege.
2. `verifyAuth()` en `lib/auth.ts` solo identifica al usuario y devuelve `null` si falla; `serviceClient` usa `service_role`.
3. `execute` y `chat` llegan a `CEOOrchestrator`, que delega en especialistas a partir de texto libre del usuario, sin control de rol.
4. `tools/supabase.ts` ofrecía `insertData`, `queryData`, `updateData` y `deleteData` con tabla y filtros elegidos por el LLM sobre un cliente `service_role`.
5. `guardrails.ts` guarda aprobaciones en un `Map` en memoria, no está conectado a esas herramientas y su lista de operaciones peligrosas no incluye `deleteData`.
6. `/api/agent/reload` no tenía autenticación.
7. `/api/agent/memory` y `EnhancedContextMemory.ts` no comprueban propiedad de `projectId`; hoy no filtran datos porque `search()` se llama sin `initializeProject()`.
8. `tools/github.ts` y `tools/vercel.ts` son simulados.
9. `/api/mcp/update-env` exige JWT y rol admin y responde siempre 501.

## Corregido por los PRs A y B

El PR [#14](https://github.com/dgr198213-ui/qodeia-monorepo/pull/14) corrige el rechazo no controlado intermitente de `mcp/client.test.ts` (test de expiración de caché), que también fallaba en `main` limpio.

El PR [#15](https://github.com/dgr198213-ui/qodeia-monorepo/pull/15) deja `supabaseTools` vacío; bloquea en código la delegación al especialista `supabase`; y exige `app_metadata.role === 'admin'` (JWT verificado en servidor) para `execute`, `chat`, `memory`, `reload` y `POST /api/agent`.

## Hallazgos nuevos tras el PR B (no corregidos)

1. `GET /api/mcp/auth/callback`, `POST /api/mcp/auth/google`, `GET /api/mcp/stats` y `POST /api/mcp/test` no tienen autenticación y usan el cliente `supabase` de agent-core.
2. Las rutas `/api/agent/*` y `/api/mcp/*` en `web-qodeia` son proxies sin autenticación propia.
3. Las páginas `/admin/mcp` de agent-core (línea 231) y web-qodeia (línea 219) llaman a `/api/agent/reload` sin `Authorization`; por tanto reciben 401 tras el PR #15.
4. `sync`, `sync-solution` y `mcp/sync` solo usan `verifyAuth` con `serviceClient`.
5. `EnhancedAgent.ts` y `agent.ts` siguen cargando `mcp_notebooklm`, con herramientas que escriben (`queryDocumentation` y `syncSolutionToKnowledgeBase`); no se encontraron importadores.

## Límites de las pruebas

La ruta `POST /api/agent` no tiene pruebas. `reload` solo prueba el 401. Los casos de administrador usan dependencias simuladas y no una sesión real. El estado en producción no está verificado.

## Pendiente

No resuelto por esos PRs: credenciales en `localStorage`; propiedad de proyectos y conversaciones; herramientas de Supabase acotadas por usuario; aprobaciones humanas persistentes; ruta de memoria; quién usa `EnhancedAgent`; que las migraciones 0001..0007 estén aplicadas en producción; variables de entorno reales de Vercel; contradicciones entre README y `CLAUDE.md`; autenticación de los endpoints/proxies MCP enumerados, y envío del bearer token desde las páginas administrativas a `/api/agent/reload`.

## Aviso

README y `CLAUDE.md` siguen afirmando aprobación humana de operaciones destructivas, y esa afirmación no se sostiene en el código auditado.
