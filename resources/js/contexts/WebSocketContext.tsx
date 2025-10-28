import { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import Pusher from 'pusher-js';

interface WebSocketContextType {
  pusher: Pusher | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [pusher, setPusher] = useState<Pusher | null>(null);

  useEffect(() => {
    // Initialize Pusher with error handling
    try {
      const pusherInstance = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY || '', {
        wsHost: import.meta.env.VITE_PUSHER_HOST || 'localhost',
        wsPort: parseInt(import.meta.env.VITE_PUSHER_PORT || '6001', 10),
        forceTLS: import.meta.env.VITE_PUSHER_SCHEME === 'https',
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
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
