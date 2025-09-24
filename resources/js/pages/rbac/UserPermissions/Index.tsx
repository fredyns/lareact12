import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Plus, Search, Trash2, ArrowUpDown } from 'lucide-react';
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

interface PaginatedUserPermissions {
    data: UserPermission[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    userPermissions: PaginatedUserPermissions;
    filters: {
        search?: string;
        sort?: string;
        direction?: string;
    };
}

export default function UserPermissionsIndex({ userPermissions, filters }: Props) {
    const [search, setSearch] = React.useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('rbac.user-permissions.index'), { search }, { preserveState: true });
    };

    const handleSort = (field: string) => {
        const direction = filters.sort === field && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get(route('rbac.user-permissions.index'), {
            ...filters,
            sort: field,
            direction,
        }, { preserveState: true });
    };

    const handleDelete = (userPermission: UserPermission) => {
        if (confirm(`Are you sure you want to remove permission "${userPermission.permission.name}" from user "${userPermission.user.name}"?`)) {
            router.delete(route('rbac.user-permissions.destroy', userPermission.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="User Permissions" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Permissions</h1>
                        <p className="text-muted-foreground">
                            Manage direct permission assignments for users
                        </p>
                    </div>
                    <Link href={route('rbac.user-permissions.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Assign Permission
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>User Permission Assignments</CardTitle>
                        <CardDescription>
                            A list of all direct permission assignments for users in the system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2 mb-4">
                            <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search users or permissions..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                                <Button type="submit" variant="outline">
                                    Search
                                </Button>
                            </form>
                        </div>

                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Permission</TableHead>
                                        <TableHead>Guard</TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort('created_at')}
                                                className="h-auto p-0 font-semibold"
                                            >
                                                Assigned
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {userPermissions.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">
                                                <div className="text-muted-foreground">
                                                    No user permission assignments found.
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        userPermissions.data.map((userPermission) => (
                                            <TableRow key={userPermission.id}>
                                                <TableCell className="font-medium">
                                                    {userPermission.user.name}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {userPermission.user.email}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">
                                                        {userPermission.permission.name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {userPermission.permission.guard_name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(userPermission.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Link href={route('rbac.user-permissions.show', userPermission.id)}>
                                                            <Button variant="outline" size="sm">
                                                                View
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(userPermission)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {userPermissions.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((userPermissions.current_page - 1) * userPermissions.per_page) + 1} to{' '}
                                    {Math.min(userPermissions.current_page * userPermissions.per_page, userPermissions.total)} of{' '}
                                    {userPermissions.total} results
                                </div>
                                <div className="flex items-center space-x-2">
                                    {userPermissions.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.get(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
