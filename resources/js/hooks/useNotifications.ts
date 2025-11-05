import { useEffect, useState, useCallback, useRef } from 'react';
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
  action_url?: string;
  icon?: string;
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
  const csrfInitialized = useRef(false);

  // Initialize CSRF cookie on mount
  useEffect(() => {
    if (!csrfInitialized.current) {
      csrfInitialized.current = true;
      fetch('/sanctum/csrf-cookie', {
        credentials: 'same-origin',
      }).catch(error => console.error('Failed to initialize CSRF cookie:', error));
    }
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/notifications/api/list', {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
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
      const response = await fetch('/notifications/count', {
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch count');

      const data = await response.json();
      setUnreadCount(data.unread || 0);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  }, []);

  // Get CSRF token from meta tag (fallback for Sanctum cookie-based auth)
  const getCsrfToken = useCallback(() => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    // Store previous state for rollback
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    try {
      // Optimistic update - update UI immediately
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Make API request in background
      const response = await fetch(`/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        credentials: 'same-origin',
      });

      if (!response.ok) throw new Error(`Failed to mark as read: ${response.status}`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Rollback on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  }, [notifications, unreadCount, getCsrfToken]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    // Store previous state for rollback
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    try {
      // Optimistic update - update UI immediately
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);

      // Make API request in background
      const response = await fetch('/notifications/read-all', {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        credentials: 'same-origin',
      });

      if (!response.ok) throw new Error(`Failed to mark all as read: ${response.status}`);
    } catch (error) {
      console.error('Error marking all as read:', error);
      // Rollback on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  }, [notifications, unreadCount, getCsrfToken]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    // Store previous state for rollback
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;
    const deletedNotification = notifications.find(n => n.id === notificationId);

    try {
      // Optimistic update - remove notification immediately
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      
      // Update unread count if deleted notification was unread
      if (deletedNotification && !deletedNotification.read_at) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Make API request in background
      const response = await fetch(`/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        credentials: 'same-origin',
      });

      if (!response.ok) throw new Error(`Failed to delete notification: ${response.status}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Rollback on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    }
  }, [notifications, unreadCount, getCsrfToken]);

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    // Store previous state for rollback
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    try {
      // Optimistic update - clear all notifications immediately
      setNotifications([]);
      setUnreadCount(0);

      // Make API request in background
      const response = await fetch('/notifications', {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        credentials: 'same-origin',
      });

      if (!response.ok) throw new Error(`Failed to delete all notifications: ${response.status}`);
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      // Rollback on error
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      throw error;
    }
  }, [notifications, unreadCount, getCsrfToken]);

  // Subscribe to real-time notifications
  useEffect(() => {
    // Fetch initial notifications
    fetchNotifications();
    fetchUnreadCount();

    // Subscribe to private notifications channel
    if (auth.user && pusher) {
      const channel = `private-App.Models.User.${auth.user.id}`;
      console.log('🔔 Subscribing to notification channel:', channel);
      
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

      // Listen for all notifications marked as read
      channelInstance.bind('notifications.all-read', (data: { user_id: string; marked_at: string }) => {
        console.log('✅ All notifications marked as read:', data);
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read_at: data.marked_at }))
        );
        setUnreadCount(0);
      });

      // Listen for notification deletion
      channelInstance.bind('notification.deleted', (data: { id: string }) => {
        console.log('🗑️ Notification deleted:', data);
        const deletedNotification = notifications.find(n => n.id === data.id);
        setNotifications((prev) => prev.filter((n) => n.id !== data.id));
        
        // Update unread count if deleted notification was unread
        if (deletedNotification && !deletedNotification.read_at) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      });

      // Listen for all notifications deletion
      channelInstance.bind('notifications.all-deleted', (data: { user_id: string }) => {
        console.log('🗑️ All notifications deleted:', data);
        setNotifications([]);
        setUnreadCount(0);
      });

      // Cleanup on unmount
      return () => {
        console.log('🔌 Unsubscribing from:', channel);
        channelInstance.unbind('notification.created');
        channelInstance.unbind('notification.read');
        channelInstance.unbind('notifications.all-read');
        channelInstance.unbind('notification.deleted');
        channelInstance.unbind('notifications.all-deleted');
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
    deleteAllNotifications,
  };
}
