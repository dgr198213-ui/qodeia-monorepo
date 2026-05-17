import rootConfig from '../../eslint.config.js'

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      'dist/**',
      'dev-dist/**',
      'node_modules/**',
      'public/**',
      'config/**',
      'scripts/**',
      'coverage/**',
    ],
  },
  ...rootConfig,
]
