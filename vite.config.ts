/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Les images de démonstration et le PDF sont chargés à la demande :
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
