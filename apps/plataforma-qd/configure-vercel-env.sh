#!/bin/bash
# Script para configurar variables de entorno en Vercel para Plataforma QD (Howard OS)
# Ejecutar desde el directorio del proyecto: ./configure-vercel-env.sh
#
# IMPORTANTE: Este script NO contiene valores de credenciales hardcodeados.
# Las claves sensibles deben exportarse como variables de entorno antes de ejecutar:
#   export VITE_ENCRYPTION_KEY="tu_clave_aqui"
#   export VITE_SUPABASE_ANON_KEY="tu_clave_aqui"
#   export VITE_OPERATIONAL_SUPABASE_ANON_KEY="tu_clave_aqui"
#   ./configure-vercel-env.sh

set -e

PROJECT_NAME="plataforma-qd"
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

# Clave de cifrado
# Generar con: openssl rand -base64 32
add_env "VITE_ENCRYPTION_KEY" "${VITE_ENCRYPTION_KEY:-<TU_ENCRYPTION_KEY>}"

# Supabase Knowledge DB (Howard OS)
add_env "VITE_SUPABASE_URL" "${VITE_SUPABASE_URL:-https://tztypjxqklxygfzbpkmm.supabase.co}"
add_env "VITE_SUPABASE_ANON_KEY" "${VITE_SUPABASE_ANON_KEY:-<TU_VITE_SUPABASE_ANON_KEY>}"

# Supabase Operational DB (Agente QodeIA)
add_env "VITE_OPERATIONAL_SUPABASE_URL" "${VITE_OPERATIONAL_SUPABASE_URL:-https://nknevqndawnokiaickkl.supabase.co}"
add_env "VITE_OPERATIONAL_SUPABASE_ANON_KEY" "${VITE_OPERATIONAL_SUPABASE_ANON_KEY:-<TU_VITE_OPERATIONAL_SUPABASE_ANON_KEY>}"

# Agente URL
add_env "VITE_AGENT_URL" "https://mi-agente-qode-ia.vercel.app"

echo ""
echo "✅ Configuración completada!"
echo ""
echo "⚠️  IMPORTANTE: Las siguientes variables deben ser configuradas manualmente"
echo "   en el panel de Vercel (https://vercel.com/dashboard) > Settings > Environment Variables:"
echo "   - VITE_ENCRYPTION_KEY (generar con: openssl rand -base64 32)"
echo "   - VITE_SUPABASE_ANON_KEY (obtener del dashboard de Supabase)"
echo "   - VITE_OPERATIONAL_SUPABASE_ANON_KEY (obtener del dashboard de Supabase)"
echo ""
echo "🔄 Para aplicar los cambios, ejecuta:"
echo "   vercel --prod"
