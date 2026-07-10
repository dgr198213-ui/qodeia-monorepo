# QodeIA Monorepo

Plataforma **agent-first** para desarrollo asistido por agentes autónomos: un orquestador multi-agente (CEO + especialistas) con memoria contextual, integración MCP y guardrails de seguridad, más las aplicaciones web que lo exponen.

Monorepo gestionado con **pnpm 10 + Turborepo 2** (Node >= 20).

---

## Estado del proyecto

> Última actualización: 10 julio 2026 · Continuidad en [`CLAUDE.md`](./CLAUDE.md) · Integración del ecosistema en [`docs/ARQUITECTURA-ECOSISTEMA.md`](./docs/ARQUITECTURA-ECOSISTEMA.md)

| Área | Estado |
|---|---|
| Infraestructura del monorepo (pnpm, Turbo, ESLint 9, Husky, CI) | ✅ Operativa |
| `@qodeia/shared`, `apps/web-qodeia`, `apps/api`, paquetes base | ✅ Compilan y pasan CI |
| `@qodeia/agent-core` | ✅ **Reincorporado al CI** (Fase 2): 0 errores TS, 96/96 tests. Cliente Supabase tipado como `any` pendiente de tipos generados. |
| Paquetes `orchestration`, `workflows`, `prompts`, `tools`, `memory` | 🚧 Esqueletos — la lógica real vive aún en `agent-core/agent/` |
| Esquemas SQL | ✅ Consolidados en `supabase/migrations/0001..0005` (Fase 3A); los antiguos, archivados en `supabase/legacy/` |

El desarrollo activo está actualmente pausado en favor de otros proyectos. El CI se mantiene en verde como línea base para retomar el trabajo con seguridad.

### Plan de consolidación (pendiente)

1. ~~**Fase 2 — agent-core**~~ ✅ Completada: 36 errores TS → 0, tests 96/96, filtros de CI retirados, tests duplicados de `__tests__/` consolidados en los colocados junto al código.
2. ~~**Fase 3A — columna vertebral**~~ ✅ Completada: contrato IDE↔Agente (7 endpoints), esquema unificado en migraciones, JWT único en los módulos del IDE.
3. **Fase 3B/3C — prototipos y arquitectura**: extraer la lógica de agente de `agent-core` a un paquete puro (sin Next/React) y mover su UI a `apps/`; completar o eliminar los paquetes esqueleto; reubicar `qodeia-arch`.

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
