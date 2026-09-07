import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      manifest: {
        name: 'Krishi Sarthak',
        short_name: 'Krishi Sarthak',
        description:
          'AI-powered crop health monitoring and agricultural advisory platform for farmers.',

        theme_color: '#173f35',
        background_color: '#f6f3eb',
        display: 'standalone',
        orientation: 'portrait',

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
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
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