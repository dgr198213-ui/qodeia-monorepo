import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = path.dirname(fileURLToPath(import.meta.url))

export default {
  plugins: {
    '@tailwindcss/postcss': {
      // Ruta explícita desde la raíz de la app (no relativa a src/)
      config: path.join(appRoot, 'tailwind.config.js'),
    },
    autoprefixer: {},
  },
}
