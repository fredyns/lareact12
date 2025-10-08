import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { dashboard } from '@/routes';
import rbac from '@/routes/rbac';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Edit, Key, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Permission {
    id: string;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    permission: Permission;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard.url(),
    },
    {
        title: 'Permissions',
        href: rbac.permissions.index.url(),
    },
    {
        title: 'Permission Details',
        href: '#',
    },
];

export default function ShowPermission({ permission }: Props) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${permission.name}?`)) {
            router.delete(rbac.permissions.destroy.url(permission.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Permission: ${permission.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center">
                            <Key className="mr-2 h-5 w-5" />
                            {permission.name}
                        </h1>
                        <p className="text-muted-foreground">
                            Permission details and information
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={rbac.permissions.index.url()}>
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Permissions
                            </Button>
                        </Link>
                        <Link href={rbac.permissions.edit.url(permission.id)}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Permission
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Permission
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{permission.name}</CardTitle>
                            <CardDescription>
                                Guard: <Badge variant="outline">{permission.guard_name}</Badge>
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <Key className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{permission.name}</p>
                                    <p className="text-sm text-muted-foreground">Permission Name</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                    <Badge variant="outline" className="h-4 w-4 flex items-center justify-center p-2">{permission.guard_name.charAt(0).toUpperCase()}</Badge>
                                </div>
                                <div>
                                    <p className="font-medium">{permission.guard_name}</p>
                                    <p className="text-sm text-muted-foreground">Guard Name</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Timestamps</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                        Created
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium">{new Date(permission.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}</p>
                                    <p className="text-sm text-muted-foreground">Created At</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                                    <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                                        Updated
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium">{new Date(permission.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}</p>
                                    <p className="text-sm text-muted-foreground">Last Updated</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Permission ID</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md bg-muted p-3">
                            <code className="text-sm font-mono">{permission.id}</code>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            This is the unique identifier for this permission in the system.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
