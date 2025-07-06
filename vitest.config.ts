import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
  },
  resolve: {
    alias: {
      'obsidian': 'obsidian'
    }
  },
  optimizeDeps: {
    exclude: ['obsidian']
  },
  define: {
    'process.env.NODE_ENV': '"test"'
  }
}); 