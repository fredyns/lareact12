import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Bell, Loader2 } from 'lucide-react';
import { useState } from 'react';

/**
 * NotificationBell Component
 *
 * Displays a bell icon with unread notification count badge.
 * Shows dropdown with recent notifications and links to notification center.
 *
 * @example
 * ```tsx
 * <NotificationBell />
 * ```
 */
export function NotificationBell() {
  const { notifications, unreadCount, isLoading, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Auto-close dropdown after marking as read
  const handleMarkAsRead = (id: string) => {
    markAsRead(id);
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="group relative h-9 w-9">
          <Bell className="!size-5 opacity-80 group-hover:opacity-100" />

          {/* Unread Badge */}
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 p-0" side="bottom">
        {/* Header */}
        <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-100">Notifications</h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {unreadCount} new
              </span>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
            </div>
          ) : recentNotifications.length > 0 ? (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'border-l-4 px-4 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900',
                    notification.read_at
                      ? 'border-l-transparent bg-white dark:bg-neutral-950'
                      : 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {notification.data.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">
                        {notification.data.body}
                      </p>
                      <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
                        {new Date(notification.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {!notification.read_at && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="mt-1 flex-shrink-0 rounded bg-blue-500 px-2 py-1 text-xs font-medium text-white hover:bg-blue-600"
                      >
                        Mark
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 flex-col items-center justify-center text-neutral-500">
              <Bell className="mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <Link
              href="/notifications"
              className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View all notifications
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
