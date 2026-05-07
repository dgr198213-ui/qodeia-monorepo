#!/usr/bin/env bash
set -euo pipefail

# apply_correcciones.sh
# Script para procesar y aplicar correcciones (merges seguros, issues de migración, protecciones)
# Repos objetivo (los 5 solicitados)
REPOS=(
  "dgr198213-ui/Plataforma-qd"
  "dgr198213-ui/Web-QodeIA-"
  "dgr198213-ui/Mi-agente-QodeIA-"
  "dgr198213-ui/QodeIA-fitness"
  "dgr198213-ui/Shared-QodeIA-"
)

# Opciones por defecto
DRY_RUN=true
FORCE_MAJOR=false
APPLY_PROTECTION=false
SQUASH_MERGE=false

# Reglas de seguridad
SAFE_AUTHORS=("dependabot[bot]" "vercel[bot]")
SAFE_TITLE_KEYWORDS=("security" "cve" "CVE" "deps:" "bump" "ci: bump" "Fix React Server Components" "dependabot")
CI_KEYWORDS=("actions/" "setup-node" "actions/checkout" "ci:" "workflow")

# Helpers
has_cmd() { command -v "$1" >/dev/null 2>&1; }

usage() {
  cat <<USAGE
Uso:
  $0 [--apply] [--force-major] [--protect] [--squash]

Opciones:
  --apply         : Ejecuta operaciones que modifican repos (merge, crear issues, aplicar protección).
                    Si no se pasa, solo hace dry-run (muestra lo que haría).
  --force-major   : Permite mergear bumps mayores automáticamente (riesgoso).
  --protect       : Aplica protección básica a la rama main en cada repo (requiere permisos admin).
  --squash        : Realiza un squash merge en lugar de un merge commit normal.
  -h, --help      : Muestra esta ayuda.

Requisitos:
  - gh CLI autenticado (gh auth login) o export GITHUB_TOKEN.
  - jq instalado
  - git, node/npm/pnpm/yarn si quieres validar builds

Ejemplo:
  export GITHUB_TOKEN="tu_pat_seguro"
  ./apply_correcciones.sh --apply --squash
USAGE
  exit 1
}

# Parse args
while [ $# -gt 0 ]; do
  case "$1" in
    --apply) DRY_RUN=false; shift ;;
    --force-major) FORCE_MAJOR=true; shift ;;
    --protect) APPLY_PROTECTION=true; shift ;;
    --squash) SQUASH_MERGE=true; shift ;;
    -h|--help) usage ;;
    *) echo "Opción desconocida: $1"; usage ;;
  esac
done

# Comprobar herramientas
if ! has_cmd gh; then
  echo "ERROR: gh CLI no encontrado. Instala https://cli.github.com/"; exit 2
fi
if ! has_cmd jq; then
  echo "ERROR: jq no encontrado. Instala jq."; exit 2
fi

echo "Modo: $( [ "$DRY_RUN" = true ] && echo "DRY-RUN (no se aplicarán cambios)" || echo "APLICAR cambios" )"
echo "Forzar merges mayores: $FORCE_MAJOR"
echo "Aplicar proteccion main: $APPLY_PROTECTION"
echo "Squash merge: $SQUASH_MERGE"
echo

# Util: comprobar si título/autor indica safe
is_safe_pr() {
  local title="$1" author="$2"
  local a
  for a in "${SAFE_AUTHORS[@]}"; do
    if [[ "$author" == "$a" ]]; then
      echo "true"; return
    fi
  done
  local k
  for k in "${SAFE_TITLE_KEYWORDS[@]}"; do
    if echo "$title" | grep -qiF "$k"; then
      echo "true"; return
    fi
  done
  echo "false"
}

# Util: detectar keywords CI
is_ci_update() {
  local title="$1"
  for k in "${CI_KEYWORDS[@]}"; do
    if echo "$title" | grep -qiF "$k"; then
      echo "true"; return
    fi
  done
  echo "false"
}

# Util: extraer bumps de package.json en el patch (retorna lines con - "pkg": "x" y + "pkg": "y")
extract_package_version_changes() {
  local patch="$1"
  echo "$patch" | awk '/^[-+].*"[[:alnum:]._@\/-]+": *"[0-9]+\.[0-9]+\.[0-9]/{ print }'
}

# Util simple para obtener major de versión semver simple a.b.c
major_from_version() {
  local v="$1"
  v=$(echo "$v" | sed -E 's/^[^0-9]*//; s/["^~><= ]//g')
  echo "${v%%.*}"
}

