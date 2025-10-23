import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SelectEnum } from '@/components/shorty/select-enum';
import { InputSelectUser } from '@/components/select-from-table/input-select-user';
import { ImagePreviewButton } from '@/components/shorty/image-preview-button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Item, PageProps, SelectOption } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Columns,
  Edit,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { dashboard } from '@/routes';
import sample from '@/routes/sample';

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
  selectedColumns: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: dashboard.url(),
  },
  {
    title: 'Sample Items',
    href: sample.items.index.url(),
  },
];

const AVAILABLE_COLUMNS = [
  { value: 'user_id', label: 'User' },
  { value: 'string', label: 'String' },
  { value: 'email', label: 'Email' },
  { value: 'color', label: 'Color' },
  { value: 'integer', label: 'Integer' },
  { value: 'decimal', label: 'Decimal' },
  { value: 'npwp', label: 'NPWP' },
  { value: 'datetime', label: 'Datetime' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'ip_address', label: 'IP Address' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'enumerate', label: 'Status' },
  { value: 'file', label: 'File' },
  { value: 'image', label: 'Image' },
];

export default function ItemsIndex({ items, filters, selectedColumns }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [enumerate, setEnumerate] = useState<{ value: string; label: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState<SelectOption | null>(null);
  const [columns, setColumns] = useState<string[]>(selectedColumns);
  const [tempColumns, setTempColumns] = useState<string[]>(selectedColumns);
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const [isLoadingColumns, setIsLoadingColumns] = useState(false);

  const handleSort = (field: string) => {
    const direction = filters.sort_field === field && filters.sort_direction === 'asc' ? 'desc' : 'asc';
    router.get(
      sample.items.index.url(),
      {
        search,
        user_id: selectedUser?.value,
        enumerate: enumerate?.value,
        columns,
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
    router.get(sample.items.index.url(), { search, user_id: selectedUser?.value, enumerate: enumerate?.value, columns }, { preserveState: true });
  };

  const handleClearSearch = () => {
    setSearch('');
    router.get(sample.items.index.url(), { user_id: selectedUser?.value, enumerate: enumerate?.value, columns }, { preserveState: true });
  };

  const handleEnumerateChange = (selected: { value: string; label: string } | null) => {
    setEnumerate(selected);
    router.get(
      sample.items.index.url(),
      {
        search,
        user_id: selectedUser?.value,
        enumerate: selected?.value || null,
        columns,
      },
      {
        preserveState: true,
        replace: true,
      },
    );
  };

  const handleUserChange = (userId: string) => {
    const user = selectedUser?.value === userId ? selectedUser : null;
    setSelectedUser(user);
    router.get(
      sample.items.index.url(),
      {
        search,
        user_id: userId || null,
        enumerate: enumerate?.value,
        columns,
      },
      {
        preserveState: true,
        replace: true,
      },
    );
  };

  const handleColumnToggle = (column: string) => {
    const newColumns = tempColumns.includes(column)
      ? tempColumns.filter((c) => c !== column)
      : [...tempColumns, column];
    setTempColumns(newColumns);
  };

  const applyColumnSelection = () => {
    setIsLoadingColumns(true);
    setColumns(tempColumns);
    router.get(
      sample.items.index.url(),
      {
        search,
        user_id: selectedUser?.value,
        enumerate: enumerate?.value,
        columns: tempColumns,
      },
      {
        preserveState: true,
        replace: true,
        onFinish: () => {
          setIsLoadingColumns(false);
        },
      },
    );
    setIsColumnSelectorOpen(false);
  };

  const handleCancelColumnSelection = () => {
    setTempColumns(columns);
    setIsColumnSelectorOpen(false);
  };

  const handleDelete = (item: Item) => {
    if (confirm(`Are you sure you want to delete "${item.string}"?`)) {
      router.delete(sample.items.destroy.url(item.id));
    }
  };

  const getSortIcon = (field: string) => {
    if (filters.sort_field !== field) return <ArrowUpDown className="h-4 w-4" />;
    return filters.sort_direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const { locale } = usePage<PageProps>().props;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const Shimmer = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-muted rounded w-20"></div>
    </div>
  );

  const renderCellContent = (item: Item, column: string) => {
    // Show shimmer if loading
    if (isLoadingColumns) {
      return <Shimmer />;
    }

    switch (column) {
      case 'user_id':
        return <div className="text-sm">{item.user?.name || 'N/A'}</div>;
      case 'string':
        return <div className="font-medium">{item.string}</div>;
      case 'email':
        return <div className="text-sm text-muted-foreground">{item.email}</div>;
      case 'color':
        return (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded border" style={{ backgroundColor: item.color || '#000' }} />
            <span className="text-sm">{item.color}</span>
          </div>
        );
      case 'integer':
        return <div className="text-sm">{item.integer}</div>;
      case 'decimal':
        return <div className="text-sm">{item.decimal}</div>;
      case 'npwp':
        return <div className="font-mono text-sm">{item.npwp}</div>;
      case 'datetime':
        return <div className="text-sm">{item.datetime ? formatDate(item.datetime) : 'N/A'}</div>;
      case 'date':
        return <div className="text-sm">{item.date || 'N/A'}</div>;
      case 'time':
        return <div className="text-sm">{item.time || 'N/A'}</div>;
      case 'ip_address':
        return <div className="font-mono text-sm">{item.ip_address}</div>;
      case 'boolean':
        return (
          <Badge variant={item.boolean ? 'default' : 'secondary'}>
            {item.boolean ? 'Yes' : 'No'}
          </Badge>
        );
      case 'enumerate':
        return (
          <Badge variant={item.enumerate === 'enable' ? 'default' : 'secondary'}>
            {item.enumerate ? item.enumerate.charAt(0).toUpperCase() + item.enumerate.slice(1) : 'N/A'}
          </Badge>
        );
      case 'file':
        return item.file ? (
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a href={item.file_url ?? undefined} target="_blank" rel="noopener noreferrer">
              <FileText className="h-4 w-4 mr-2" />
              View File
            </a>
          </Button>
        ) : (
          <span className="text-sm text-muted-foreground">No file</span>
        );
      case 'image':
        return <ImagePreviewButton imageUrl={item.image_url} imageAlt={`Image for ${item.string}`} />;
      default:
        return <div className="text-sm">N/A</div>;
    }
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
          <Link href={sample.items.create.url()}>
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
                <InputSelectUser
                  id="user-filter"
                  label=""
                  onChange={handleUserChange}
                  defaultValue={selectedUser}
                  placeholder="User"
                  allowCreate={false}
                />
              </div>

              <div className="w-full sm:w-64">
                <div className="relative">
                  <Filter className="absolute top-2.5 left-2 z-10 h-4 w-4 text-muted-foreground" />
                  <SelectEnum
                    enumClass="Sample/ItemEnumerate"
                    value={enumerate}
                    onChange={handleEnumerateChange}
                    placeholder="Status"
                    isClearable
                    styles={{
                      control: (base) => ({
                        ...base,
                        paddingLeft: '24px',
                      }),
                    }}
                  />
                </div>
              </div>

              <Popover open={isColumnSelectorOpen} onOpenChange={setIsColumnSelectorOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="default">
                    <Columns className="mr-2 h-4 w-4" />
                    Columns
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div>
                      <h4 className="mb-3 font-medium">Select Columns</h4>
                      <div className="space-y-2">
                        {AVAILABLE_COLUMNS.map((col) => (
                          <div key={col.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={`column-${col.value}`}
                              checked={tempColumns.includes(col.value)}
                              onCheckedChange={() => handleColumnToggle(col.value)}
                            />
                            <Label
                              htmlFor={`column-${col.value}`}
                              className="cursor-pointer text-sm font-normal"
                            >
                              {col.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={handleCancelColumnSelection}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={applyColumnSelection}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 w-16 px-4 text-left align-middle font-medium">#</th>
                      {columns.map((col) => {
                        const columnDef = AVAILABLE_COLUMNS.find((c) => c.value === col);
                        if (!columnDef) return null;
                        return (
                          <th key={col} className="h-12 px-4 text-left align-middle font-medium">
                            <Button
                              variant="ghost"
                              onClick={() => handleSort(col)}
                              className="h-auto p-0 font-medium"
                            >
                              {columnDef.label}
                              {getSortIcon(col)}
                            </Button>
                          </th>
                        );
                      })}
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
                        {columns.map((col) => (
                          <td key={col} className="p-4 align-middle">
                            {renderCellContent(item, col)}
                          </td>
                        ))}
                        <td className="p-4 text-right align-middle">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={sample.items.show.url(item.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={sample.items.edit.url(item.id)}>
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
                        <td colSpan={columns.length + 2} className="p-4 text-center text-muted-foreground">
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
