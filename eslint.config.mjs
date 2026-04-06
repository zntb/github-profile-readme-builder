import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      'react/no-unescaped-entities': 'off',
      // Enforce unused vars as errors
      '@typescript-eslint/no-unused-vars': 'error',
      // Import sorting rules
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/first': 'error',
      'import/no-duplicates': 'error',
      'import/newline-after-import': 'error',
    },
  },
  // Override for test files
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  // Override for config files
  {
    files: ['eslint.config.mjs', 'next.config.ts', 'postcss.config.mjs'],
    rules: {
      'import/no-default-export': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'playwright-report']),
]);

export default eslintConfig;
