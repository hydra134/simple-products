import js from '@eslint/js';
import next from '@next/eslint-plugin-next';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const sourceFiles = ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'];
const typeScriptFiles = ['**/*.{ts,tsx,mts,cts}'];
const reactFiles = ['**/*.{jsx,tsx}'];
const nextFiles = ['apps/**/*.{jsx,tsx}'];

export default defineConfig(
  globalIgnores([
    '**/node_modules/**',
    '**/.next/**',
    '**/.turbo/**',
    '**/.pnpm-store/**',
    '**/dist/**',
    '**/build/**',
    '**/out/**',
    '**/coverage/**',
    '**/next-env.d.ts',
  ]),
  {
    files: sourceFiles,
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: typeScriptFiles,
    extends: [tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports', prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { vars: 'all', args: 'none', ignoreRestSiblings: true, caughtErrors: 'none' },
      ],
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
    },
  },
  {
    files: reactFiles,
    extends: [reactRefresh.configs.recommended],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'react-refresh/only-export-components': 'warn',
    },
  },
  {
    files: nextFiles,
    extends: [next.configs['core-web-vitals']],
    settings: {
      next: { rootDir: `${import.meta.dirname}/apps/*/` },
    },
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        reactRefresh.configs.next.rules['react-refresh/only-export-components'][1],
      ],
    },
  },
  eslintPluginPrettierRecommended,
);
