import { AnimatePresence, motion } from 'framer-motion';
import { Item } from '@/types';
import { router } from '@inertiajs/react';
import sample from '@/routes/sample';
import { MorphingCard } from '@/components/ui/morphing-card';
import { useState } from 'react';

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
  viewMode?: string;
  onDelete: (item: Item) => void;
}

export function ItemsCards({ items, viewMode, onDelete }: Props) {
  const handleViewDetails = (item: Item) => {
    router.visit(sample.items.show.url(item.id));
  };

  const handleEdit = (item: Item) => {
    router.visit(sample.items.edit.url(item.id));
  };

  const handleDelete = (item: Item) => {
    if (confirm('Are you sure you want to delete this item?')) {
      onDelete(item);
    }
  };

  return (
    <div className="p-4">
      <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {items.data.map((item) => (
            <div key={item.id} className="h-full">
              <MorphingCard
                id={item.id}
                title={item.string || 'Untitled'}
                description={item.user?.name || 'No description'}
                image={item.image_url ?? undefined}
                onPreview={() => {}}
                onViewDetails={() => handleViewDetails(item)}
                onEdit={() => handleEdit(item)}
                onDelete={() => handleDelete(item)}
                actionText="View Details"
                className="h-full"
              />
            </div>
          ))}
          
          {items.data.length === 0 && (
            <div className="col-span-full p-8 text-center text-muted-foreground">
              No items found.
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {items.last_page > 1 && (
        <div className="flex items-center justify-between space-x-2 py-4 mt-6">
          <div className="text-sm text-muted-foreground">
            Showing {(items.current_page - 1) * items.per_page + 1} to{' '}
            {Math.min(items.current_page * items.per_page, items.total)} of {items.total} results
          </div>
          <div className="flex items-center space-x-2">
            {items.links &&
              items.links.map((link, index) => (
                <button
                  key={index}
                  className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                    link.active
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2'
                      : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 py-2'
                  }`}
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
    </div>
  );
}
