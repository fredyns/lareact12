import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Search,
    Plus,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    X
} from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

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

interface RolePermission {
    id: string;
    role: Role;
    permission: Permission;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedRolePermissions {
    data: RolePermission[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface Props {
    rolePermissions: PaginatedRolePermissions;
    filters: {
        search?: string;
        sort?: string;
        direction?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
    },
    {
        title: 'Role Permissions',
        href: route('rbac.role-permissions.index'),
    },
];

export default function RolePermissionsIndex({ rolePermissions, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('rbac.role-permissions.index'), { search }, { preserveState: true });
    };

    const handleClearSearch = () => {
        setSearch('');
        router.get(route('rbac.role-permissions.index'), {}, { preserveState: true });
    };

    const handleSort = (field: string) => {
        const direction = filters.sort === field && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get(route('rbac.role-permissions.index'), {
            ...filters,
            sort: field,
            direction,
        }, { preserveState: true });
    };

    const handleDelete = (rolePermission: RolePermission) => {
        if (confirm(`Are you sure you want to remove permission "${rolePermission.permission.name}" from role "${rolePermission.role.name}"?`)) {
            router.delete(route('rbac.role-permissions.destroy', rolePermission.id));
        }
    };

    const getSortIcon = (field: string) => {
        if (filters.sort !== field) return <ArrowUpDown className="h-4 w-4" />;
        return filters.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Role Permissions" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Role Permissions</h1>
                        <p className="text-muted-foreground">
                            Manage permission assignments for roles
                        </p>
                    </div>
                    <Link href={route('rbac.role-permissions.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Assign Permission
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Role Permission Management</CardTitle>
                        <div className="flex items-center space-x-2">
                            <form onSubmit={handleSearch} className="flex items-center space-x-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search roles or permissions..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-8 pr-8"
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={handleClearSearch}
                                            className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <Button type="submit" variant="outline">
                                    Search
                                </Button>
                            </form>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="h-12 px-4 text-left align-middle font-medium w-16">
                                                #
                                            </th>
                                            <th className="h-12 px-4 text-left align-middle font-medium">
                                                Role
                                            </th>
                                            <th className="h-12 px-4 text-left align-middle font-medium">
                                                Role Guard
                                            </th>
                                            <th className="h-12 px-4 text-left align-middle font-medium">
                                                Permission
                                            </th>
                                            <th className="h-12 px-4 text-left align-middle font-medium">
                                                Permission Guard
                                            </th>
                                            <th className="h-12 px-4 text-left align-middle font-medium hidden sm:table-cell">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleSort('created_at')}
                                                    className="h-auto p-0 font-medium"
                                                >
                                                    Assigned
                                                    {getSortIcon('created_at')}
                                                </Button>
                                            </th>
                                            <th className="h-12 px-4 text-right align-middle font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rolePermissions.data.length === 0 ? (
                                            <tr className="border-b">
                                                <td colSpan={7} className="p-4 text-center">
                                                    <div className="text-muted-foreground">
                                                        No role permission assignments found.
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            rolePermissions.data.map((rolePermission, index) => (
                                                <tr key={rolePermission.id} className="border-b">
                                                    <td className="p-4 align-middle">
                                                        <div className="text-sm text-muted-foreground font-mono">
                                                            {((rolePermissions.current_page - 1) * rolePermissions.per_page) + index + 1}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <Badge variant="secondary">
                                                            {rolePermission.role.name}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <Badge variant="outline">
                                                            {rolePermission.role.guard_name}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <Badge variant="secondary">
                                                            {rolePermission.permission.name}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <Badge variant="outline">
                                                            {rolePermission.permission.guard_name}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 align-middle hidden sm:table-cell">
                                                        <div className="text-sm text-muted-foreground">
                                                            {formatDate(rolePermission.created_at)}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={route('rbac.role-permissions.show', rolePermission.id)}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={route('rbac.role-permissions.edit', rolePermission.role.id)}>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(rolePermission)}
                                                                    className="text-destructive"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {rolePermissions.last_page > 1 && (
                            <div className="flex items-center justify-between space-x-2 py-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((rolePermissions.current_page - 1) * rolePermissions.per_page) + 1} to{' '}
                                    {Math.min(rolePermissions.current_page * rolePermissions.per_page, rolePermissions.total)} of{' '}
                                    {rolePermissions.total} results
                                </div>
                                <div className="flex items-center space-x-2">
                                    {rolePermissions.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
