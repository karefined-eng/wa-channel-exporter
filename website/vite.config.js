import { defineConfig } from 'vite';
import { resolve } from 'path';
import Sitemap from 'vite-plugin-sitemap';

export default defineConfig({
  plugins: [
    Sitemap({
      hostname: 'https://whatsapp-channel-exporter.vercel.app',
      dynamicRoutes: [
        '/',
        '/export-to-pdf.html',
        '/download-media.html',
        '/documentation.html',
        '/privacy-policy.html'
      ]
    })
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        pdf: resolve(import.meta.dirname, 'export-to-pdf.html'),
        media: resolve(import.meta.dirname, 'download-media.html'),
        privacy: resolve(import.meta.dirname, 'privacy-policy.html'),
        docs: resolve(import.meta.dirname, 'documentation.html')
      }
    }
  }
});
