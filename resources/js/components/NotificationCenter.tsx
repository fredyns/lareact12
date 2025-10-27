import React, { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Trash2, CheckCircle, Circle, Filter } from 'lucide-react';

/**
 * NotificationCenter Component
 *
 * Full-page notification center displaying all notifications with:
 * - Filtering by read status
 * - Filtering by type
 * - Bulk actions (mark all as read, delete)
 * - Pagination
 *
 * @returns {React.ReactElement} Notification center component
 */
export function NotificationCenter() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Get unique notification types
  const notificationTypes = Array.from(
    new Set(notifications.map((n) => n.type))
  );

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread' && n.read_at) return false;
    if (filter === 'read' && !n.read_at) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notification Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Status Filter */}
        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        {notificationTypes.length > 0 && (
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
          >
            <option value="all">All Types</option>
            {notificationTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                notification.read_at
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {notification.read_at ? (
                  <CheckCircle size={24} className="text-gray-400 dark:text-gray-500" />
                ) : (
                  <Circle size={24} className="text-blue-600 dark:text-blue-400 fill-current" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {notification.data?.title as React.ReactNode}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {notification.data?.body as React.ReactNode}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                        {notification.type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {notification.data?.action_url && (
                    <a
                      href={notification.data.action_url as string}
                      className="flex-shrink-0 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                    >
                      View
                    </a>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex gap-2">
                {!notification.read_at && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCircle size={20} />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' && typeFilter === 'all'
                ? 'No notifications yet'
                : 'No notifications match your filters'}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {notifications.length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {unreadCount}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {notifications.length - unreadCount}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Read</p>
        </div>
      </div>
    </div>
  );
}
