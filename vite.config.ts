/// <reference types="vitest/config" />
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * `vite preview` se comporte comme un hébergeur statique bien configuré :
 * /faq → dist/faq/index.html, et les adresses inconnues → dist/404.html avec le statut 404.
 */
function staticPagesPreview(): Plugin {
  return {
    name: 'catalogue-express-static-pages',
    configurePreviewServer(server) {
      const dist = server.config.build.outDir;
      server.middlewares.use((req, res, next) => {
        const [pathname] = (req.url ?? '/').split('?');
        if (req.method !== 'GET' || pathname.includes('.')) return next();
        const clean = pathname.replace(/\/+$/, '') || '/';
        const file = clean === '/' ? join(dist, 'index.html') : join(dist, clean, 'index.html');
        if (existsSync(file)) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(readFileSync(file));
          return;
        }
        const notFound = join(dist, '404.html');
        if (existsSync(notFound)) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(readFileSync(notFound));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), staticPagesPreview()],
  build: {
    // Le PDF et l'outil de création sont chargés à la demande :
    // le bundle initial doit rester petit pour les connexions lentes.
    chunkSizeWarningLimit: 450,
    sourcemap: false,
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
  test: {
    globals: true,
    environment: 'node',
    // Les tests de composants déclarent `// @vitest-environment jsdom` en tête de fichier.
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
});
