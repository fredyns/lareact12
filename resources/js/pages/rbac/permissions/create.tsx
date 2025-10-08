import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { dashboard } from '@/routes';
import rbac from '@/routes/rbac';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

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
        title: 'Create Permission',
        href: rbac.permissions.create.url(),
    },
];

export default function CreatePermission() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        guard_name: 'web',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(rbac.permissions.store.url());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Permission" />
            
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create Permission</h1>
                        <p className="text-muted-foreground">
                            Create a new permission for access control
                        </p>
                    </div>
                    <Link href={rbac.permissions.index.url()}>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Permissions
                        </Button>
                    </Link>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Permission Details</CardTitle>
                        <CardDescription>
                            Enter the basic information for the new permission.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter permission name (e.g., users.create)"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Use dot notation for hierarchical permissions (e.g., users.create, posts.edit)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="guard_name">Guard Name</Label>
                                <Input
                                    id="guard_name"
                                    type="text"
                                    value={data.guard_name}
                                    onChange={(e) => setData('guard_name', e.target.value)}
                                    placeholder="Enter guard name"
                                    className={errors.guard_name ? 'border-destructive' : ''}
                                />
                                {errors.guard_name && (
                                    <p className="text-sm text-destructive">{errors.guard_name}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Usually 'web' for web applications
                                </p>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-4">
                                <Link href={rbac.permissions.index.url()}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Creating...' : 'Create Permission'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
