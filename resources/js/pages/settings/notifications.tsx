import AppLayout from '@/layouts/app-layout';
import { NotificationPreferences } from '@/components/notification-preferences';
import { type BreadcrumbItem } from '@/types';

/**
 * Notification Settings Page
 *
 * Allows users to configure notification preferences including
 * enabling/disabling by type and channel, and setting quiet hours.
 */
export default function NotificationSettingsPage() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/' },
        { title: 'Settings', href: '/settings' },
        { title: 'Notifications', href: '/settings/notifications' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="mx-auto max-w-2xl px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                        Notification Settings
                    </h1>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                        Manage your notification preferences and quiet hours
                    </p>
                </div>

                <NotificationPreferences />
            </div>
        </AppLayout>
    );
}
