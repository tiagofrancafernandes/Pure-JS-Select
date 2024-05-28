import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite';

const vueConfig = {
    template: {
        transformAssetUrls: {
            base: null,
            includeAbsolute: false,
        },
    },
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        //
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@js': fileURLToPath(new URL('./src/js', import.meta.url)),
            '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
        }
    }
});
