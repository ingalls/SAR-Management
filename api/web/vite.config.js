import { defineConfig } from 'vite'
import path from 'node:path';
import vue from '@vitejs/plugin-vue'

export default defineConfig(() => {
    return {
        define: {
            'import.meta.env.HASH': JSON.stringify(Math.random().toString(36).substring(2, 15)),
        },
        plugins: [
            vue(),
            {
                name: 'configure-server',
                configureServer(server) {
                    server.middlewares.use((req, res, next) => {
                        if (req.url?.startsWith('/docs') && !path.extname(req.url)) {
                            req.url = '/docs.html';
                        }
                        next();
                    });
                }
            }
        ],
        optimizeDeps: {
            include: ["showdown", "@tak-ps/vue-tabler"],
        },
        build: {
            manifest: true,
            // @tabler/core >= 1.5 themes with CSS light-dark(). The default CSS target
            // makes lightningcss transpile it into a var() fallback that resolves at
            // :root (light), which breaks nested data-bs-theme='dark' areas like the header.
            // Target browsers with native light-dark() support so it is left as-is.
            cssTarget: ['chrome123', 'edge123', 'firefox120', 'safari17.5', 'ios17.5'],
            rollupOptions: {
                input: {
                    main: path.resolve(import.meta.dirname, 'index.html'),
                    docs: path.resolve(import.meta.dirname, 'docs.html'),
                },
            },
        },
        server: {
            port: 8080,
            proxy: {
                '/api': {
                    ws: true,
                    target: 'http://localhost:4999',
                    changeOrigin: true,
                }
            }
        },
    }
})
