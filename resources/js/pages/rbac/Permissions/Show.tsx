import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Edit, Key } from 'lucide-react';
import AuthenticatedLayout from '@/layouts/app-layout';

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

export default function ShowPermission({ permission }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title={`Permission: ${permission.name}`} />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('rbac.permissions.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Permissions
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center">
                                <Key className="mr-3 h-8 w-8" />
                                {permission.name}
                            </h1>
                            <p className="text-muted-foreground">
                                Permission details and information
                            </p>
                        </div>
                    </div>
                    <Link href={route('rbac.permissions.edit', permission.id)}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Permission
                        </Button>
                    </Link>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Permission Information</CardTitle>
                        <CardDescription>
                            Basic details about this permission
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Name</label>
                            <p className="text-lg font-semibold">{permission.name}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Guard</label>
                            <div className="mt-1">
                                <Badge variant="outline">{permission.guard_name}</Badge>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Created</label>
                            <p className="text-sm">{new Date(permission.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                            <p className="text-sm">{new Date(permission.updated_at).toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
