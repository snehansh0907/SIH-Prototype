import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'],
      manifest: {
        name: 'Pashu Sarthak',
        short_name: 'Pashu Sarthak',
        description: 'Smart livestock health and veterinary surveillance platform for Livestock Owners & Veterinary Officers.',
        theme_color: '#174D35',
        background_color: '#F7F6F0',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        id: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest,json,woff,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/[a-c]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'osm-tiles-cache',
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'unsplash-images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),

    {
      name: 'tts-proxy-middleware',

      configureServer(server) {
        server.middlewares.use('/api/tts', async (req, res) => {
          const host = req.headers.host || 'localhost:5173';

          const url = new URL(
            req.url || '',
            `http://${host}`
          );

          const text = url.searchParams.get('q');
          const lang = url.searchParams.get('tl') || 'hi';

          if (!text) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');

            res.end(
              JSON.stringify({
                error: 'Missing query parameter "q"',
              })
            );

            return;
          }

          try {
            const googleUrl =
              `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
                lang
              )}&client=tw-ob&q=${encodeURIComponent(text)}`;

            const ttsRes = await fetch(googleUrl, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              },
            });

            if (!ttsRes.ok) {
              res.statusCode = ttsRes.status;

              res.end(
                `Google TTS upstream error: ${ttsRes.status}`
              );

              return;
            }

            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader(
              'Cache-Control',
              'public, max-age=86400'
            );

            const arrayBuffer =
              await ttsRes.arrayBuffer();

            res.end(Buffer.from(arrayBuffer));
          } catch (err: any) {
            res.statusCode = 500;

            res.end(
              `TTS error: ${err.message || String(err)}`
            );
          }
        });
      },
    },
  ],
});