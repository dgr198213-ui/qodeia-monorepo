#!/bin/bash
# Script para configurar variables de entorno en Vercel para QodeIA
# Uso: ./configure-vercel-env.sh

set -e

PROJECT_NAME="qodeia-arch"
TEAM_ID="team_JAdXWfQ7CTEn4X65PX7iNJ5E"

echo "🚀 Configurando variables de entorno para $PROJECT_NAME en Vercel..."
echo ""

# Función para añadir variable de entorno
add_env() {
  local key=$1
  local value=$2
  local env_type=${3:-"production preview development"}
  
  if [ -z "$value" ] || [[ "$value" == "<"* ]]; then
    echo "⚠️  Saltando $key (valor no configurado)"
    return
  fi

  echo "📝 Añadiendo $key..."
  
  for env in $env_type; do
    printf '%s' "$value" | vercel env add "$key" "$env" --yes 2>/dev/null || echo "  ⚠️  $key ya existe en $env"
  done
}

# Supabase - Agente QodeIA
add_env "NEXT_PUBLIC_SUPABASE_URL" "${NEXT_PUBLIC_SUPABASE_URL:-https://nknevqndawnokiaickkl.supabase.co}"
add_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-<TU_SUPABASE_ANON_KEY>}"
add_env "SUPABASE_SERVICE_ROLE_KEY" "${SUPABASE_SERVICE_ROLE_KEY:-<TU_SERVICE_ROLE_KEY>}" "production"

# Supabase - Howard OS
add_env "HOWARD_OS_SUPABASE_URL" "${HOWARD_OS_SUPABASE_URL:-https://tztypjxqklxygfzbpkmm.supabase.co}"
add_env "HOWARD_OS_SUPABASE_KEY" "${HOWARD_OS_SUPABASE_KEY:-<TU_HOWARD_OS_KEY>}"

# GitHub
add_env "GITHUB_TOKEN" "${GITHUB_TOKEN:-<TU_GITHUB_TOKEN>}"
add_env "GITHUB_OWNER" "dgr198213-ui"
add_env "GITHUB_REPO" "qodeia-arch"

# APIs de LLM
add_env "GROQ_API_KEY" "${GROQ_API_KEY:-<TU_GROQ_API_KEY>}"
add_env "DEEPSEEK_API_KEY" "${DEEPSEEK_API_KEY:-<TU_DEEPSEEK_API_KEY>}"
add_env "GEMINI_API_KEY" "${GEMINI_API_KEY:-<TU_GEMINI_API_KEY>}"
add_env "OPENROUTER_API_KEY" "${OPENROUTER_API_KEY:-<TU_OPENROUTER_API_KEY>}"

# Vercel
add_env "VERCEL_TOKEN" "${VERCEL_TOKEN:-<TU_VERCEL_TOKEN>}" "production"
add_env "VERCEL_TEAM_ID" "team_JAdXWfQ7CTEn4X65PX7iNJ5E"
add_env "VERCEL_PROJECT_ID" "prj_He7Xk8zyji0mdREOS2IB20H7uKUH"

# URLs del Ecosistema
add_env "NEXT_PUBLIC_AGENT_URL" "https://mi-agente-qode-ia.vercel.app"
add_env "NEXT_PUBLIC_IDE_URL" "https://plataforma-qd.vercel.app"
add_env "NEXT_PUBLIC_WEB_URL" "https://web-qode-ia.vercel.app"

echo ""
echo "✅ Configuración completada!"
echo ""
echo "🔄 Para aplicar los cambios, ejecuta:"
echo "   vercel --prod"
