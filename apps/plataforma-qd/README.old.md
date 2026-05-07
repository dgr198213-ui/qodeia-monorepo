# Howard OS - Plataforma de Desarrollo Inteligente

Howard OS es una plataforma personal de desarrollo y auditoría diseñada para optimizar el flujo de trabajo de ingeniería de software con herramientas avanzadas impulsadas por IA.

## 🏗️ Estructura del Sistema

```text
src/
 ├── components/
 │    ├── modules/             # Módulos principales de la aplicación
 │    │    ├── development/    # Herramientas de desarrollo
 │    │    │    └── CodeEditor/ # IDE Howard OS (Modular)
 │    │    │         ├── components/ # Sub-componentes del Editor
 │    │    │         └── index.jsx   # Orquestador del Editor
 │    │    ├── analysis/       # Auditoría y Análisis
 │    │    ├── projects/       # Gestión de Proyectos
 │    │    └── credentials/    # Seguridad y APIs
 │    └── shared/              # Componentes comunes (Dashboard, Nav)
 ├── core/                     # Infraestructura (Hooks, Error Boundary)
 ├── store/                    # Estado Global (Zustand)
 ├── services/                 # Lógica de Negocio y Almacenamiento
 └── constants/                # Configuraciones y Constantes
```

## 🛠️ Módulos Principales

### 💻 Editor de Código (IDE Howard OS)
Un entorno de desarrollo modular y completo que incluye:
- **FileExplorer**: Gestión jerárquica de archivos y proyectos.
- **FileTabs**: Sistema dinámico de pestañas con indicador de cambios.
- **MonacoEditor**: Editor profesional con resaltado de sintaxis y autocompletado.
- **LivePreview**: Vista previa en tiempo real con soporte para múltiples dispositivos (Móvil, Tablet, Desktop).
- **GitPanel**: Control de versiones integrado (Stage, Commit, Branching).
- **Terminal & StatusBar**: Información de ejecución y estado del sistema en tiempo real.
- **Command Palette**: Acceso rápido a comandos del sistema (Ctrl+P).

### 🔑 Credenciales & Seguridad
- Gestión centralizada y segura de tokens (GitHub, OpenAI, Anthropic, Vercel, AWS).
- Encriptación AES-256 para el almacenamiento local de llaves sensibles.

### 🛡️ Análisis & Auditoría
- **Bias Firewall**: Monitoreo de sesgos en tiempo real.
- **Hype Detector**: Filtrado inteligente de ruido técnico.
- **SolveIt Iterator**: Gestión de sprints y convergencia iterativa.

## 🚀 Tecnologías
- **React 18** + **Vite**
- **Zustand** (State Management)
- **Tailwind CSS** (Styling)
- **Monaco Editor** (Code Editing)
- **Lucide React** (Iconography)

## 🔧 Configuración

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run dev
```

### Construcción
```bash
npm run build
```
