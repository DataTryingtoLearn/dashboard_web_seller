import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
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
                        return 'vendor'; // El resto de librerías
                    }
                }
            }
        },
        chunkSizeWarningLimit: 1000,
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:3001',
                changeOrigin: true,
            }
        }
    }
})
