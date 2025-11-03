import { lazy, Suspense, LazyExoticComponent, ReactNode, ComponentType } from 'react';
import type { IAllProps } from '@tinymce/tinymce-react';
import type { MapContainerProps } from 'react-leaflet';

/**
 * Lazy load utility for code splitting
 * Dynamically imports components to reduce initial bundle size
 */

export const lazyLoadComponent = <P extends object = Record<string, unknown>>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  displayName: string
): LazyExoticComponent<React.ComponentType<P>> => {
  const Component = lazy(importFunc);
  const componentWithName = Component as LazyExoticComponent<React.ComponentType<P>> & {
    displayName?: string;
  };
  componentWithName.displayName = displayName;
  return Component;
};

/**
 * Lazy load heavy libraries
 */
export const lazyLoadEditor = () =>
  lazyLoadComponent<Partial<IAllProps>>(
    () => import('@tinymce/tinymce-react').then(m => ({ default: m.Editor as ComponentType<Partial<IAllProps>> })),
    'TinyMCEEditor'
  );

export const lazyLoadMaps = () =>
  lazyLoadComponent<MapContainerProps>(
    () => import('react-leaflet').then(m => ({ default: m.MapContainer as ComponentType<MapContainerProps> })),
    'LeafletMap'
  );

/**
 * Lazy load page components
 */
export const lazyLoadPage = (pagePath: string) =>
  lazyLoadComponent(
    () => import(`../pages/${pagePath}`),
    `Page_${pagePath}`
  );

/**
 * Create a loading fallback component
 */
export const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

/**
 * Wrap lazy component with Suspense
 */
export const withSuspense = (
  Component: LazyExoticComponent<React.ComponentType<Record<string, unknown>>>,
  fallback: ReactNode = <LoadingFallback />
) => {
  return (props: Record<string, unknown>) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};
