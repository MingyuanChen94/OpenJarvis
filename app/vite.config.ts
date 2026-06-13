import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// The OpenJarvis backend (`jarvis serve`) restricts CORS to a small allow-list,
// so in dev we talk to it through a same-origin proxy instead of cross-origin fetch.
const apiTarget = process.env.VITE_API_URL || 'http://localhost:8000';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // A service worker in dev hijacks navigation and can interfere with SSE.
      devOptions: { enabled: false },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'OpenJarvis',
        short_name: 'Jarvis',
        description: 'Local-first personal AI — a fast, private chat and telemetry app.',
        display: 'standalone',
        theme_color: '#0b0b0f',
        background_color: '#0b0b0f',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
        navigateFallback: 'index.html',
        // Never serve the cached app-shell for API/streaming routes.
        navigateFallbackDenylist: [/^\/v1\//, /^\/api\//, /^\/health/],
      },
    }),
  ],
  server: {
    port: 5174,
    proxy: {
      '/v1': { target: apiTarget, changeOrigin: true },
      '/health': { target: apiTarget, changeOrigin: true },
      '/api': { target: apiTarget, changeOrigin: true },
    },
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router'],
          charts: ['recharts'],
          markdown: ['react-markdown', 'remark-gfm', 'rehype-highlight'],
          motion: ['motion'],
        },
      },
    },
  },
});
