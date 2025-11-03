import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes';
import rbac from '@/routes/rbac';
import sample from '@/routes/sample';
import users from '@/routes/users';
import { type NavItem, type NavGroup } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, Shield, Key, Package, Ship, Anchor, Building2, Layers, Search, X } from 'lucide-react';
import AppLogo from './app-logo';
import { useState, useMemo } from 'react';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const navGroups: NavGroup[] = [
    {
        title: 'Landing Pages',
        items: [
            {
                title: 'Home',
                href: '/landing/home',
                icon: Ship,
            },
            {
                title: 'Services',
                href: '/landing/services',
                icon: Anchor,
            },
            {
                title: 'About Us',
                href: '/landing/about',
                icon: Building2,
            },
        ],
    },
    {
        title: 'System',
        items: [
            {
                title: 'Users',
                href: users.index.url(),
                icon: Users,
            },
        ],
    },
    {
        title: 'Sample',
        items: [
            {
                title: 'Items',
                href: sample.items.index.url(),
                icon: Package,
            },
        ],
    },
    {
        title: 'RBAC',
        items: [
            {
                title: 'Roles',
                href: rbac.roles.index.url(),
                icon: Shield,
            },
            {
                title: 'Permissions',
                href: rbac.permissions.index.url(),
                icon: Key,
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter menu items based on search query
    const filteredMainNavItems = useMemo(() => {
        if (!searchQuery) return mainNavItems;
        const query = searchQuery.toLowerCase();
        return mainNavItems.filter(item => 
            item.title.toLowerCase().includes(query)
        );
    }, [searchQuery]);

    const filteredNavGroups = useMemo(() => {
        if (!searchQuery) return navGroups;
        const query = searchQuery.toLowerCase();
        
        return navGroups
            .map(group => ({
                ...group,
                items: group.items.filter(item => 
                    item.title.toLowerCase().includes(query) ||
                    group.title.toLowerCase().includes(query)
                )
            }))
            .filter(group => group.items.length > 0);
    }, [searchQuery]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <div className="flex flex-col gap-2 w-full">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href={dashboard()} prefetch>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                    
                    {/* Search Input */}
                    <div className="relative px-2 group-data-[collapsible=icon]:hidden">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            type="text"
                            placeholder="Search menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-9 h-9"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                {filteredMainNavItems.length === 0 && filteredNavGroups.length === 0 && searchQuery ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No menu items found for "{searchQuery}"
                    </div>
                ) : (
                    <>
                        <NavMain items={filteredMainNavItems} />
                        <NavMain groups={filteredNavGroups} />
                    </>
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
