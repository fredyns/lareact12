import { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import Pusher from 'pusher-js';

interface WebSocketContextType {
  pusher: Pusher | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [pusher, setPusher] = useState<Pusher | null>(null);

  useEffect(() => {
    // Initialize Pusher (for Reverb) with error handling
    try {
      // Enable Pusher logging for debugging in development
      Pusher.logToConsole = import.meta.env.DEV;

      const pusherInstance = new Pusher(import.meta.env.VITE_REVERB_APP_KEY || '', {
        wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
        wsPort: parseInt(import.meta.env.VITE_REVERB_PORT || '8080', 10),
        forceTLS: import.meta.env.VITE_REVERB_SCHEME === 'https',
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        cluster: 'mt1', // Required by Pusher types but not used for self-hosted Reverb
        // Add authorization endpoint for private channels
        authEndpoint: '/broadcasting/auth',
        auth: {
          headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
          },
        },
      });

      console.log('🔧 Reverb Config:', {
        key: import.meta.env.VITE_REVERB_APP_KEY,
        host: import.meta.env.VITE_REVERB_HOST,
        port: import.meta.env.VITE_REVERB_PORT,
        scheme: import.meta.env.VITE_REVERB_SCHEME,
        authEndpoint: '/broadcasting/auth',
        csrfToken: document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')?.substring(0, 10) + '...',
      });

      // Connection state logging
      pusherInstance.connection.bind('connected', () => {
        console.log('✅ Reverb connected');
      });

      pusherInstance.connection.bind('disconnected', () => {
        console.log('❌ Reverb disconnected');
      });

      pusherInstance.connection.bind('error', (err: any) => {
        console.error('❌ Reverb connection error:', err);
      });

      setPusher(pusherInstance);

      // Cleanup on unmount
      return () => {
        pusherInstance.disconnect();
      };
    } catch (error) {
      console.error('Failed to initialize Reverb:', error);
      return undefined;
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ pusher }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketContext;
