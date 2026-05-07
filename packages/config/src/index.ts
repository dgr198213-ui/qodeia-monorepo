// @qodeia/config - Configuraciones compartidas

export const eslintConfig = {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    'react/react-in-jsx-scope': 'off',
  },
};

export const tsconfigBase = {
  target: 'ES2022',
  lib: ['ES2022', 'DOM', 'DOM.Iterable'],
  module: 'ESNext',
  moduleResolution: 'bundler' as const,
  resolveJsonModule: true,
  allowJs: true,
  checkJs: false,
  jsx: 'react-jsx' as const,
  declaration: true,
  declarationMap: true,
  sourceMap: true,
  noEmit: true,
  isolatedModules: true,
  allowSyntheticDefaultImports: true,
  esModuleInterop: true,
  forceConsistentCasingInFileNames: true,
  strict: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
  noFallthroughCasesInSwitch: true,
  skipLibCheck: true,
};

export const turboConfig = {
  pipeline: {
    build: {
      dependsOn: ['^build'],
      outputs: ['dist/**', '.next/**', '!.next/cache/**'],
    },
    dev: {
      cache: false,
      persistent: true,
    },
    lint: {
      dependsOn: ['^build'],
    },
    typecheck: {
      dependsOn: ['^build'],
    },
  },
};