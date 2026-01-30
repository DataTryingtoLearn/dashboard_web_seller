import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    base: process.env.VITE_BASE_URL || './',
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('recharts')) return 'vendor-charts';
                        if (id.includes('mammoth')) return 'vendor-word';
                        return 'vendor';
                    }
                }
            }
        },
        chunkSizeWarningLimit: 1000,
    },
    server: {
        allowedHosts: [
            'silent-ghosts-cheat.loca.lt',
            '.loca.lt',
            '.ngrok-free.app'
        ],
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:3001',
                changeOrigin: true,
            }
        }
    }
})
