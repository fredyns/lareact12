import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { dashboard } from '@/routes';
import rbac from '@/routes/rbac';
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
    permissions_count: number;
    created_at: string;
    updated_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedRoles {
    data: Role[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
}

interface Props {
    roles: PaginatedRoles;
    filters: {
        search?: string;
        sort?: string;
        direction?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard.url(),
    },
    {
        title: 'Roles',
        href: rbac.roles.index.url(),
    },
];

export default function RolesIndex({ roles, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(rbac.roles.index.url(), { search }, { preserveState: true });
    };

    const handleClearSearch = () => {
        setSearch('');
        router.get(rbac.roles.index.url(), {}, { preserveState: true });
    };

    const handleSort = (field: string) => {
        const direction = filters.sort === field && filters.direction === 'asc' ? 'desc' : 'asc';
        router.get(rbac.roles.index.url(), {
            ...filters,
            sort: field,
            direction,
        }, { preserveState: true });
    };

    const handleDelete = (role: Role) => {
        if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
            router.delete(rbac.roles.destroy.url(role.id));
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
            <Head title="Roles" />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
                        <p className="text-muted-foreground">
                            Manage system roles and their permissions
                        </p>
                    </div>
                    <Link href={rbac.roles.create.url()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Role
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Role Management</CardTitle>
                        <div className="flex items-center space-x-2">
                            <form onSubmit={handleSearch} className="flex items-center space-x-2">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search roles..."
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
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleSort('name')}
                                                    className="h-auto p-0 font-medium"
                                                >
                                                    Name
                                                    {getSortIcon('name')}
                                                </Button>
                                            </th>
                                            <th className="h-12 px-4 text-left align-middle font-medium">
                                                Guard
                                            </th>
                                            <th className="h-12 px-4 text-left align-middle font-medium">
                                                Permissions
                                            </th>
                                            <th className="h-12 px-4 text-left align-middle font-medium hidden sm:table-cell">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => handleSort('created_at')}
                                                    className="h-auto p-0 font-medium"
                                                >
                                                    Created
                                                    {getSortIcon('created_at')}
                                                </Button>
                                            </th>
                                            <th className="h-12 px-4 text-right align-middle font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roles.data.length === 0 ? (
                                            <tr className="border-b">
                                                <td colSpan={6} className="p-4 text-center">
                                                    <div className="text-muted-foreground">
                                                        No roles found.
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            roles.data.map((role, index) => (
                                                <tr key={role.id} className="border-b">
                                                    <td className="p-4 align-middle">
                                                        <div className="text-sm text-muted-foreground font-mono">
                                                            {((roles.current_page - 1) * roles.per_page) + index + 1}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <div className="font-medium">{role.name}</div>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <Badge variant="outline">
                                                            {role.guard_name}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 align-middle">
                                                        <Badge variant="secondary">
                                                            {role.permissions_count} permissions
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 align-middle hidden sm:table-cell">
                                                        <div className="text-sm text-muted-foreground">
                                                            {formatDate(role.created_at)}
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
                                                                    <Link href={rbac.roles.show.url(role.id)}>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem asChild>
                                                                    <Link href={rbac.roles.edit.url(role.id)}>
                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </Link>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(role)}
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
                        {roles.last_page > 1 && (
                            <div className="flex items-center justify-between space-x-2 py-4">
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
