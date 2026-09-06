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
          const cssFile = files.find(f => f.endsWith('.css') && f !== 'style.css');
          if (cssFile) {
            fs.copyFileSync(path.join(assetsDir, cssFile), path.join(assetsDir, 'style.css'));
            console.log(`[Vite] Copied ${cssFile} -> dist/assets/style.css as permanent fallback stylesheet.`);
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
});
