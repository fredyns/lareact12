import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
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
import AuthenticatedLayout from '@/layouts/app-layout';

interface Permission {
    id: string;
    name: string;
    guard_name: string;
}

interface Props {
    permission: Permission;
}

export default function EditPermission({ permission }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: permission.name,
        guard_name: permission.guard_name,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('rbac.permissions.update', permission.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Permission: ${permission.name}`} />
            
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href={route('rbac.permissions.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Permissions
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Permission</h1>
                        <p className="text-muted-foreground">
                            Update permission details
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Permission Details</CardTitle>
                            <CardDescription>
                                Update the basic information for this permission.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end space-x-4">
                        <Link href={route('rbac.permissions.index')}>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Updating...' : 'Update Permission'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
