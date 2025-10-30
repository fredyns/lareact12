import { useEffect, useState, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { useWebSocket } from '@/contexts/WebSocketContext';

/**
 * User interface
 */
interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Auth interface
 */
interface Auth {
  user: User | null;
}

/**
 * Notification data interface
 */
interface NotificationData {
  title: string;
  body: string;
  [key: string]: unknown;
}

/**
 * Notification interface
 */
interface Notification {
  id: string;
  type: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * useNotifications Hook
 *
 * Manages real-time notifications for the authenticated user.
 * Subscribes to private WebSocket channel and listens for notification events.
 *
 * @returns {Object} Notifications state and methods
 * @example
 * const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
 */
export function useNotifications() {
  const { auth } = usePage<{ auth: Auth }>().props;
  const { pusher } = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications', {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data = await response.json();
      setNotifications(data.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/count', {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch count');

      const data = await response.json();
      setUnreadCount(data.unread || 0);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) throw new Error('Failed to mark as read');

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        )
      );

      // Decrement unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) throw new Error('Failed to mark all as read');

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );

      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        credentials: 'same-origin',
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      // Update local state
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      
      // Update unread count if deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.read_at) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // Subscribe to real-time notifications
  useEffect(() => {
    console.log('📢 useNotifications useEffect triggered');
    console.log('📢 auth.user:', auth.user);
    console.log('📢 pusher:', pusher);
    
    // Fetch initial notifications
    fetchNotifications();
    fetchUnreadCount();

    // Subscribe to private notifications channel
    if (auth.user && pusher) {
      const channel = `private-App.Models.User.${auth.user.id}`;
      console.log('🔔 Subscribing to channel:', channel);
      alert('Subscribing to: ' + channel);
      
      const channelInstance = pusher.subscribe(channel);

      // Log subscription state
      channelInstance.bind('pusher:subscription_succeeded', () => {
        console.log('✅ Successfully subscribed to:', channel);
      });

      channelInstance.bind('pusher:subscription_error', (error: any) => {
        console.error('❌ Subscription error:', error);
      });

      // Listen for new notifications
      channelInstance.bind('notification.created', (notification: Notification) => {
        console.log('🔔 New notification received:', notification);
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });

      // Listen for read notifications
      channelInstance.bind('notification.read', (notification: Notification) => {
        console.log('✅ Notification marked as read:', notification);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read_at: notification.read_at } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      });

      // Cleanup on unmount
      return () => {
        console.log('🔌 Unsubscribing from:', channel);
        channelInstance.unbind('notification.created');
        channelInstance.unbind('notification.read');
        channelInstance.unbind('pusher:subscription_succeeded');
        channelInstance.unbind('pusher:subscription_error');
        pusher.unsubscribe(channel);
      };
    }
  }, [auth?.user?.id, pusher, fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
