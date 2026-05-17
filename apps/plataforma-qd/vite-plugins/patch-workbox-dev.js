import { readFileSync, writeFileSync } from 'node:fs'

/**
 * Corrige un bug en bundles Workbox generados por vite-plugin-pwa en dev:
 * `supportStatus = false` se ejecutaba siempre, anulando la detección de streams.
 */
const WORKBOX_BUG_SNIPPET = `        if ('body' in testResponse) {
          try {
            new Response(testResponse.body);
            supportStatus = true;
          } catch (error) {
            supportStatus = false;
          }
        }
        supportStatus = false;`

const WORKBOX_FIXED_SNIPPET = `        if ('body' in testResponse) {
          try {
            new Response(testResponse.body);
            supportStatus = true;
          } catch (error) {
            supportStatus = false;
          }
        } else {
          supportStatus = false;
        }`

function patchWorkboxFile(filePath) {
  let code = readFileSync(filePath, 'utf8')
  if (!code.includes('canConstructResponseFromBodyStream')) return
  if (!code.includes(WORKBOX_BUG_SNIPPET)) return

  code = code.replace(WORKBOX_BUG_SNIPPET, WORKBOX_FIXED_SNIPPET)
  writeFileSync(filePath, code)
}

export function patchWorkboxDevBundle() {
  return {
    name: 'patch-workbox-dev-bundle',
    apply: 'serve',
    configureServer(server) {
      const tryPatch = (filePath) => {
        if (!filePath.includes('dev-dist') || !filePath.includes('workbox-')) return
        if (!filePath.endsWith('.js')) return
        try {
          patchWorkboxFile(filePath)
        } catch {
          // El bundle aún no está listo
        }
      }

      server.watcher.on('add', tryPatch)
      server.watcher.on('change', tryPatch)
    },
  }
}
