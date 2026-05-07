# @qodeia/shared

[![CI](https://github.com/dgr198213-ui/Shared-QodeIA-/actions/workflows/ci.yml/badge.svg)](https://github.com/dgr198213-ui/Shared-QodeIA-/actions)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![npm](https://img.shields.io/badge/npm-9.0-blue.svg)](https://www.npmjs.com/)

Paquetes compartidos del ecosistema QodeIA para usar en Plataforma-qd, Mi-agente-QodeIA- y Web-QodeIA-.

## Paquetes Incluidos

### `@qodeia/shared/auth`
Sistema de autenticación unificado con Supabase que soporta:
- Email/Password
- OAuth (GitHub, Google)
- Multi-tenant con organizaciones

### `@qodeia/shared/design-system`
Design system con los colores y estilos de marca QodeIA:
- Colores: #0087b1 (primary), #00cd91 (secondary), #192b37 (dark)
- Tipografía, espaciado, sombras
- Funciones utilitarias para crear componentes

### `@qodeia/shared/api-client`
Cliente API unificado para todos los servicios QodeIA:
- CRUD para proyectos, conversaciones, mensajes
- Gestión de tareas del agente
- Base de conocimiento con búsqueda semántica

### `@qodeia/shared/hooks`
Hooks de React reutilizables:
- `useAuth` - Gestión de autenticación
- `useApiClient` - Cliente API
- `useLocalStorage` - Almacenamiento local
- `useFetch`, `useDebounce` - Utilidades

### `@qodeia/shared/utils`
Utilidades varias:
- Formateo (fecha, moneda, bytes)
- Validación (email, URL, GitHub)
- Manipulation de strings y arrays

### `@qodeia/shared/supabase`
Schema unificado de base de datos:
- Modelo multi-tenant
- Row Level Security (RLS)
- Soporte para pgvector (búsqueda semántica)

## Instalación

```bash
npm install @qodeia/shared
```

## Uso Rápido

```typescript
import { QodeIAAuthService, QodeIATheme } from '@qodeia/shared';

// Autenticación
const auth = new QodeIAAuthService(config);
await auth.signIn({ email, password });

// Theme
const buttonStyles = QodeIATheme.createButtonStyles('primary');
```

## Repositorios del Ecosistema

- [Plataforma-qd (Howard OS)](https://github.com/dgr198213-ui/Plataforma-qd)
- [Mi-agente-QodeIA-](https://github.com/dgr198213-ui/Mi-agente-QodeIA-)
- [Web-QodeIA-](https://github.com/dgr198213-ui/Web-QodeIA-)

## Licencia

MIT