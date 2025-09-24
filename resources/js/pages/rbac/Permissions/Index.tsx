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
import { Plus, Search, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import AuthenticatedLayout from '@/layouts/app-layout';

interface Permission {
    id: string;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
}

interface PaginatedPermissions {
    data: Permission[];
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
    permissions: PaginatedPermissions;
    filters: {
        search?: string;
        sort?: string;
        direction?: string;
    };
}

export default function PermissionsIndex({ permissions, filters }: Props) {
    const [search, setSearch] = React.useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('rbac.permissions.index'), { search }, { preserveState: true });
    };

    const handleSort = (field: string) => {
        const direction = filters.sort === field && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get(route('rbac.permissions.index'), {
            ...filters,
            sort: field,
            direction,
        }, { preserveState: true });
    };

    const handleDelete = (permission: Permission) => {
        if (confirm(`Are you sure you want to delete the permission "${permission.name}"?`)) {
            router.delete(route('rbac.permissions.destroy', permission.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Permissions" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
                        <p className="text-muted-foreground">
                            Manage system permissions and access controls
                        </p>
                    </div>
                    <Link href={route('rbac.permissions.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Permission
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Permissions</CardTitle>
                        <CardDescription>
                            A list of all permissions in the system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2 mb-4">
                            <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search permissions..."
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
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort('name')}
                                                className="h-auto p-0 font-semibold"
                                            >
                                                Name
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead>Guard</TableHead>
                                        <TableHead>
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleSort('created_at')}
                                                className="h-auto p-0 font-semibold"
                                            >
                                                Created
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {permissions.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8">
                                                <div className="text-muted-foreground">
                                                    No permissions found.
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        permissions.data.map((permission) => (
                                            <TableRow key={permission.id}>
                                                <TableCell className="font-medium">
                                                    {permission.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {permission.guard_name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(permission.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Link href={route('rbac.permissions.show', permission.id)}>
                                                            <Button variant="outline" size="sm">
                                                                View
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('rbac.permissions.edit', permission.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(permission)}
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
                        {permissions.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((permissions.current_page - 1) * permissions.per_page) + 1} to{' '}
                                    {Math.min(permissions.current_page * permissions.per_page, permissions.total)} of{' '}
                                    {permissions.total} results
                                </div>
                                <div className="flex items-center space-x-2">
                                    {permissions.links.map((link, index) => (
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
