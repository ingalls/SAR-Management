import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path';
import vue from '@vitejs/plugin-vue'
import icons from './public/logos/icons.ts';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    const res = {
        plugins: [
            vue(),
            VitePWA({
                registerType: 'autoUpdate',
                manifest: {
                    name: 'MesaSAR',
                    short_name: 'MesaSAR',
                    description: 'MesaSAR Team Management',
                    theme_color: '#000000',
                    icons
                },
                devOptions: {
                    enabled: true
                },
                workbox: {
                    maximumFileSizeToCacheInBytes: 3000000,
                    clientsClaim: true,
                    skipWaiting: true,
                    navigateFallbackDenylist: [/^\/api/, /^\/docs/]
                }
            })
        ],
        optimizeDeps: {
            include: ["showdown", "@tak-ps/vue-tabler"],
        },
        build: {
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, 'index.html'),
                },
            },
        },
        server: {
            port: 8080,
        },
    }

    return res;
})

