import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig(({ mode }) => ({
  root: import.meta.dirname,
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'node',
    include:
      mode === 'integration'
        ? ['**/test/integration/**/*.{test,spec,integration}.?(c|m)[jt]s?(x)']
        : configDefaults.include,
    exclude: [
      ...configDefaults.exclude,
      '**/.next/**',
      '**/dist/**',
      ...(mode === 'integration' ? [] : ['**/test/integration/**']),
    ],
    testTimeout: mode === 'integration' ? 15_000 : 5000,
  },
}));
