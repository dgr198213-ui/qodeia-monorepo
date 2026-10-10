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

Los PRs [#14](https://github.com/dgr198213-ui/qodeia-monorepo/pull/14) y [#15](https://github.com/dgr198213-ui/qodeia-monorepo/pull/15) corrigieron las herramientas de Supabase desactivadas, `execute`/`chat`/`memory` solo admin, `reload` protegido o eliminado y el test intermitente de `mcp/client.test.ts` arreglado.

## Pendiente

No resuelto por esos PRs: credenciales en `localStorage`; propiedad de proyectos y conversaciones; herramientas de Supabase acotadas por usuario; aprobaciones humanas persistentes; ruta de memoria; quién usa `EnhancedAgent`; que las migraciones 0001..0007 estén aplicadas en producción; variables de entorno reales de Vercel; contradicciones entre README y `CLAUDE.md`.

## Aviso

README y `CLAUDE.md` siguen afirmando aprobación humana de operaciones destructivas, y esa afirmación no se sostiene en el código auditado.
