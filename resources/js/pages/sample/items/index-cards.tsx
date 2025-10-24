import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Item } from '@/types';
import { Link, router } from '@inertiajs/react';
import { Edit, Eye, MoreHorizontal, Trash2, User } from 'lucide-react';
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
  onDelete: (item: Item) => void;
  viewMode?: string;
}

export function ItemsCards({ items, onDelete, viewMode }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.data.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.string}
                      className="h-32 w-32 rounded object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-32 w-32 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-muted-foreground text-xs">No image</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base line-clamp-2 mb-1">{item.string}</h3>
                    {item.enumerate && (
                      <Badge variant={item.enumerate === 'enable' ? 'default' : 'secondary'} className="text-xs">
                        {item.enumerate.charAt(0).toUpperCase() + item.enumerate.slice(1)}
                      </Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 flex-shrink-0">
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
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2">
              {item.user && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="truncate">{item.user.name}</span>
                </div>
              )}
              {item.text && (
                <p className="text-sm text-muted-foreground line-clamp-3">{item.text}</p>
              )}
            </CardContent>
            <CardFooter className="p-4 pt-0 flex gap-2">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href={sample.items.show.url(item.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href={sample.items.edit.url(item.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
        {items.data.length === 0 && (
          <div className="col-span-full p-8 text-center text-muted-foreground">
            No items found.
          </div>
        )}
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
