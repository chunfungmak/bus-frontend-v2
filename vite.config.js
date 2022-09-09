import { defineConfig } from 'vite';
import { injectHtml } from 'vite-plugin-html';
import react from '@vitejs/plugin-react';
import path from 'path'

export default defineConfig({
    plugins: [
        react(),
        injectHtml({
            data: {
                htmlWebpackPlugin: {
                    options: {
                        mayVar: 'variable',
                    },
                },
            },
        }),
    ],

    resolve: {
        alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
    },

    define: {
        __PAGE_TITLE__: JSON.stringify('標題'),
    },

    server: {
        host: '0.0.0.0',
        https: false,
        port: 5600,
    },

    build: {
        outDir: 'build',
        rollupOptions: {
            input: {
                popup: path.resolve(__dirname, 'index.html'),
                content: path.resolve(__dirname, 'src/index.tsx'),
            },
            output: {
                entryFileNames: 'static/js/[name].js',
            },
        },
    },
});
