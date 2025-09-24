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
import { ArrowLeft, Settings } from 'lucide-react';
import AuthenticatedLayout from '@/layouts/app-layout';

interface Role {
    id: string;
    name: string;
    guard_name: string;
}

interface Permission {
    id: string;
    name: string;
    guard_name: string;
}

interface RolePermission {
    id: string;
    role: Role;
    permission: Permission;
    created_at: string;
}

interface Props {
    rolePermission: RolePermission;
}

export default function ShowRolePermission({ rolePermission }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title={`Role Permission: ${rolePermission.role.name} - ${rolePermission.permission.name}`} />
            
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href={route('rbac.role-permissions.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Role Permissions
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center">
                            <Settings className="mr-3 h-8 w-8" />
                            Permission Assignment
                        </h1>
                        <p className="text-muted-foreground">
                            Details of this role permission assignment
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Information</CardTitle>
                            <CardDescription>
                                Details about the assigned role
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Role Name</label>
                                <p className="text-lg font-semibold">{rolePermission.role.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Guard</label>
                                <div className="mt-1">
                                    <Badge variant="outline">{rolePermission.role.guard_name}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Permission Information</CardTitle>
                            <CardDescription>
                                Details about the assigned permission
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Permission Name</label>
                                <p className="text-lg font-semibold">{rolePermission.permission.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Guard</label>
                                <div className="mt-1">
                                    <Badge variant="outline">{rolePermission.permission.guard_name}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Assignment Details</CardTitle>
                            <CardDescription>
                                Information about this permission assignment
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Assigned On</label>
                                <p className="text-sm">{new Date(rolePermission.created_at).toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
