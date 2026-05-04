import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Legacy / API-heavy codebase: gradually tighten typing; blocks `npm run lint` otherwise
      '@typescript-eslint/no-explicit-any': 'off',
      // shadcn-style input: `interface X extends HTMLAttributes {}` is intentional
      '@typescript-eslint/no-empty-object-type': 'off',
      // Allow `catch {}` when parsing optional JSON, etc.
      'no-empty': ['error', { allowEmptyCatch: true }],
      // React 19 + common patterns (localStorage hydration, mock loading) are flagged as false positives here
      'react-hooks/set-state-in-effect': 'off',
      // Dynamic Lucide icons / action-based components are intentional
      'react-hooks/static-components': 'off',
    },
  },
])
 
