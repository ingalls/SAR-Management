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
            rollupOptions: {
                input: {
                    main: path.resolve(__dirname, 'index.html'),
                    docs: path.resolve(__dirname, 'docs.html'),
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
