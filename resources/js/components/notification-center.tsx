import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { CheckCheck, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';

/**
 * NotificationCenter Component
 *
 * Full-featured notification management interface with filtering,
 * pagination, and bulk actions.
 *
 * @example
 * ```tsx
 * <NotificationCenter />
 * ```
 */
export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    fetchNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemsPerPage = 10;

  const filteredNotifications = filter === 'unread' ? notifications.filter((n) => !n.read_at) : notifications;

  const paginatedNotifications = filteredNotifications.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
  };

  const handleRefresh = async () => {
    await fetchNotifications();
  };

  const handleDeleteAll = async () => {
    try {
      setIsDeleting(true);
      await deleteAllNotifications();
      setPage(1);
    } catch (error) {
      console.error('Failed to delete all notifications:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center gap-2">
          <Select
            value={filter}
            onValueChange={(value: 'all' | 'unread') => {
              setFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter notifications" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
            </SelectContent>
          </Select>

          {unreadCount > 0 && (
            <Button
              title={'Mark all as read'}
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button
          title={'Refresh notification'}
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </div>

      {/* Notifications List */}
      {isLoading && notifications.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
        </div>
      ) : paginatedNotifications.length > 0 ? (
        <div className="space-y-2">
          {paginatedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'flex items-start gap-4 rounded-lg border p-4 transition-colors',
                notification.read_at
                  ? 'border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950'
                  : 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20',
              )}
            >
              {/* Status Indicator */}
              <div className="mt-1 flex-shrink-0">
                {!notification.read_at && <div className="h-3 w-3 rounded-full bg-blue-500" />}
              </div>

              {/* Content */}
              <Link
                href={notification.data.action_url ?? '#'}
                // className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                onClick={() => !notification.read_at && handleMarkAsRead(notification.id)}
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{notification.data.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{notification.data.body}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-xs text-neutral-500 dark:text-neutral-500">
                      {new Date(notification.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Actions */}
              <div className="ml-auto flex flex-shrink-0 items-start gap-2">
                {!notification.read_at && (
                  <Button
                    title={'Mark as read'}
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkAsRead(notification.id)}
                    className="gap-2"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  title={'Delete notification'}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(notification.id)}
                  className="gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-neutral-500 dark:text-neutral-400">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Total</p>
          <p className="mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-100">{notifications.length}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Unread</p>
          <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{unreadCount}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Read</p>
          <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
            {notifications.length - unreadCount}
          </p>
        </div>
      </div>

      {/* Delete All */}
      {notifications.length > 0 && (
        <div className="flex justify-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting} className="gap-2">
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete all notifications
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all {notifications.length} notification
                  {notifications.length !== 1 ? 's' : ''} from your account.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAll} className="bg-red-600 hover:bg-red-700">
                  Delete all
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
