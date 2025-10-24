import { InputSelectUser } from '@/components/select-from-table/input-select-user';
import { SelectEnum } from '@/components/shorty/select-enum';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import sample from '@/routes/sample';
import { type BreadcrumbItem, Item, SelectOption } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Columns, Filter, LayoutGrid, Plus, Search, Table, X } from 'lucide-react';
import { useState } from 'react';
import { ItemsCards } from './index-cards';
import { ItemsTable } from './index-table';

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

type ViewMode = 'table' | 'cards';

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
  viewMode?: ViewMode;
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
  { value: 'user_id', label: 'User', sortable: true },
  { value: 'string', label: 'String', sortable: true },
  { value: 'email', label: 'Email', sortable: true },
  { value: 'color', label: 'Color', sortable: true },
  { value: 'integer', label: 'Integer', sortable: true },
  { value: 'decimal', label: 'Decimal', sortable: true },
  { value: 'npwp', label: 'NPWP', sortable: true },
  { value: 'datetime', label: 'Datetime', sortable: true },
  { value: 'date', label: 'Date', sortable: true },
  { value: 'time', label: 'Time', sortable: true },
  { value: 'ip_address', label: 'IP Address', sortable: true },
  { value: 'boolean', label: 'Boolean', sortable: true },
  { value: 'enumerate', label: 'Status', sortable: true },
  { value: 'file', label: 'File', sortable: false },
  { value: 'image', label: 'Image', sortable: false },
];

export default function ItemsIndex({ items, filters, selectedColumns, viewMode: initialViewMode }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [enumerate, setEnumerate] = useState<{ value: string; label: string } | null>(null);
  const [selectedUser, setSelectedUser] = useState<SelectOption | null>(null);
  const [columns, setColumns] = useState<string[]>(selectedColumns);
  const [tempColumns, setTempColumns] = useState<string[]>(selectedColumns);
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState(false);
  const [isLoadingColumns, setIsLoadingColumns] = useState(false);
  const [newlyAddedColumns, setNewlyAddedColumns] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode || 'table');

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
        view_mode: viewMode,
      },
      {
        preserveState: true,
        replace: true,
      },
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(
      sample.items.index.url(),
      { search, user_id: selectedUser?.value, enumerate: enumerate?.value, columns, view_mode: viewMode },
      { preserveState: true },
    );
  };

  const handleClearSearch = () => {
    setSearch('');
    router.get(
      sample.items.index.url(),
      { user_id: selectedUser?.value, enumerate: enumerate?.value, columns, view_mode: viewMode },
      { preserveState: true },
    );
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
        view_mode: viewMode,
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
        view_mode: viewMode,
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
    // Identify newly added columns (in tempColumns but not in current columns)
    const newColumns = tempColumns.filter((col) => !columns.includes(col));

    // If only removing columns (no new columns added), just update state without server request
    if (newColumns.length === 0) {
      setColumns(tempColumns);
      setIsColumnSelectorOpen(false);
      return;
    }

    // If there are new columns, fetch data from server
    setNewlyAddedColumns(newColumns);
    setIsLoadingColumns(true);
    setColumns(tempColumns);
    router.get(
      sample.items.index.url(),
      {
        search,
        user_id: selectedUser?.value,
        enumerate: enumerate?.value,
        columns: tempColumns,
        view_mode: viewMode,
      },
      {
        preserveState: true,
        replace: true,
        onFinish: () => {
          setIsLoadingColumns(false);
          setNewlyAddedColumns([]);
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
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-1 flex-wrap items-center gap-4">
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
              </div>

              <div className="flex items-center gap-2">
                  {/* Column Selector - Only show in table view */}
                  {viewMode === 'table' && (
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
                                                  <Label htmlFor={`column-${col.value}`} className="cursor-pointer text-sm font-normal">
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
                  )}
                  
                {/* View Mode Toggle */}
                <div className="flex items-center rounded-lg border bg-background p-1">
                  <Button
                    variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="h-8 px-3"
                  >
                    <Table className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="h-8 px-3"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === 'table' ? (
              <ItemsTable
                items={items}
                columns={columns}
                availableColumns={AVAILABLE_COLUMNS}
                filters={filters}
                isLoadingColumns={isLoadingColumns}
                newlyAddedColumns={newlyAddedColumns}
                onSort={handleSort}
                onDelete={handleDelete}
                viewMode={viewMode}
              />
            ) : (
              <ItemsCards items={items} onDelete={handleDelete} viewMode={viewMode} />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
