import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Plugin to duplicate the generated hashed stylesheet as dist/assets/style.css
 * Guarantees a permanent unhashed fallback so stale browser caches or deployment
 * hash mismatches never break styles with 404 or text/plain MIME errors.
 */
function duplicateCssFallback() {
  return {
    name: 'duplicate-css-fallback',
    closeBundle() {
      try {
        const assetsDir = path.resolve(__dirname, 'dist/assets');
        if (fs.existsSync(assetsDir)) {
          const files = fs.readdirSync(assetsDir);
          const cssFiles = files.filter(f => f.endsWith('.css') && f !== 'style.css');
          // Prefer main index-*.css or pick largest stylesheet
          const primaryCss = cssFiles.find(f => f.startsWith('index-')) || 
            cssFiles.sort((a, b) => fs.statSync(path.join(assetsDir, b)).size - fs.statSync(path.join(assetsDir, a)).size)[0];
          if (primaryCss) {
            fs.copyFileSync(path.join(assetsDir, primaryCss), path.join(assetsDir, 'style.css'));
            console.log(`[Vite] Copied ${primaryCss} -> dist/assets/style.css as permanent fallback stylesheet.`);
          }
        }
      } catch (err) {
        console.warn('[Vite] duplicateCssFallback warning:', err.message);
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), duplicateCssFallback()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('leaflet')) {
              return 'vendor-leaflet';
            }
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) {
              return 'vendor-recharts';
            }
            if (id.includes('@heyputer/puter.js')) {
              return 'vendor-puter';
            }
            if (id.includes('@clerk')) {
              return 'vendor-clerk';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
          }
        },
      },
    },
  },
});
