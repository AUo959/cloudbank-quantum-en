// Minimal flat config for ESLint v9
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'

export default [
  { ignores: ['dist/**', 'node_modules/**', 'release-dist.zip'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,jsx,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
      'no-empty': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['**/*.config.{js,ts}', 'tailwind.config.js', 'vite.config.ts', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-undef': 'off' },
  },
  {
    files: ['scripts/**/*.{js,mjs,cjs}'],
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-undef': 'off' },
  },
]
