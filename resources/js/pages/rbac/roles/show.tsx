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
import { ArrowLeft, Edit, Shield, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Permission {
    id: string;
    name: string;
    guard_name: string;
}

interface Role {
    id: string;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions: Permission[];
}

interface Props {
    role: Role;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard.url(),
    },
    {
        title: 'Roles',
        href: rbac.roles.index.url(),
    },
    {
        title: 'Role Details',
        href: '#',
    },
];

export default function ShowRole({ role }: Props) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${role.name}?`)) {
            router.delete(rbac.roles.destroy.url(role.id));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Role: ${role.name}`} />
            
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center">
                            <Shield className="mr-2 h-5 w-5" />
                            {role.name}
                        </h1>
                        <p className="text-muted-foreground">
                            Role details and assigned permissions
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={rbac.roles.index.url()}>
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Roles
                            </Button>
                        </Link>
                        <Link href={rbac.roles.edit.url(role.id)}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Role
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Role
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Information</CardTitle>
                            <CardDescription>
                                Basic details about this role
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <Shield className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{role.name}</p>
                                    <p className="text-sm text-muted-foreground">Role Name</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                    <Badge variant="outline" className="h-4 w-4 flex items-center justify-center p-2">{role.guard_name.charAt(0).toUpperCase()}</Badge>
                                </div>
                                <div>
                                    <p className="font-medium">{role.guard_name}</p>
                                    <p className="text-sm text-muted-foreground">Guard Name</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Timestamps</CardTitle>
                            <CardDescription>
                                Creation and modification dates
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                        Created
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium">{new Date(role.created_at).toLocaleDateString('en-US', {
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
                                    <p className="font-medium">{new Date(role.updated_at).toLocaleDateString('en-US', {
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
                        <CardTitle>Assigned Permissions ({role.permissions.length})</CardTitle>
                        <CardDescription>
                            Permissions granted to this role
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {role.permissions.length === 0 ? (
                            <div className="text-center py-4">
                                <p className="text-muted-foreground">
                                    No permissions assigned to this role.
                                </p>
                                <Link href={rbac.roles.edit.url(role.id)} className="mt-4 inline-block">
                                    <Button variant="outline">
                                        Assign Permissions
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {role.permissions.map((permission) => (
                                    <div
                                        key={permission.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">{permission.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Guard: {permission.guard_name}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Role ID</CardTitle>
                        <CardDescription>
                            Unique identifier for this role
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md bg-muted p-3">
                            <code className="text-sm font-mono">{role.id}</code>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            This is the unique identifier for this role in the system.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
