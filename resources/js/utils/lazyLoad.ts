import { lazy, Suspense } from 'react';

/**
 * Lazy load utility for code splitting
 * Dynamically imports components to reduce initial bundle size
 */

export const lazyLoadComponent = (importFunc: () => Promise<any>, displayName: string) => {
  const Component = lazy(importFunc);
  Component.displayName = displayName;
  return Component;
};

/**
 * Lazy load heavy libraries
 */
export const lazyLoadEditor = () =>
  lazyLoadComponent(
    () => import('@tinymce/tinymce-react').then(m => ({ default: m.Editor })),
    'TinyMCEEditor'
  );

export const lazyLoadMaps = () =>
  lazyLoadComponent(
    () => import('react-leaflet').then(m => ({ default: m.MapContainer })),
    'LeafletMap'
  );

export const lazyLoadMermaid = () =>
  lazyLoadComponent(
    () => import('mermaid').then(m => ({ default: m })),
    'Mermaid'
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
export const withSuspense = (Component: React.LazyExoticComponent<any>, fallback = <LoadingFallback />) => {
  return (props: any) => (
    <Suspense fallback={fallback}>
      <Component {...props} />
    </Suspense>
  );
};
