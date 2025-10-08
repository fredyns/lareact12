import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { dashboard } from '@/routes';
import users from '@/routes/users';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface User {
    id: string;
    name: string;
    email: string;
    email_verified_at: string | null;
}

interface FormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

interface Props {
    user: User;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard.url(),
    },
    {
        title: 'Users',
        href: users.index.url(),
    },
    {
        title: 'Edit User',
        href: '#',
    },
];

export default function EditUser({ user }: Props) {
    const { data, setData, put, processing, errors } = useForm<FormData>({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(users.update.url(user.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit User: ${user.name}`} />
            
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit User</h1>
                        <p className="text-muted-foreground">
                            Update user information and settings
                        </p>
                    </div>
                    <Link href={users.index.url()}>
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Users
                        </Button>
                    </Link>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter user's full name"
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Enter user's email address"
                                    className={errors.email ? 'border-destructive' : ''}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-4 rounded-lg border p-4">
                                <div className="space-y-2">
                                    <Label className="text-base font-medium">Change Password</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Leave blank to keep the current password
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">New Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter new password (optional)"
                                        className={errors.password ? 'border-destructive' : ''}
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-destructive">{errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm New Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Confirm new password"
                                        className={errors.password_confirmation ? 'border-destructive' : ''}
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-destructive">{errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-end space-x-2 pt-4">
                                <Link href={users.index.url()}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Updating...' : 'Update User'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
