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

interface Props {
    users: User[];
    roles: Role[];
}

export default function CreateUserRole({ users, roles }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        role_id: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('rbac.user-roles.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Assign Role to User" />
            
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href={route('rbac.user-roles.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to User Roles
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Assign Role to User</h1>
                        <p className="text-muted-foreground">
                            Select a user and role to create a new assignment
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Role Assignment</CardTitle>
                            <CardDescription>
                                Choose the user and role for this assignment.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="user_id">User</Label>
                                <Select value={data.user_id} onValueChange={(value) => setData('user_id', value)}>
                                    <SelectTrigger className={errors.user_id ? 'border-destructive' : ''}>
                                        <SelectValue placeholder="Select a user" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id}>
                                                {user.name} ({user.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.user_id && (
                                    <p className="text-sm text-destructive">{errors.user_id}</p>
                                )}
                            </div>

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
                            {processing ? 'Assigning...' : 'Assign Role'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
