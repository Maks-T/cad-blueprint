import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root,
  base: './',
  server: { port: 5180, open: true },
  build: {
    outDir: resolve(root, '../dist-demo'),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      input: {
        index: resolve(root, 'index.html'),
        docs: resolve(root, 'docs.html'),
      },
    },
  },
});
