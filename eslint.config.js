import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'warn',
      'no-undef': 'warn',
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-empty': 'warn',
      'no-constant-condition': 'warn',
      'no-extra-semi': 'warn',
      'prefer-const': 'warn'
    }
  },
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/node_modules/**',
      '**/supabase/functions/**',
      'apps/plataforma-qd/src/components/modules/development/MoltbotPanel.jsx',
      'apps/plataforma-qd/src/services/EnhancedContextMemoryEngine.ts'
    ]
  }
]
