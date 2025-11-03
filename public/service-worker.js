const CACHE_NAME = 'lareact12-v1';
const urlsToCache = [
  '/',
  '/build/assets/vendor.js',
  '/build/assets/app.js',
  '/build/assets/app.css',
  '/build/assets/ui.js',
  // Add other critical assets
  '/favicon.ico',
  '/favicon.svg',
  '/apple-touch-icon.png',
];

// Install event - cache critical resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching critical resources');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: All critical resources cached');
        // Force the waiting service worker to become the active service worker
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches that don't match current version
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activated successfully');
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when available
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip API requests for real-time functionality
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/broadcasting/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          console.log('Service Worker: Serving from cache:', event.request.url);
          return response;
        }

        // Otherwise fetch from network
        console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(response => {
            // Don't cache if response is not ok
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response for future use (only for navigation requests and assets)
            if (event.request.mode === 'navigate' || 
                event.request.destination === 'script' ||
                event.request.destination === 'style' ||
                event.request.destination === 'image') {
              
              caches.open(CACHE_NAME)
                .then(cache => {
                  console.log('Service Worker: Caching new resource:', event.request.url);
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(error => {
            console.log('Service Worker: Network request failed:', error);
            
            // For navigation requests, return a basic offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/').then(response => {
                return response || new Response(
                  '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection and try again.</p></body></html>',
                  {
                    headers: { 'Content-Type': 'text/html' }
                  }
                );
              });
            }
            
            // For other requests, just throw the error
            throw error;
          });
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
