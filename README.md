# QodeIA Monorepo

Plataforma **agent-first** para desarrollo asistido por agentes autónomos: un orquestador multi-agente (CEO + especialistas) con memoria contextual, integración MCP y guardrails de seguridad, más las aplicaciones web que lo exponen.

Monorepo gestionado con **pnpm 10 + Turborepo 2** (Node >= 20).

---

## Estado del proyecto

> Última actualización: julio 2026

| Área | Estado |
|---|---|
| Infraestructura del monorepo (pnpm, Turbo, ESLint 9, Husky, CI) | ✅ Operativa |
| `@qodeia/shared`, `apps/web-qodeia`, `apps/api`, paquetes base | ✅ Compilan y pasan CI |
| `@qodeia/agent-core` | ⚠️ **Excluido temporalmente del CI** — migración incompleta al monorepo (36 errores TS por el SDK `ai` v4 y cliente Supabase sin tipar; 60/157 tests fallando). Ver plan de consolidación. |
| Paquetes `orchestration`, `workflows`, `prompts`, `tools`, `memory` | 🚧 Esqueletos — la lógica real vive aún en `agent-core/agent/` |
| Esquemas SQL | ⚠️ Múltiples ficheros dispersos; pendiente consolidar en `supabase/migrations/` como fuente de verdad única |

El desarrollo activo está actualmente pausado en favor de otros proyectos. El CI se mantiene en verde como línea base para retomar el trabajo con seguridad.

### Plan de consolidación (pendiente)

1. **Fase 2 — agent-core**: tipar el cliente Supabase con tipos generados, adaptar al API de `ai` v4, reparar tests y retirar los filtros `--filter=!@qodeia/agent-core` de `.github/workflows/ci.yml`.
2. **Fase 3 — arquitectura**: extraer la lógica de agente de `agent-core` a un paquete puro (sin Next/React) y mover su UI a `apps/`; completar o eliminar los paquetes esqueleto; reubicar `qodeia-arch`.

---

## Descripción del sistema

```
                          ┌──────────────────────────────┐
                          │        apps/web-qodeia        │  Next.js 15 · portal público,
                          │  (proxy /api/agent, /api/mcp) │  login, dashboard, IDE
                          └──────────────┬───────────────┘
                                         │
┌────────────────────────┐   ┌───────────▼────────────────┐   ┌───────────────────┐
│   apps/plataforma-qd   │   │   packages/agent-core      │   │     apps/api      │
│ React 19 + Vite · PWA  │──▶│  CEOOrchestrator +         │   │ Fastify (mínima,  │
│ IDE, credenciales,     │   │  Specialists (GitHub,      │   │ healthcheck)      │
│ memoria contextual     │   │  Supabase, Vercel, MCP,    │   └───────────────────┘
└────────────────────────┘   │  NoCode, Logic, Molbot…)   │
                             │  + guardrails + governance │
                             │  + memoria vectorial       │
                             └───────────┬────────────────┘
                                         │
                             ┌───────────▼────────────────┐
                             │   Supabase (Postgres+RLS,  │
                             │   Auth JWT, pgvector,      │
                             │   Edge Functions)          │
                             └────────────────────────────┘
```

**Piezas clave:**

- **CEOOrchestrator** (`packages/agent-core/agent/core/`): recibe la tarea del usuario, la descompone y delega en agentes especialistas (GitHub, Supabase, Vercel, MCP, NoCode…), cada uno con sus herramientas.
- **Guardrails y governance**: las operaciones destructivas (`forcePush`, `deleteRepository`, `dropDatabase`…) requieren aprobación humana explícita antes de ejecutarse.
- **Memoria contextual**: almacenamiento vectorial (pgvector) con puntuación de relevancia estilo PageRank para priorizar el contexto que se inyecta al agente.
- **MCP**: sincronización y gestión de servidores MCP como fuente de herramientas externas.
- **Enrutado multi-LLM**: arquitectura de coste por niveles (modelos locales → económicos → avanzados) documentada en `packages/agent-core/MULTI_LLM_ARCHITECTURE.md`.

## Estructura

```
qodeia-monorepo/
├── apps/
│   ├── web-qodeia/        # Portal Next.js 15 (proxy hacia el agente)
│   ├── plataforma-qd/     # IDE/plataforma React 19 + Vite (PWA)
│   └── api/               # API Fastify mínima
├── packages/
│   ├── shared/            # SDK compartido (auth, api-client, env, tokens…)
│   ├── agent-core/        # Núcleo del agente (⚠️ ver Estado)
│   ├── orchestration/     # 🚧 esqueleto
│   ├── workflows/         # 🚧 esqueleto
│   ├── prompts/           # 🚧 esqueleto
│   ├── tools/             # 🚧 esqueleto
│   ├── memory/            # 🚧 esqueleto
│   ├── ui/                # Componentes UI
│   ├── types/             # Definiciones de tipos
│   └── config/            # Configuraciones compartidas
├── qodeia-arch/           # App full-stack heredada (pendiente de reubicar)
├── docs/                  # Documentación por área
└── .github/workflows/     # CI consolidado (ci.yml)
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm build` | Compila todos los paquetes |
| `pnpm dev` | Desarrollo en paralelo |
| `pnpm lint` | Linter en todos los paquetes |
| `pnpm typecheck` | Verificación de tipos |
| `pnpm test` | Tests |

## Requisitos

- Node.js >= 20
- pnpm >= 9 (el repo fija `pnpm@10`)

## CI

Un único workflow (`.github/workflows/ci.yml`) ejecuta lint → typecheck → test → build con:

- `pnpm install --frozen-lockfile`: el CI falla si el lockfile no coincide con los `package.json`. Es una barrera deliberada contra cambios de dependencias no revisados, incluidos los introducidos por agentes con acceso al repo.
- Exclusión temporal de `@qodeia/agent-core` (ver Estado).
- Cache de Turborepo entre ejecuciones.

## Seguridad

- Sin secrets en el repositorio — usar `.env.example` como plantilla.
- Todos los paquetes son `"private": true` (no publicables a npm por accidente).
- Los endpoints que modifican configuración (p. ej. `/api/mcp/update-env`) exigen JWT de Supabase + rol admin en `app_metadata`.
- Guardrails de aprobación humana para operaciones destructivas del agente.
- ⚠️ Pendiente: migrar el almacenamiento de credenciales de integraciones de `localStorage` (plataforma-qd) a almacenamiento server-side.

## Despliegue en Vercel

- **Web Principal**: [web-qodeia.vercel.app](https://web-qodeia.vercel.app)
- **Agente QodeIA**: [mi-agente-qode-ia.vercel.app](https://mi-agente-qode-ia.vercel.app)
- **Plataforma IDE**: [plataforma-qd.vercel.app](https://plataforma-qd.vercel.app)
