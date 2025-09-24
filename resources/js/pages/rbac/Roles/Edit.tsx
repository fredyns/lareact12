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

interface Permission {
    id: string;
    name: string;
    guard_name: string;
}

interface Role {
    id: string;
    name: string;
    guard_name: string;
    permissions: Permission[];
}

interface Props {
    role: Role;
    permissions: Permission[];
}

export default function EditRole({ role, permissions }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        guard_name: role.guard_name,
        permissions: role.permissions.map(p => p.id),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('rbac.roles.update', role.id));
    };

    const handlePermissionChange = (permissionId: string, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permissionId]);
        } else {
            setData('permissions', data.permissions.filter(id => id !== permissionId));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Role: ${role.name}`} />
            
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href={route('rbac.roles.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Roles
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
                        <p className="text-muted-foreground">
                            Update role details and permissions
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Details</CardTitle>
                            <CardDescription>
                                Update the basic information for this role.
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
                                    placeholder="Enter role name"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
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
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Permissions</CardTitle>
                            <CardDescription>
                                Select the permissions to assign to this role.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {permissions.length === 0 ? (
                                <p className="text-muted-foreground">No permissions available.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {permissions.map((permission) => (
                                        <div key={permission.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`permission-${permission.id}`}
                                                checked={data.permissions.includes(permission.id)}
                                                onCheckedChange={(checked) => 
                                                    handlePermissionChange(permission.id, checked as boolean)
                                                }
                                            />
                                            <Label 
                                                htmlFor={`permission-${permission.id}`}
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                {permission.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {errors.permissions && (
                                <p className="text-sm text-destructive mt-2">{errors.permissions}</p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end space-x-4">
                        <Link href={route('rbac.roles.index')}>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Updating...' : 'Update Role'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
