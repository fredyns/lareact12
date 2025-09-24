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
import { ArrowLeft, Edit, Shield } from 'lucide-react';
import AuthenticatedLayout from '@/layouts/app-layout';

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

export default function ShowRole({ role }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title={`Role: ${role.name}`} />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('rbac.roles.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Roles
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center">
                                <Shield className="mr-3 h-8 w-8" />
                                {role.name}
                            </h1>
                            <p className="text-muted-foreground">
                                Role details and assigned permissions
                            </p>
                        </div>
                    </div>
                    <Link href={route('rbac.roles.edit', role.id)}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Role
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Information</CardTitle>
                            <CardDescription>
                                Basic details about this role
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Name</label>
                                <p className="text-lg font-semibold">{role.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Guard</label>
                                <div className="mt-1">
                                    <Badge variant="outline">{role.guard_name}</Badge>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Created</label>
                                <p className="text-sm">{new Date(role.created_at).toLocaleString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                <p className="text-sm">{new Date(role.updated_at).toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Assigned Permissions</CardTitle>
                            <CardDescription>
                                Permissions granted to this role ({role.permissions.length} total)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {role.permissions.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">
                                        No permissions assigned to this role.
                                    </p>
                                    <Link href={route('rbac.roles.edit', role.id)} className="mt-4 inline-block">
                                        <Button variant="outline">
                                            Assign Permissions
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
