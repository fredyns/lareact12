import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, Mail, Calendar, Clock } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

interface User {
    id: string;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    user: User;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Users',
        href: route('users.index'),
    },
    {
        title: 'User Details',
        href: '#',
    },
];

export default function ShowUser({ user }: Props) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            router.delete(route('users.destroy', user.id));
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User: ${user.name}`} />
            
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
                        <p className="text-muted-foreground">
                            User details and information
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={route('users.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Users
                            </Button>
                        </Link>
                        <Link href={route('users.edit', user.id)}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <span className="text-sm font-medium text-primary">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">Full Name</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium">{user.email}</p>
                                    <p className="text-sm text-muted-foreground">Email Address</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                    <Badge 
                                        variant={user.email_verified_at ? "default" : "secondary"}
                                        className="h-4 w-4 rounded-full p-0"
                                    />
                                </div>
                                <div>
                                    <p className="font-medium">
                                        {user.email_verified_at ? "Verified" : "Unverified"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Email Status</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Account Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Account Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="font-medium">{formatDate(user.created_at)}</p>
                                    <p className="text-sm text-muted-foreground">Account Created</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                                    <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="font-medium">{formatDate(user.updated_at)}</p>
                                    <p className="text-sm text-muted-foreground">Last Updated</p>
                                </div>
                            </div>

                            {user.email_verified_at && (
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                        <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{formatDate(user.email_verified_at)}</p>
                                        <p className="text-sm text-muted-foreground">Email Verified</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>User ID</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md bg-muted p-3">
                            <code className="text-sm font-mono">{user.id}</code>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            This is the unique identifier for this user in the system.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
