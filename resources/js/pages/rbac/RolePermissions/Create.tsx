import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
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

interface Props {
    roles: Role[];
    permissions: Permission[];
}

export default function CreateRolePermission({ roles, permissions }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        role_id: '',
        permission_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('rbac.role-permissions.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Assign Permission to Role" />
            
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href={route('rbac.role-permissions.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Role Permissions
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Assign Permission to Role</h1>
                        <p className="text-muted-foreground">
                            Select a role and permission to create a new assignment
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Permission Assignment</CardTitle>
                            <CardDescription>
                                Choose the role and permission for this assignment.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="role_id">Role</Label>
                                <Select value={data.role_id} onValueChange={(value) => setData('role_id', value)}>
                                    <SelectTrigger className={errors.role_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id}>
                                                {role.name} ({role.guard_name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.role_id && (
                                    <p className="text-sm text-destructive">{errors.role_id}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="permission_id">Permission</Label>
                                <Select value={data.permission_id} onValueChange={(value) => setData('permission_id', value)}>
                                    <SelectTrigger className={errors.permission_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select a permission" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {permissions.map((permission) => (
                                            <SelectItem key={permission.id} value={permission.id}>
                                                {permission.name} ({permission.guard_name})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.permission_id && (
                                    <p className="text-sm text-destructive">{errors.permission_id}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end space-x-4">
                        <Link href={route('rbac.role-permissions.index')}>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Assigning...' : 'Assign Permission'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
