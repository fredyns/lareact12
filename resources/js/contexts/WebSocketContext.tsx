import { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import Pusher from 'pusher-js';

interface WebSocketContextType {
  pusher: Pusher | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [pusher, setPusher] = useState<Pusher | null>(null);

  console.log('🎯 WebSocketProvider RENDERED');

  useEffect(() => {
    console.log('🚀 WebSocketProvider useEffect RUNNING');
    alert('WebSocket initializing - check console!');
    
    // Initialize Pusher with error handling
    try {
      // Enable Pusher logging for debugging
      Pusher.logToConsole = true; // Force enable
      console.log('📡 Pusher.logToConsole:', Pusher.logToConsole);

      const pusherInstance = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY || '', {
        wsHost: import.meta.env.VITE_PUSHER_HOST || 'localhost',
        wsPort: parseInt(import.meta.env.VITE_PUSHER_PORT || '6001', 10),
        forceTLS: import.meta.env.VITE_PUSHER_SCHEME === 'https',
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
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

      console.log('🔧 Pusher Config:', {
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        host: import.meta.env.VITE_PUSHER_HOST,
        port: import.meta.env.VITE_PUSHER_PORT,
        authEndpoint: '/broadcasting/auth',
        csrfToken: document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')?.substring(0, 10) + '...',
      });

      // Connection state logging
      pusherInstance.connection.bind('connected', () => {
        console.log('✅ Pusher connected');
      });

      pusherInstance.connection.bind('disconnected', () => {
        console.log('❌ Pusher disconnected');
      });

      pusherInstance.connection.bind('error', (err: any) => {
        console.error('❌ Pusher connection error:', err);
      });

      setPusher(pusherInstance);

      // Cleanup on unmount
      return () => {
        pusherInstance.disconnect();
      };
    } catch (error) {
      console.error('Failed to initialize Pusher:', error);
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
