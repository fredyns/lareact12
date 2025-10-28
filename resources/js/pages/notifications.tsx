import AppLayout from '@/layouts/app-layout';
import { NotificationCenter } from '@/components/notification-center';
import { type BreadcrumbItem } from '@/types';

/**
 * Notifications Page
 *
 * Full-page notification center showing all notifications with filtering
 * and management options.
 */
export default function NotificationsPage() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/' },
        { title: 'Notifications', href: '/notifications' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                        Notifications
                    </h1>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                        Manage and view all your notifications
                    </p>
                </div>

                <NotificationCenter />
            </div>
        </AppLayout>
    );
}
