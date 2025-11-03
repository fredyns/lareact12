import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/css/wysiwyg-fix.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    esbuild: {
        jsx: 'automatic',
        // Drop console and debugger in production
        drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
    build: {
        // Performance optimizations
        target: 'es2020',
        minify: 'esbuild',
        cssMinify: true,
        
        // Code splitting for better caching
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunk for stable dependencies
                    'vendor': [
                        'react',
                        'react-dom',
                        '@inertiajs/react',
                    ],
                    // UI components chunk
                    'ui': [
                        'lucide-react',
                        '@radix-ui/react-dialog',
                        '@radix-ui/react-dropdown-menu',
                        '@radix-ui/react-select',
                        '@radix-ui/react-checkbox',
                    ],
                    // Heavy libraries chunk (lazy loaded)
                    'heavy': [
                        '@tinymce/tinymce-react',
                        'leaflet',
                        'react-leaflet',
                    ],
                },
                // Optimize chunk naming
                chunkFileNames: 'assets/chunks/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash][extname]',
            },
        },
        
        // Chunk size warnings
        chunkSizeWarningLimit: 500,
        
        // Source maps for production debugging (optional)
        sourcemap: false,
        
        // Terser options for better minification
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                passes: 2,
            },
            format: {
                comments: false,
            },
        },
    },
    
    // Optimize dependencies
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            '@inertiajs/react',
        ],
    },
});
