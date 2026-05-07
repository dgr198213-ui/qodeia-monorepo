# QodeIA Monorepo

Plataforma Agent-First con arquitectura monorepo basada en pnpm + Turborepo.

## Estructura

```
qodeia-monorepo/
├── apps/
│   ├── web-qodeia/        # Aplicación web principal
│   └── plataforma-qd/    # Plataforma de gestión
├── packages/
│   ├── shared/            # SDK compartido
│   ├── agent-core/        # Núcleo del agente
│   ├── ui/                # Componentes UI
│   ├── types/             # Definiciones de tipos
│   └── config/            # Configuraciones compartidas
├── qodeia-arch/           # Documentación de arquitectura
├── turbo.json             # Configuración Turborepo
├── pnpm-workspace.yaml    # Configuración pnpm
└── package.json           # Paquete raíz
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm build` | Compila todos los paquetes |
| `pnpm dev` | Inicia desarrollo en paralelo |
| `pnpm lint` | Ejecuta linter en todos los paquetes |
| `pnpm typecheck` | Verificación de tipos |
| `pnpm test` | Ejecuta tests |

## Requisitos

- Node.js >= 20
- pnpm >= 9

## Seguridad

- Zero Trust architecture
- No exponer secrets en el repositorio
- Usar `.env.example` como plantilla