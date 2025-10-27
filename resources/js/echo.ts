import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

/**
 * Laravel Echo Configuration
 *
 * Initializes Laravel Echo for real-time broadcasting.
 * Uses Soketi (self-hosted WebSocket server) for development.
 *
 * @see https://laravel.com/docs/broadcasting
 * @see https://github.com/soketi/soketi
 */

// Make Pusher globally available for Echo
window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_CLUSTER,
  wsHost: import.meta.env.VITE_PUSHER_HOST || window.location.hostname,
  wsPort: import.meta.env.VITE_PUSHER_PORT || 6001,
  wssPort: import.meta.env.VITE_PUSHER_PORT || 6001,
  forceTLS: (import.meta.env.VITE_PUSHER_SCHEME || 'http') === 'https',
  encrypted: true,
  enabledTransports: ['ws', 'wss'],
  disableStats: true,
});

export default echo;
