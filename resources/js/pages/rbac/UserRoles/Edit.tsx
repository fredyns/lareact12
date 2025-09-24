import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import AuthenticatedLayout from '@/layouts/app-layout';

interface User {
    id: string;
    name: string;
    email: string;
    roles: Role[];
}

interface Role {
    id: string;
    name: string;
    guard_name: string;
}

interface Props {
    user: User;
    roles: Role[];
}

export default function EditUserRoles({ user, roles }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        roles: user.roles.map(r => r.id),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('rbac.user-roles.update', user.id));
    };

    const handleRoleChange = (roleId: string, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleId]);
        } else {
            setData('roles', data.roles.filter(id => id !== roleId));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Roles: ${user.name}`} />
            
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href={route('rbac.user-roles.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to User Roles
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit User Roles</h1>
                        <p className="text-muted-foreground">
                            Update roles for {user.name}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Details</CardTitle>
                            <CardDescription>
                                User information (read-only)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={user.name}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        value={user.email}
                                        disabled
                                        className="bg-muted"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Roles</CardTitle>
                            <CardDescription>
                                Select the roles to assign to this user.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {errors.roles && (
                                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                    <p className="text-sm text-destructive">{errors.roles}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {roles.map((role) => (
                                    <div key={role.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`role-${role.id}`}
                                            checked={data.roles.includes(role.id)}
                                            onCheckedChange={(checked) => 
                                                handleRoleChange(role.id, checked as boolean)
                                            }
                                        />
                                        <Label 
                                            htmlFor={`role-${role.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            <div>
                                                <div className="font-medium">{role.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Guard: {role.guard_name}
                                                </div>
                                            </div>
                                        </Label>
                                    </div>
                                ))}
                            </div>
                            {roles.length === 0 && (
                                <p className="text-muted-foreground text-center py-8">
                                    No roles available.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end space-x-4">
                        <Link href={route('rbac.user-roles.index')}>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Updating...' : 'Update Roles'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
