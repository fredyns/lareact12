import '../css/app.css';
import '../css/react-select-dark.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { WebSocketProvider } from './contexts/WebSocketContext';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <WebSocketProvider>
                <App {...props} />
            </WebSocketProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();

// Web Vitals tracking for performance monitoring
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
    // Send metrics to console in development
    if (import.meta.env.DEV) {
        console.log('Web Vitals:', {
            name: metric.name,
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
            navigationType: metric.navigationType,
            id: metric.id,
        });
    }
    
    // In production, you could send to your analytics service:
    // gtag('event', metric.name, {
    //     event_category: 'Web Vitals',
    //     value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    //     event_label: metric.id,
    //     non_interaction: true,
    // });
}

// Track Core Web Vitals
onCLS(sendToAnalytics);  // Cumulative Layout Shift
onINP(sendToAnalytics);  // Interaction to Next Paint (replaces FID)
onFCP(sendToAnalytics);  // First Contentful Paint
onLCP(sendToAnalytics);  // Largest Contentful Paint
onTTFB(sendToAnalytics); // Time to First Byte

// Service Worker Registration for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered successfully:', registration.scope);
                
                // Check for service worker updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New service worker is available
                                console.log('New content is available; please refresh.');
                                
                                // You could show a notification to the user here
                                // For now, we'll just log it
                            }
                        });
                    }
                });
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
