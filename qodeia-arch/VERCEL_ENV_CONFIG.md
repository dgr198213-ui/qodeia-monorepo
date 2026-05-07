# Configuración de Variables de Entorno - QodeIA Vercel

## Instrucciones

Ejecuta el siguiente script para configurar todas las variables de entorno en Vercel:

```bash
./configure-vercel-env.sh
```

## Variables Requeridas

### Supabase - Agente QodeIA
```
NEXT_PUBLIC_SUPABASE_URL=https://nknevqndawnokiaickkl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<tu_service_role_key>
```

### Supabase - Howard OS (Base de Conocimiento)
```
HOWARD_OS_SUPABASE_URL=https://tztypjxqklxygfzbpkmm.supabase.co
HOWARD_OS_SUPABASE_KEY=<tu_howard_os_key>
```

### GitHub
```
GITHUB_TOKEN=<tu_github_token>
GITHUB_OWNER=dgr198213-ui
GITHUB_REPO=qodeia-arch
```

### APIs de LLM
```
OPENAI_API_KEY=<tu_openai_api_key>
GROQ_API_KEY=<tu_groq_api_key>
DEEPSEEK_API_KEY=<tu_deepseek_api_key>
GEMINI_API_KEY=<tu_gemini_api_key>
OPENROUTER_API_KEY=<tu_openrouter_api_key>
```

### Vercel
```
VERCEL_TOKEN=<tu_vercel_token>
VERCEL_TEAM_ID=team_JAdXWfQ7CTEn4X65PX7iNJ5E
VERCEL_PROJECT_ID=prj_He7Xk8zyji0mdREOS2IB20H7uKUH
```

### URLs del Ecosistema
```
NEXT_PUBLIC_AGENT_URL=https://mi-agente-qode-ia.vercel.app
NEXT_PUBLIC_IDE_URL=https://plataforma-qd.vercel.app
NEXT_PUBLIC_WEB_URL=https://web-qodeia.vercel.app
```

## Seguridad

⚠️ **IMPORTANTE**: 
- Nunca commites archivos `.env` o archivos con credenciales
- Usa Vercel Dashboard para gestionar secretos en producción
- Rota tokens regularmente
- Usa `SUPABASE_SERVICE_ROLE_KEY` solo en servidor (API routes)

## Verificación

Después de configurar, verifica que las variables estén disponibles:

```bash
vercel env list
```

Para desplegar con las nuevas variables:

```bash
vercel --prod
```