# Crear issue de migración
create_migration_issue() {
  local repo="$1" pr="$2" title="$3" body="$4"
  echo "    -> Crear ISSUE de migración en $repo (PR #$pr)"
  if [ "$DRY_RUN" = true ]; then
    echo "DRY-RUN: gh issue create --repo $repo -t \"MIGRACIÓN requerida para PR #$pr: $title\" -b \"${body//$'\n'/\\n}\""
  else
    gh issue create --repo "$repo" -t "MIGRACIÓN requerida para PR #$pr: $title" -b "$body"
  fi
}

# Procesa PRs en un repo
process_repo() {
  local repo="$1"
  echo "=== Procesando repo: $repo ==="

  # Obtener lista de PRs abiertos
  pr_list=$(gh pr list --repo "$repo" --state open --json number -q '.[].number' || echo "")
  if [ -z "$pr_list" ]; then
    echo "No hay PRs abiertas en $repo"
    return
  fi

  for pr in $pr_list; do
    echo
    echo "-> PR #$pr"
    meta=$(gh pr view "$pr" --repo "$repo" --json number,title,body,author,mergeable,mergeStateStatus,headRefName,headRepository,name,commits --jq '.')
    title=$(echo "$meta" | jq -r '.title // ""')
    author=$(echo "$meta" | jq -r '.author.login // ""')
    mergeable=$(echo "$meta" | jq -r '.mergeable // "UNKNOWN"')
    merge_state=$(echo "$meta" | jq -r '.mergeStateStatus // ""')
    headRef=$(echo "$meta" | jq -r '.headRefName // ""')

    echo "  Título: $title"
    echo "  Autor: $author"
    echo "  mergeable: $mergeable  mergeState: $merge_state"
    safe=$(is_safe_pr "$title" "$author")
    ci_update=$(is_ci_update "$title")

    # Obtener files y patches
    files_json=$(gh pr view "$pr" --repo "$repo" --json files --jq '.files')
    pkg_patch=$(echo "$files_json" | jq -r '.[]? | select(.path=="package.json") | .patch // empty' || echo "")
    workflow_changed=$(echo "$files_json" | jq -r '.[]?.path' | grep -E '^.github\/workflows' || true)

    # Detectar cambios de versión en package.json (si hay patch)
    major_bump=false
    major_bump_details=""
    if [ -n "$pkg_patch" ]; then
      old_lines=$(echo "$pkg_patch" | awk '/^-/ && /"[0-9]+\.[0-9]+\.[0-9]+"/{ print }' || true)
      new_lines=$(echo "$pkg_patch" | awk '/^\+/ && /"[0-9]+\.[0-9]+\.[0-9]+"/{ print }' || true)
      if [ -n "$old_lines" ] && [ -n "$new_lines" ]; then
        while IFS= read -r oldl; do
          oldpkg=$(echo "$oldl" | sed -E 's/^-.*"([^"]+)": *"([^"]+)".*/\1|\2/; s/^[-+ ]*//')
          oldname=$(echo "$oldpkg" | cut -d'|' -f1)
          oldver=$(echo "$oldpkg" | cut -d'|' -f2)
          newline=$(echo "$new_lines" | grep -F "\"$oldname\"" || true)
          if [ -n "$newline" ]; then
            newpkg=$(echo "$newline" | sed -E 's/^\+.*"([^"]+)": *"([^"]+)".*/\1|\2/; s/^[-+ ]*//')
            newver=$(echo "$newpkg" | cut -d'|' -f2)
            oldmaj=$(major_from_version "$oldver")
            newmaj=$(major_from_version "$newver")
            if [ -n "$oldmaj" ] && [ -n "$newmaj" ] && [ "$oldmaj" -ne "$newmaj" ]; then
              major_bump=true
              major_bump_details+="Package $oldname: $oldver -> $newver (major $oldmaj -> $newmaj)\n"
            fi
          fi
        done <<< "$(echo "$old_lines")"
      fi
    fi

    # Decidir acción
    action_notes=""
    if [ "$safe" = "true" ] || [ "$ci_update" = "true" ] || [ -n "$workflow_changed" ]; then
      if [ "$major_bump" = true ]; then
        action_notes="Detectado bump mayor en package.json:\n$major_bump_details"
        if [ "$FORCE_MAJOR" = true ]; then
          action_notes+="\n--force-major activado: se permitirá merge automático."
        else
          action_notes+="\nNo se mergeará automáticamente. Se creará un ISSUE de migración."
        fi
      fi

      if [[ "$mergeable" == "MERGEABLE" || "$merge_state" == "clean" || "$FORCE_MAJOR" == true ]]; then
        should_attempt_build=false
        if [ -n "$pkg_patch" ]; then should_attempt_build=true; fi

        build_ok=true
        if [ "$should_attempt_build" = true ]; then
          echo "  - Hay cambios en package.json; validando build/test..."
          tmpd=$(mktemp -d)
          echo "    * Clonando repo en $tmpd para pruebas..."
          git clone --depth=1 "https://github.com/$repo.git" "$tmpd/repo" >/dev/null 2>&1 || { echo "    clone falló"; build_ok=false; }
          if [ "$build_ok" = true ]; then
            pushd "$tmpd/repo" >/dev/null
            if gh pr checkout "$pr" --repo "$repo" >/dev/null 2>&1; then
              # Detect package manager
              pkg_manager="npm"
              if [ -f "pnpm-lock.yaml" ]; then pkg_manager="pnpm";
              elif [ -f "yarn.lock" ]; then pkg_manager="yarn"; fi

              if has_cmd "$pkg_manager"; then
                echo "    - Usando $pkg_manager para validación"
                if "$pkg_manager" install --silent >/dev/null 2>&1; then
                  if "$pkg_manager" run build --silent >/dev/null 2>&1; then
                    echo "    build OK"
                  else
                    echo "    build falló o no definido"
                    build_ok=false
                  fi
                  if "$pkg_manager" test --silent >/dev/null 2>&1; then
                    echo "    tests OK"
                  else
                    echo "    tests fallaron o no definidos"
                  fi
                else
                  echo "    $pkg_manager install falló"
                  build_ok=false
                fi
              else
                echo "    $pkg_manager no disponible en runner; salto build/test"
              fi
            else
              echo "    gh pr checkout falló para $repo#$pr"
              build_ok=false
            fi
            popd >/dev/null
          fi
          rm -rf "$tmpd"
        fi

        do_merge=false
        if [ "$major_bump" = true ] && [ "$FORCE_MAJOR" = false ]; then
          do_merge=false
        else
          if [ "$build_ok" = true ]; then
            do_merge=true
          else
            if [ "$safe" = "true" ] && echo "$title" | grep -qi "react server components\|CVE\|security"; then
              echo "  - PR de seguridad detectada. Considerar merge aun si build falló."
              do_merge=true
            else
              do_merge=false
            fi
          fi
        fi

        if [ "$do_merge" = true ]; then
          if [ "$DRY_RUN" = true ]; then
            echo "DRY-RUN: Se MERGEARÍA $repo#$pr (title: $title, squash: $SQUASH_MERGE)"
          else
            echo "  Ejecutando merge de $repo#$pr ..."
            merge_args=("--merge")
            if [ "$SQUASH_MERGE" = true ]; then merge_args=("--squash"); fi

            if gh pr merge "$pr" --repo "$repo" "${merge_args[@]}" --delete-branch --confirm; then
              echo "  Merge OK para $repo#$pr"
            else
              echo "  ERROR: gh pr merge falló para $repo#$pr"
            fi
          fi
        else
          echo "  NO se mergeará automáticamente $repo#$pr"
          if [ "$major_bump" = true ] || [ "$build_ok" = false ]; then
            issue_body="Se requiere intervención manual para PR #$pr en $repo\n\nTítulo: $title\nAutor: $author\n\nDetalles:\n$action_notes\n\nAcciones recomendadas:\n- Revisar breaking changes.\n- Probar localmente: gh pr checkout $pr --repo $repo\n"
            create_migration_issue "$repo" "$pr" "$title" "$issue_body"
          fi
        fi
      else
        echo "  PR no mergeable automáticamente ($mergeable). Saltando."
      fi
    else
      echo "  PR no marcada como segura ni CI update. Saltando."
    fi
  done
}

# Aplicar protección de main
apply_protection_to_repo() {
  local repo="$1"
  echo "Aplicando protección de rama main en $repo"
  if [ "$DRY_RUN" = true ]; then
    echo "DRY-RUN: Aplicar protección a $repo"
  else
    gh api -X PUT \
      -H "Accept: application/vnd.github+json" \
      /repos/"$repo"/branches/main/protection \
      -f required_status_checks='{"strict":true,"contexts":["ci","build","test"]}' \
      -f enforce_admins=true \
      -f required_pull_request_reviews='{"dismiss_stale_reviews":true,"required_approving_review_count":1}'
    echo "Protección aplicada."
  fi
}

# MAIN
for r in "${REPOS[@]}"; do
  process_repo "$r"
done

if [ "$APPLY_PROTECTION" = true ]; then
  echo
  for r in "${REPOS[@]}"; do
    apply_protection_to_repo "$r"
  done
fi

echo
echo "Script finalizado."
