import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import Sitemap from 'vite-plugin-sitemap';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
        main: resolve(__dirname, 'index.html'),
        pdf: resolve(__dirname, 'export-to-pdf.html'),
        media: resolve(__dirname, 'download-media.html'),
        privacy: resolve(__dirname, 'privacy-policy.html'),
        docs: resolve(__dirname, 'documentation.html')
      }
    }
  }
});
