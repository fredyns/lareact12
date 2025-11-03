import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { memo, Suspense, lazy } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

// Memoized placeholder card to prevent unnecessary re-renders
const DashboardCard = memo(function DashboardCard() {
    return (
        <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
        </div>
    );
});

// Memoized stats section
const StatsSection = memo(function StatsSection() {
    return (
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <DashboardCard />
            <DashboardCard />
            <DashboardCard />
        </div>
    );
});

// Memoized main content section
const MainContent = memo(function MainContent() {
    return (
        <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
            <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
        </div>
    );
});

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Suspense fallback={null}>
                    <StatsSection />
                </Suspense>
                <Suspense fallback={null}>
                    <MainContent />
                </Suspense>
            </div>
        </AppLayout>
    );
}
