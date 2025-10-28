import Pusher from 'pusher-js';
// Environment variables are accessed via import.meta.env in Vite

// Enable pusher logging - don't include this in production
if (process.env.NODE_ENV === 'development') {
  // @ts-expect-error
  Pusher.logToConsole = true;
}

// Initialize Pusher
export const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY || '', {
  wsHost: import.meta.env.VITE_PUSHER_HOST || '127.0.0.1',
  wsPort: parseInt(import.meta.env.VITE_PUSHER_PORT || '6001', 10),
  forceTLS: import.meta.env.VITE_PUSHER_SCHEME === 'https',  
  disableStats: true,
  enabledTransports: ['ws', 'wss'],
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
});

export default pusher;
