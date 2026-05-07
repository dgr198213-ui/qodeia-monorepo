#!/bin/bash
# Script para configurar variables de entorno en Vercel para Web QodeIA
# Ejecutar desde el directorio del proyecto: ./configure-vercel-env.sh
#
# IMPORTANTE: Este script NO contiene valores de credenciales hardcodeados.
# Las claves sensibles deben exportarse como variables de entorno antes de ejecutar:
#   export NEXT_PUBLIC_SUPABASE_ANON_KEY="tu_clave_aqui"
#   export NEXT_PUBLIC_KNOWLEDGE_SUPABASE_ANON_KEY="tu_clave_aqui"
#   ./configure-vercel-env.sh

set -e

PROJECT_NAME="web-qode-ia"
TEAM_ID="team_JAdXWfQ7CTEn4X65PX7iNJ5E"

echo "🚀 Configurando variables de entorno para $PROJECT_NAME en Vercel..."
echo ""

# Función para añadir variable de entorno
add_env() {
  local key=$1
  local value=$2
  local env_type=${3:-"production preview development"}

  if [ -z "$value" ] || [[ "$value" == "<"* ]]; then
    echo "⚠️  Saltando $key (valor no configurado - define la variable de entorno o configura manualmente en Vercel)"
    return
  fi

  echo "📝 Añadiendo $key..."

  for env in $env_type; do
    # Usar printf en lugar de echo para evitar saltos de línea accidentales
    printf '%s' "$value" | vercel env add "$key" "$env" --yes 2>/dev/null || echo "  ⚠️  $key ya existe en $env"
  done
}

# Supabase Operativa (Agente)
# Los valores se leen desde variables de entorno del sistema (NO hardcodear aquí)
add_env "NEXT_PUBLIC_SUPABASE_URL" "${NEXT_PUBLIC_SUPABASE_URL:-https://nknevqndawnokiaickkl.supabase.co}"
add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-<TU_SUPABASE_ANON_KEY>}"

# Supabase Conocimiento (Howard OS)
add_env "NEXT_PUBLIC_KNOWLEDGE_SUPABASE_URL" "${NEXT_PUBLIC_KNOWLEDGE_SUPABASE_URL:-https://tztypjxqklxygfzbpkmm.supabase.co}"
add_env "NEXT_PUBLIC_KNOWLEDGE_SUPABASE_ANON_KEY" "${NEXT_PUBLIC_KNOWLEDGE_SUPABASE_ANON_KEY:-<TU_KNOWLEDGE_SUPABASE_ANON_KEY>}"

# URLs del Ecosistema
add_env "NEXT_PUBLIC_AGENT_URL" "https://mi-agente-qode-ia.vercel.app"
add_env "NEXT_PUBLIC_HOWARD_OS_URL" "https://plataforma-qd.vercel.app"
add_env "NEXT_PUBLIC_IDE_URL" "https://plataforma-qd.vercel.app"

# Configuración del Sitio
add_env "NEXT_PUBLIC_URL" "https://web-qode-ia.vercel.app"
add_env "NEXT_PUBLIC_SITE_URL" "https://qodeia.com"
add_env "NEXT_PUBLIC_CONTACT_EMAIL" "qodeia_info@gmail.com"

echo ""
echo "✅ Configuración completada!"
echo ""
echo "⚠️  IMPORTANTE: Las siguientes variables deben ser configuradas manualmente"
echo "   en el panel de Vercel (https://vercel.com/dashboard) > Settings > Environment Variables:"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY (obtener del dashboard de Supabase)"
echo "   - NEXT_PUBLIC_KNOWLEDGE_SUPABASE_ANON_KEY (obtener del dashboard de Supabase)"
echo "   - GOOGLE_CLIENT_ID (cuando tengas las credenciales de Google Cloud Console)"
echo ""
echo "🔄 Para aplicar los cambios, ejecuta:"
echo "   vercel --prod"
