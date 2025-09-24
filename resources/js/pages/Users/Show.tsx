import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Edit,
    Mail,
    Plus,
    Shield,
    Trash2,
    X,
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Role {
    id: string;
    name: string;
    assigned?: boolean;
}

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
    userRoles: Role[];
    allRoles: Role[];
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

export default function ShowUser({ user, userRoles, allRoles }: Props) {
    // State for role management
    const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
    const [roleToRemove, setRoleToRemove] = useState<Role | null>(null);
    const [roleToAdd, setRoleToAdd] = useState<Role | null>(null);

    // Get unassigned roles for the add role modal
    const unassignedRoles = allRoles.filter(
        (role) => !userRoles.some((ur) => ur.id === role.id),
    );

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

    // Handle role removal
    const handleRemoveRole = () => {
        if (roleToRemove) {
            router.delete(
                route('users.roles.remove', [user.id, roleToRemove.id]),
            );
            setRoleToRemove(null);
        }
    };

    // Handle role addition
    const handleAddRole = () => {
        if (roleToAdd) {
            router.post(route('users.roles.add', user.id), {
                role_id: roleToAdd.id,
            });
            setRoleToAdd(null);
            setIsAddRoleModalOpen(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User: ${user.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {user.name}
                        </h1>
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
                                    <p className="text-sm text-muted-foreground">
                                        Full Name
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium">{user.email}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Email Address
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                    <Badge
                                        variant={
                                            user.email_verified_at
                                                ? 'default'
                                                : 'secondary'
                                        }
                                        className="h-4 w-4 rounded-full p-0"
                                    />
                                </div>
                                <div>
                                    <p className="font-medium">
                                        {user.email_verified_at
                                            ? 'Verified'
                                            : 'Unverified'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Email Status
                                    </p>
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
                                    <p className="font-medium">
                                        {formatDate(user.created_at)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Account Created
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                                    <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="font-medium">
                                        {formatDate(user.updated_at)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Last Updated
                                    </p>
                                </div>
                            </div>

                            {user.email_verified_at && (
                                <div className="flex items-center space-x-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                        <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {formatDate(user.email_verified_at)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Email Verified
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* User ID Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>User ID</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md bg-muted p-3">
                            <code className="font-mono text-sm">{user.id}</code>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                            This is the unique identifier for this user in the
                            system.
                        </p>
                    </CardContent>
                </Card>

                {/* User Roles Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>User Roles</CardTitle>
                        <Button
                            size="sm"
                            onClick={() => setIsAddRoleModalOpen(true)}
                            disabled={unassignedRoles.length === 0}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Role
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {userRoles.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                This user has no roles assigned.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {userRoles.map((role) => (
                                    <div
                                        key={role.id}
                                        className="flex items-center justify-between rounded-md border p-3"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                <Shield className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium">
                                                    {role.name}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setRoleToRemove(role)
                                            }
                                        >
                                            <X className="mr-2 h-4 w-4" />
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add Role Modal */}
            <Dialog
                open={isAddRoleModalOpen}
                onOpenChange={setIsAddRoleModalOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Role to User</DialogTitle>
                        <DialogDescription>
                            Select a role to assign to {user.name}.
                        </DialogDescription>
                    </DialogHeader>

                    {unassignedRoles.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            All available roles are already assigned to this
                            user.
                        </p>
                    ) : (
                        <div className="max-h-[300px] space-y-2 overflow-y-auto">
                            {unassignedRoles.map((role) => (
                                <div
                                    key={role.id}
                                    className={`flex cursor-pointer items-center justify-between rounded-md border p-3 ${
                                        roleToAdd?.id === role.id
                                            ? 'border-primary bg-primary/5'
                                            : ''
                                    }`}
                                    onClick={() => setRoleToAdd(role)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                            <Shield className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {role.name}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsAddRoleModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (roleToAdd) {
                                    if (
                                        confirm(
                                            `Are you sure you want to assign the role "${roleToAdd.name}" to ${user.name}?`,
                                        )
                                    ) {
                                        handleAddRole();
                                    }
                                }
                            }}
                            disabled={!roleToAdd}
                        >
                            Assign Role
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove Role Confirmation Dialog */}
            <AlertDialog
                open={!!roleToRemove}
                onOpenChange={(open) => !open && setRoleToRemove(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Role</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove the role "
                            {roleToRemove?.name}" from {user.name}? This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveRole}>
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
