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
import { ArrowLeft, UserCog } from 'lucide-react';
import AuthenticatedLayout from '@/layouts/app-layout';

interface User {
    id: string;
    name: string;
    email: string;
}

interface Permission {
    id: string;
    name: string;
    guard_name: string;
}

interface UserPermission {
    id: string;
    user: User;
    permission: Permission;
    created_at: string;
}

interface Props {
    userPermission: UserPermission;
}

export default function ShowUserPermission({ userPermission }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title={`User Permission: ${userPermission.user.name} - ${userPermission.permission.name}`} />
            
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href={route('rbac.user-permissions.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to User Permissions
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center">
                            <UserCog className="mr-3 h-8 w-8" />
                            Permission Assignment
                        </h1>
                        <p className="text-muted-foreground">
                            Details of this user permission assignment
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                            <CardDescription>
                                Details about the assigned user
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Name</label>
                                <p className="text-lg font-semibold">{userPermission.user.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                <p className="text-sm">{userPermission.user.email}</p>
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
                                <p className="text-lg font-semibold">{userPermission.permission.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Guard</label>
                                <div className="mt-1">
                                    <Badge variant="outline">{userPermission.permission.guard_name}</Badge>
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
                                <p className="text-sm">{new Date(userPermission.created_at).toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
