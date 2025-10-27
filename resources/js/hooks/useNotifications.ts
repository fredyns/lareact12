import { useEffect, useState, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import echo from '@/echo';

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
 * Notification interface
 */
interface Notification {
  id: string;
  type: string;
  data: Record<string, unknown>;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
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
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
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
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
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
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
        },
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
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      // Update local state
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!auth?.user?.id) return;

    // Fetch initial notifications
    fetchNotifications();
    fetchUnreadCount();

    // Subscribe to private channel
    const channel = echo.private(`user.${auth.user.id}`);

    channel.listen('notification.created', (data: Notification) => {
      // Add new notification to the beginning
      setNotifications((prev) => [data, ...prev]);
      // Increment unread count
      setUnreadCount((prev) => prev + 1);
    });

    // Cleanup on unmount
    return () => {
      channel.stopListening('notification.created');
      if (auth?.user?.id) {
        echo.leaveChannel(`user.${auth.user.id}`);
      }
    };
  }, [auth?.user?.id, fetchNotifications, fetchUnreadCount]);

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
