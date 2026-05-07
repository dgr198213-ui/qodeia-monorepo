# QODEIA - Web Oficial

[![CI](https://github.com/dgr198213-ui/Web-QodeIA-/actions/workflows/ci.yml/badge.svg)](https://github.com/dgr198213-ui/Web-QodeIA-/actions)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)

Un espacio para crear, conectar y crecer juntos. El portal central de la comunidad QodeIA.

## 🔗 Ecosistema QodeIA
Esta plataforma web actúa como el centro neurálgico y administrativo del ecosistema **QodeIA**, integrándose con:
*   **[Mi-agente-QodeIA-](https://github.com/dgr198213-ui/Mi-agente-QodeIA-)**: El motor de IA autónomo que utiliza la base de conocimiento gestionada desde este portal (vía MCP) para ejecutar tareas complejas.
*   **[Plataforma-qd](https://github.com/dgr198213-ui/Plataforma-qd)**: El entorno de desarrollo (Howard OS) donde los usuarios interactúan con la IA y visualizan los resultados de la gestión de conocimiento.

## 🚀 Tecnologías

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Diseño moderno y responsive
- **Framer Motion** - Animaciones suaves
- **MCP (Model Context Protocol)** - Integración nativa para gestión de conocimiento

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🔌 Administración MCP
Se ha integrado un **Panel de Administración MCP** para gestionar la base de conocimiento de QodeIA (NotebookLM). Este panel permite que el Agente QodeIA acceda a documentación técnica actualizada y validada.

- **Acceso**: `/admin/mcp`
- **Funcionalidades**: Autenticación OAuth con Google, configuración de cuadernos, monitoreo de estadísticas y toggle de activación.

## 📁 Estructura del Proyecto

```
Web-QodeIA-/
├── app/
│   ├── admin/mcp/            # Panel de Administración MCP (Cerebro del ecosistema)
│   ├── proyectos/            # Catálogo de proyectos QodeIA
│   ├── comunidad/            # Espacio de interacción
│   └── apoya/                # Sistema de soporte y donaciones
├── components/               # Componentes compartidos de la UI
└── lib/                      # Utilidades y clientes de API (Supabase, MCP)
```

## 🎨 Personalización
Los colores de QODEIA están configurados en `tailwind.config.js`:
- **Azul QODEIA**: `#0087b1`
- **Verde Menta**: `#00cd91`
- **Azul Oscuro**: `#192b37`

## 🌐 Despliegue en Vercel
El proyecto está optimizado para desplegarse en Vercel, permitiendo actualizaciones continuas y escalabilidad inmediata.

1. Conecta el repositorio a Vercel.
2. Configura las variables de entorno para Google OAuth y Supabase.
3. El dominio oficial es `qodeia.com`.

## 📞 Contacto
- **Email**: qodeia_info@gmail.com
- **Ubicación**: Alcalá de Henares, España

## 📄 Licencia
Este proyecto es de código abierto y está disponible para toda la comunidad QODEIA.

---

**Creado con 💛 desde Alcalá de Henares**
*Crecemos juntos, siempre* ✨
