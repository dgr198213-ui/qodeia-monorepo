# Guía de Configuración - Web QodeIA

## Variables de Entorno Configuradas

### ✅ Supabase Operativa (Agente QodeIA)
- `NEXT_PUBLIC_SUPABASE_URL`: https://nknevqndawnokiaickkl.supabase.co
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Configurada

### ✅ Supabase Conocimiento (Howard OS)
- `NEXT_PUBLIC_KNOWLEDGE_SUPABASE_URL`: https://tztypjxqklxygfzbpkmm.supabase.co
- `NEXT_PUBLIC_KNOWLEDGE_SUPABASE_ANON_KEY`: Configurada

### ✅ URLs del Ecosistema
- `NEXT_PUBLIC_AGENT_URL`: https://mi-agente-qode-ia.vercel.app
- `NEXT_PUBLIC_HOWARD_OS_URL`: https://plataforma-qd.vercel.app
- `NEXT_PUBLIC_IDE_URL`: https://plataforma-qd.vercel.app

### ✅ Configuración del Sitio
- `NEXT_PUBLIC_URL`: https://web-qode-ia.vercel.app
- `NEXT_PUBLIC_SITE_URL`: https://qodeia.com
- `NEXT_PUBLIC_CONTACT_EMAIL`: qodeia_info@gmail.com

### ⚠️ Pendiente de Configuración
- `GOOGLE_CLIENT_ID`: Requiere configuración en Google Cloud Console

## Configuración en Vercel

### Opción 1: Usando el Script Automático

```bash
cd /home/ubuntu/web-qodeia
./configure-vercel-env.sh
```

### Opción 2: Configuración Manual en Vercel Dashboard

1. Ve a https://vercel.com/dashboard
2. Selecciona el proyecto `web-qode-ia`
3. Ve a Settings → Environment Variables
4. Añade cada variable para los entornos: Production, Preview, Development

## Verificación de Configuración

### 1. Verificar Variables de Entorno en Vercel

```bash
vercel env ls
```

### 2. Probar Conexión con Supabase

```bash
# En el navegador, abre la consola de desarrollador
# Ejecuta:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

### 3. Probar Conexión con Agente

```bash
curl https://web-qode-ia.vercel.app/api/agent
```

## Integración con el Ecosistema

### Flujo de Conexión

```
Web QodeIA (Portal Principal)
  │
  ├─> Mi Agente QodeIA (Motor de IA)
  │     └─> Supabase Agente (Base Operativa)
  │
  └─> Plataforma QD (IDE + Howard OS)
        └─> Supabase Howard OS (Base de Conocimiento)
```

### Endpoints Disponibles

- `/api/agent` - Proxy al agente de IA
- `/api/mcp/stats` - Estadísticas de MCP
- `/api/mcp/test` - Prueba de conexión MCP
- `/api/mcp/auth/google` - Autenticación OAuth con Google
- `/api/agent/reload` - Recargar configuración del agente

## Configuración de Google OAuth (Pendiente)

### Pasos para Configurar

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google OAuth 2.0
4. Crea credenciales OAuth 2.0:
   - Tipo: Aplicación web
   - Orígenes autorizados: https://web-qode-ia.vercel.app
   - URIs de redirección: https://web-qode-ia.vercel.app/auth/callback
5. Copia el Client ID
6. Añade la variable en Vercel:
   ```bash
   vercel env add GOOGLE_CLIENT_ID production
   ```

## Troubleshooting

### Error: "Supabase client not configured"

**Solución:**
1. Verifica que las variables de entorno estén configuradas en Vercel
2. Redespliega el proyecto: `vercel --prod`

### Error: "Cannot connect to agent"

**Solución:**
1. Verifica que Mi Agente QodeIA esté desplegado y funcionando
2. Verifica que `NEXT_PUBLIC_AGENT_URL` esté configurada correctamente
3. Prueba el endpoint directamente: `curl https://mi-agente-qode-ia.vercel.app/api/agent`

### Error: "Cannot connect to Howard OS"

**Solución:**
1. Verifica que Plataforma QD esté desplegada y funcionando
2. Verifica que `NEXT_PUBLIC_HOWARD_OS_URL` esté configurada correctamente
3. Prueba el endpoint directamente: `curl https://plataforma-qd.vercel.app`

## Próximos Pasos

1. ✅ Configurar variables de entorno en Vercel
2. ✅ Redesplegar el proyecto
3. ⏳ Configurar Google OAuth
4. ⏳ Probar integración con Mi Agente QodeIA
5. ⏳ Probar integración con Plataforma QD
6. ⏳ Verificar flujo completo del ecosistema

---

**Última actualización:** 5 de febrero de 2026
