import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'tiptap-editor.js'),
      name: 'TipTapBlazor',
      fileName: () => 'tiptap-bundle.js',
      formats: ['iife'],
    },
    outDir: path.resolve(__dirname, '../wwwroot/js'),
    emptyOutDir: false,
    minify: true,
    rollupOptions: {
      // Everything is bundled — no externals
      external: [],
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
