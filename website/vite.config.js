import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        pdf: resolve(import.meta.dirname, 'export-to-pdf.html'),
        media: resolve(import.meta.dirname, 'download-media.html')
      }
    }
  }
});
