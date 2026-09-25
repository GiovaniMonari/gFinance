import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'icon-512.jpg'],
      manifest: {
        name: 'gFinance — seu assistente financeiro',
        short_name: 'gFinance',
        description: 'Gerencie suas finanças de forma simples e inteligente.',
        theme_color: '#10182f',
        background_color: '#10182f',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'icon-512.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
          },
          {
            src: 'icon-512.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
          },
          {
            src: 'icon-512.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24h
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
  },
})
