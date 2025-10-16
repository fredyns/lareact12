import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import subItemsRoutes from '@/routes/sample/sub-items';
import { SelectOption, SubItem } from '@/types';
import { Link } from '@inertiajs/react';

import { Edit, Eye, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SubItemCreateModal } from './create-modal';
import { SubItemEditModal } from './edit-modal';
import { SubItemShowModal } from './show-modal';

interface SubItemsSectionProps {
  itemId: string;
  enumerateOptions?: SelectOption[];
}

export function IndexSection({ itemId, enumerateOptions: enumerateOptionsProp }: SubItemsSectionProps) {
  const [subItems, setSubItems] = useState<SubItem[]>([]);
  const [visibleRows, setVisibleRows] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [enumerateOptions, setEnumerateOptions] = useState<SelectOption[]>([]);
  const [enumLoading, setEnumLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedSubItem, setSelectedSubItem] = useState<SubItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [fromItem, setFromItem] = useState(0);
  const [toItem, setToItem] = useState(0);
  const pageSize = 10;

  // Fetch enumerate options from API
  useEffect(() => {
    const fetchEnumerateOptions = async () => {
      if (enumerateOptionsProp) {
        setEnumerateOptions(enumerateOptionsProp);
        setEnumLoading(false);
        return;
      }

      try {
        const response = await fetch('/enums/ItemEnumerate', {
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'same-origin',
        });

        if (response.ok) {
          const result = await response.json();
          setEnumerateOptions(result.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch enumerate options:', error);
      } finally {
        setEnumLoading(false);
      }
    };

    fetchEnumerateOptions();
  }, [enumerateOptionsProp]);

  // Fetch sub-items asynchronously
  useEffect(() => {
    fetchSubItems();
  }, [itemId, currentPage]);

  // Staggered row reveal animation
  useEffect(() => {
    if (!loading && subItems.length > 0) {
      // Reset visible rows
      setVisibleRows(new Set());

      const timers: NodeJS.Timeout[] = [];

      subItems.forEach((_, index) => {
        const timer = setTimeout(() => {
          setVisibleRows((prev) => new Set([...prev, index]));
        }, index * 100); // 150ms delay between each row

        timers.push(timer);
      });

      return () => {
        timers.forEach((timer) => clearTimeout(timer));
      };
    }
  }, [loading, subItems]);

  const fetchSubItems = async () => {
    setLoading(true);
    try {
      const url = new URL(`/sample/items/${itemId}/sub-items`, window.location.origin);
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('per_page', pageSize.toString());

      const response = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
      });

      if (response.ok) {
        const result = await response.json();
        setSubItems(result.data || []);

        // Set pagination metadata from backend
        if (result.meta) {
          setTotalPages(result.meta.last_page);
          setTotalItems(result.meta.total);
          setFromItem(result.meta.from || 0);
          setToItem(result.meta.to || 0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sub-items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (subItem: SubItem) => {
    setSelectedSubItem(subItem);
    setViewModalOpen(true);
  };

  const handleEdit = (subItem: SubItem) => {
    setSelectedSubItem(subItem);
    setEditModalOpen(true);
  };

  const handleDelete = async (subItem: SubItem) => {
    if (confirm(`Are you sure you want to delete "${subItem.string}"?`)) {
      try {
        const response = await fetch(`/sample/items/${itemId}/sub-items/${subItem.id}`, {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          },
          credentials: 'same-origin',
        });

        if (response.ok) {
          // Refresh the table after successful delete
          fetchSubItems();
        } else {
          console.error('Failed to delete sub-item:', response.status, response.statusText);
          alert('Failed to delete sub-item. Please try again.');
        }
      } catch (error) {
        console.error('Failed to delete sub-item:', error);
        alert('Failed to delete sub-item. Please try again.');
      }
    }
  };

  const handleCreateSuccess = () => {
    // Reset to page 1 and refresh the table after successful create
    if (currentPage === 1) {
      // If already on page 1, manually refresh
      fetchSubItems();
    } else {
      // If on another page, setting to page 1 will trigger useEffect to fetch
      setCurrentPage(1);
    }
  };

  const handleUpdateSuccess = () => {
    // Refresh the table after successful update
    fetchSubItems();
  };

  // Generate page numbers to display (max 7 pages, excluding first and last)
  const getPageNumbers = () => {
    if (totalPages <= 9) {
      // Show all pages if total is 9 or less
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [1]; // Always show first page
    const maxVisible = 7;
    let start = Math.max(2, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages - 1, start + maxVisible - 1);

    // Adjust start if we're near the end
    if (end === totalPages - 1) {
      start = Math.max(2, end - maxVisible + 1);
    }

    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('...');
    }

    // Add middle pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push('...');
    }

    pages.push(totalPages); // Always show last page
    return pages;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sub Items</CardTitle>
          <Button size="sm" onClick={() => setCreateModalOpen(true)} disabled={enumLoading}>
            <Plus className="mr-2 h-4 w-4" />
            Add Sub Item
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>String</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Integer</TableHead>
                  <TableHead>Enumerate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 1 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-8 w-24" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : subItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No sub-items found. Click "Add Sub Item" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  subItems.map((subItem, index) => (
                    <TableRow
                      key={subItem.id}
                      className={`transition-all duration-300 ${
                        visibleRows.has(index)
                          ? 'translate-y-0 opacity-100'
                          : 'pointer-events-none hidden -translate-y-2 opacity-0'
                      }`}
                    >
                      <TableCell className="text-muted-foreground">{fromItem + index}</TableCell>
                      <TableCell className="font-medium">
                        <Link
                          href={subItemsRoutes.show.url(subItem.id)}
                          className="text-primary hover:underline"
                          target="_blank"
                        >
                          {subItem.string}
                        </Link>
                      </TableCell>
                      <TableCell>{subItem.email || '-'}</TableCell>
                      <TableCell>{subItem.integer || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={subItem.enumerate === 'enable' ? 'default' : 'secondary'}>
                          {subItem.enumerate
                            ? subItem.enumerate.charAt(0).toUpperCase() + subItem.enumerate.slice(1)
                            : 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleView(subItem)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(subItem)} disabled={enumLoading}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(subItem)}>
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

          {/* Pagination Controls */}
          {!loading && totalItems > 0 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {fromItem} to {toItem} of {totalItems} items
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                {getPageNumbers().map((page, index) =>
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      size="sm"
                      variant={currentPage === page ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(page as number)}
                      className="min-w-[2.5rem]"
                    >
                      {page}
                    </Button>
                  ),
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {viewModalOpen && selectedSubItem && (
        <SubItemShowModal
          itemId={itemId}
          subItemId={selectedSubItem.id}
          subItem={selectedSubItem}
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
        />
      )}

      {createModalOpen && !enumLoading && (
        <SubItemCreateModal
          itemId={itemId}
          enumerateOptions={enumerateOptions}
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSuccess={handleCreateSuccess}
        />
      )}

      {editModalOpen && selectedSubItem && !enumLoading && (
        <SubItemEditModal
          itemId={itemId}
          subItemId={selectedSubItem.id}
          enumerateOptions={enumerateOptions}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
}
