import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [
        vue()
    ],
    optimizeDeps: {
        include: ["showdown"],
    },
    server: {
        port: 8080,
    }
})

