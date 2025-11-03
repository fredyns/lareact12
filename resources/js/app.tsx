import '../css/app.css';
import '../css/react-select-dark.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { WebSocketProvider } from './contexts/WebSocketContext';

// Extend Window interface to include custom properties
declare global {
    interface Window {
        __performanceMonitor?: {
            start: (label: string) => void;
            end: (label: string) => void;
        };
    }
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Setup preconnect and font optimization
function setupPerformanceOptimizations() {
    const preconnectDomains = [
        'https://fonts.bunny.net',
    ];

    preconnectDomains.forEach((domain) => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    });

    // DNS prefetch for analytics and other services
    const dnsPrefetchDomains = [
        'https://cdn.jsdelivr.net',
    ];

    dnsPrefetchDomains.forEach((domain) => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        document.head.appendChild(link);
    });
}

// Call on app initialization
setupPerformanceOptimizations();

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

// Load performance monitor only in development
if (import.meta.env.DEV) {
    import('./utils/performanceMonitor').then(({ performanceMonitor }) => {
        // Performance monitor is now available for development use
        window.__performanceMonitor = performanceMonitor;
    }).catch(err => console.error('Performance monitor failed to load:', err));
}

// Web Vitals tracking for performance monitoring (always active)
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

interface WebVitalsMetric {
    name: string;
    value: number;
    rating?: string;
    delta: number;
    navigationType: string;
    id: string;
}

function sendToAnalytics(metric: WebVitalsMetric) {
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
