import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface NavItem {
  title: string;
  href: NonNullable<InertiaLinkProps['href']>;
  icon?: LucideIcon | null;
  isActive?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface Item {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  user_id: string | null;
  string: string;
  email: string | null;
  color: string | null;
  integer: number | null;
  decimal: number | null;
  npwp: string | null;
  datetime: string | null;
  date: string | null;
  time: string | null;
  ip_address: string | null;
  boolean: boolean | null;
  enumerate: string | null;
  text: string | null;
  file: string | null;
  image: string | null;
  markdown_text: string | null;
  wysiwyg: string | null;
  latitude: number | null;
  longitude: number | null;
  user?: User;
  creator?: User;
  updater?: User;
}
