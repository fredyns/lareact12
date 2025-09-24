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
import { ArrowLeft, UserCheck } from 'lucide-react';
import AuthenticatedLayout from '@/layouts/app-layout';

interface User {
    id: string;
    name: string;
    email: string;
}

interface Role {
    id: string;
    name: string;
    guard_name: string;
}

interface UserRole {
    id: string;
    user: User;
    role: Role;
    created_at: string;
}

interface Props {
    userRole: UserRole;
}

export default function ShowUserRole({ userRole }: Props) {
    return (
        <AuthenticatedLayout>
            <Head title={`User Role: ${userRole.user.name} - ${userRole.role.name}`} />
            
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href={route('rbac.user-roles.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to User Roles
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight flex items-center">
                            <UserCheck className="mr-3 h-8 w-8" />
                            Role Assignment
                        </h1>
                        <p className="text-muted-foreground">
                            Details of this user role assignment
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
                                <p className="text-lg font-semibold">{userRole.user.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                <p className="text-sm">{userRole.user.email}</p>
                            </div>
                        </CardContent>
                    </Card>

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
                                <p className="text-lg font-semibold">{userRole.role.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Guard</label>
                                <div className="mt-1">
                                    <Badge variant="outline">{userRole.role.guard_name}</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Assignment Details</CardTitle>
                            <CardDescription>
                                Information about this role assignment
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Assigned On</label>
                                <p className="text-sm">{new Date(userRole.created_at).toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
