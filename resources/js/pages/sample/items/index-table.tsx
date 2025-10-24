import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ImagePreviewButton } from '@/components/shorty/image-preview-button';
import { Item, PageProps } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit,
  Eye,
  FileText,
  MoreHorizontal,
  Trash2,
} from 'lucide-react';
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
  columns: string[];
  availableColumns: Array<{ value: string; label: string; sortable: boolean }>;
  filters: {
    search: string;
    user_id: string | null;
    enumerate: string | null;
    sort_field: string;
    sort_direction: string;
  };
  isLoadingColumns: boolean;
  newlyAddedColumns: string[];
  onSort: (field: string) => void;
  onDelete: (item: Item) => void;
  viewMode?: string;
}

export function ItemsTable({
  items,
  columns,
  availableColumns,
  filters,
  isLoadingColumns,
  newlyAddedColumns,
  onSort,
  onDelete,
  viewMode,
}: Props) {
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

  const getSortIcon = (field: string) => {
    if (filters.sort_field !== field) return <ArrowUpDown className="h-4 w-4" />;
    return filters.sort_direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const renderCellContent = (item: Item, column: string) => {
    // Show shimmer only for newly added columns
    if (isLoadingColumns && newlyAddedColumns.includes(column)) {
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
        if (!item.enumerate) {
          return (
            <Badge variant="outline" className="text-muted-foreground">
              N/A
            </Badge>
          );
        }
        return (
          <Badge variant={item.enumerate === 'enable' ? 'default' : 'secondary'}>
            {item.enumerate.charAt(0).toUpperCase() + item.enumerate.slice(1)}
          </Badge>
        );
      case 'file':
        return item.file ? (
          <Button variant="outline" size="sm" asChild>
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
    <>
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 w-16 px-4 text-left align-middle font-medium">#</th>
                {columns.map((col) => {
                  const columnDef = availableColumns.find((c) => c.value === col);
                  if (!columnDef) return null;
                  return (
                    <th key={col} className="h-12 px-4 text-left align-middle font-medium">
                      {columnDef.sortable ? (
                        <Button
                          variant="ghost"
                          onClick={() => onSort(col)}
                          className="h-auto p-0 font-medium"
                        >
                          {columnDef.label}
                          {getSortIcon(col)}
                        </Button>
                      ) : (
                        <span className="font-medium">{columnDef.label}</span>
                      )}
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
                        <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive">
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
                  onClick={() => {
                    if (link.url) {
                      const url = new URL(link.url, window.location.origin);
                      if (viewMode) {
                        url.searchParams.set('view_mode', viewMode);
                      }
                      router.get(url.pathname + url.search);
                    }
                  }}
                  disabled={!link.url}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
          </div>
        </div>
      )}
    </>
  );
}
