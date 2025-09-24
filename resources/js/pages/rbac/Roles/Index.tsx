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

interface Role {
    id: string;
    name: string;
    guard_name: string;
    permissions_count: number;
    created_at: string;
    updated_at: string;
}

interface PaginatedRoles {
    data: Role[];
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
    roles: PaginatedRoles;
    filters: {
        search?: string;
        sort?: string;
        direction?: string;
    };
}

export default function RolesIndex({ roles, filters }: Props) {
    const [search, setSearch] = React.useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('rbac.roles.index'), { search }, { preserveState: true });
    };

    const handleSort = (field: string) => {
        const direction = filters.sort === field && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get(route('rbac.roles.index'), {
            ...filters,
            sort: field,
            direction,
        }, { preserveState: true });
    };

    const handleDelete = (role: Role) => {
        if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
            router.delete(route('rbac.roles.destroy', role.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Roles" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
                        <p className="text-muted-foreground">
                            Manage system roles and their permissions
                        </p>
                    </div>
                    <Link href={route('rbac.roles.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Role
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Roles</CardTitle>
                        <CardDescription>
                            A list of all roles in the system with their permission counts.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2 mb-4">
                            <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search roles..."
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
                                        <TableHead>Permissions</TableHead>
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
                                    {roles.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8">
                                                <div className="text-muted-foreground">
                                                    No roles found.
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        roles.data.map((role) => (
                                            <TableRow key={role.id}>
                                                <TableCell className="font-medium">
                                                    {role.name}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {role.guard_name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">
                                                        {role.permissions_count} permissions
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(role.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Link href={route('rbac.roles.show', role.id)}>
                                                            <Button variant="outline" size="sm">
                                                                View
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('rbac.roles.edit', role.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(role)}
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
                        {roles.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((roles.current_page - 1) * roles.per_page) + 1} to{' '}
                                    {Math.min(roles.current_page * roles.per_page, roles.total)} of{' '}
                                    {roles.total} results
                                </div>
                                <div className="flex items-center space-x-2">
                                    {roles.links.map((link, index) => (
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
