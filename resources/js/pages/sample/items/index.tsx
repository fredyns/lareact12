import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Item } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import Select from 'react-select';
import { route } from 'ziggy-js';

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface ItemsData {
  data: Item[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: PaginationLink[];
}

interface Props {
  items: ItemsData;
  filters: {
    search: string;
    user_id: string | null;
    enumerate: string | null;
    sort_field: string;
    sort_direction: string;
  };
  enumerateOptions: { value: string; label: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('dashboard'),
  },
  {
    title: 'Sample Items',
    href: route('sample.items.index'),
  },
];

export default function ItemsIndex({ items, filters, enumerateOptions }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [enumerate, setEnumerate] = useState(
    filters.enumerate ? enumerateOptions.find((option) => option.value === filters.enumerate) : null,
  );

  const handleSort = (field: string) => {
    const direction = filters.sort_field === field && filters.sort_direction === 'asc' ? 'desc' : 'asc';
    router.get(
      route('sample.items.index'),
      {
        search,
        enumerate: enumerate?.value,
        sort_field: field,
        sort_direction: direction,
      },
      {
        preserveState: true,
        replace: true,
      },
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('sample.items.index'), { search, enumerate: enumerate?.value }, { preserveState: true });
  };

  const handleClearSearch = () => {
    setSearch('');
    router.get(route('sample.items.index'), { enumerate: enumerate?.value }, { preserveState: true });
  };

  const handleEnumerateChange = (selected: { value: string; label: string } | null) => {
    setEnumerate(selected);
    router.get(
      route('sample.items.index'),
      {
        search,
        enumerate: selected?.value || null,
      },
      {
        preserveState: true,
        replace: true,
      },
    );
  };

  const handleDelete = (item: Item) => {
    if (confirm(`Are you sure you want to delete "${item.string}"?`)) {
      router.delete(route('sample.items.destroy', item.id));
    }
  };

  const getSortIcon = (field: string) => {
    if (filters.sort_field !== field) return <ArrowUpDown className="h-4 w-4" />;
    return filters.sort_direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
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
      <Head title="Sample Items" />

      {/*set page width*/}
      <div className="mx-auto flex h-full flex-1 flex-col gap-4 p-4 lg:w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sample Items</h1>
            <p className="text-muted-foreground">Manage sample items and their properties</p>
          </div>
          <Link href={route('sample.items.create')}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Item Management</CardTitle>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <form onSubmit={handleSearch} className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pr-8 pl-8"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute top-2.5 right-2 h-4 w-4 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button type="submit" variant="outline">
                  Search
                </Button>
              </form>

              <div className="w-full sm:w-64">
                <div className="relative">
                  <Filter className="absolute top-2.5 left-2 z-10 h-4 w-4 text-muted-foreground" />
                  <Select
                    isClearable
                    placeholder="Filter by status"
                    value={enumerate}
                    onChange={handleEnumerateChange}
                    options={enumerateOptions}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        paddingLeft: '24px',
                      }),
                    }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 w-16 px-4 text-left align-middle font-medium">#</th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <Button variant="ghost" onClick={() => handleSort('string')} className="h-auto p-0 font-medium">
                          String
                          {getSortIcon('string')}
                        </Button>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium hidden sm:table-cell">
                        <Button variant="ghost" onClick={() => handleSort('email')} className="h-auto p-0 font-medium">
                          Email
                          {getSortIcon('email')}
                        </Button>
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('enumerate')}
                          className="h-auto p-0 font-medium"
                        >
                          Status
                          {getSortIcon('enumerate')}
                        </Button>
                      </th>
                      <th className="hidden h-12 px-4 text-left align-middle font-medium sm:table-cell">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort('created_at')}
                          className="h-auto p-0 font-medium"
                        >
                          Created
                          {getSortIcon('created_at')}
                        </Button>
                      </th>
                      <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.data.map((item, index) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-4 align-middle">
                          <div className="font-mono text-sm text-muted-foreground">
                            {(items.current_page - 1) * items.per_page + index + 1}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="font-medium">{item.string}</div>
                          <div className="text-sm text-muted-foreground sm:hidden">{item.email}</div>
                        </td>
                        <td className="p-4 align-middle hidden sm:table-cell">
                          <div className="text-sm text-muted-foreground">{item.email}</div>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge variant={item.enumerate === 'enable' ? 'default' : 'secondary'}>
                            {item.enumerate ? item.enumerate.charAt(0).toUpperCase() + item.enumerate.slice(1) : 'N/A'}
                          </Badge>
                        </td>
                        <td className="hidden p-4 align-middle sm:table-cell">
                          <div className="text-sm text-muted-foreground">{formatDate(item.created_at)}</div>
                        </td>
                        <td className="p-4 text-right align-middle">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={route('sample.items.show', item.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={route('sample.items.edit', item.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(item)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                    {items.data.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-muted-foreground">
                          No items found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {items.last_page > 1 && (
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(items.current_page - 1) * items.per_page + 1} to{' '}
                  {Math.min(items.current_page * items.per_page, items.total)} of {items.total} results
                </div>
                <div className="flex items-center space-x-2">
                  {items.links &&
                    items.links.map((link, index) => (
                      <Button
                        key={index}
                        variant={link.active ? 'default' : 'outline'}
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
