import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { type NavItem, type NavGroup } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavMainProps {
    items?: NavItem[];
    groups?: NavGroup[];
}

export function NavMain({ items = [], groups = [] }: NavMainProps) {
    const page = usePage();
    
    // State for collapsible groups - using localStorage for persistence
    const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
    
    // Load collapsed state from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed-groups');
        if (saved) {
            try {
                setCollapsedGroups(JSON.parse(saved));
            } catch (error) {
                console.error('Failed to parse saved collapsed groups:', error);
            }
        }
    }, []);
    
    // Save collapsed state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('sidebar-collapsed-groups', JSON.stringify(collapsedGroups));
    }, [collapsedGroups]);
    
    const toggleGroup = (groupTitle: string) => {
        setCollapsedGroups(prev => ({
            ...prev,
            [groupTitle]: !prev[groupTitle]
        }));
    };
    
    return (
        <>
            {/* Render individual items */}
            {items.length > 0 && (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarMenu>
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={page.url.startsWith(
                                        typeof item.href === 'string'
                                            ? item.href
                                            : item.href.url,
                                    )}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            )}
            
            {/* Render grouped items */}
            {groups.map((group) => {
                const isCollapsed = collapsedGroups[group.title] || false;
                const isCollapsible = group.title === 'RBAC' || group.title === 'System'; // Make RBAC and System collapsible
                
                if (!isCollapsible) {
                    // Render non-collapsible groups as before
                    return (
                        <SidebarGroup key={group.title} className="px-2 py-0">
                            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={page.url.startsWith(
                                                typeof item.href === 'string'
                                                    ? item.href
                                                    : item.href.url,
                                            )}
                                            tooltip={{ children: item.title }}
                                        >
                                            <Link href={item.href} prefetch>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroup>
                    );
                }
                
                // Render collapsible groups
                return (
                    <Collapsible key={group.title} open={!isCollapsed} onOpenChange={() => toggleGroup(group.title)}>
                        <SidebarGroup className="px-2 py-0">
                            <CollapsibleTrigger asChild>
                                <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md transition-colors flex items-center justify-between">
                                    <span>{group.title}</span>
                                    <ChevronDown 
                                        className={`h-4 w-4 transition-transform duration-200 ${
                                            isCollapsed ? '-rotate-90' : 'rotate-0'
                                        }`} 
                                    />
                                </SidebarGroupLabel>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenu>
                                    {group.items.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={page.url.startsWith(
                                                    typeof item.href === 'string'
                                                        ? item.href
                                                        : item.href.url,
                                                )}
                                                tooltip={{ children: item.title }}
                                            >
                                                <Link href={item.href} prefetch>
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                );
            })}
        </>
    );
}
