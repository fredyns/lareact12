/**
 * CSS Lazy Loading Utility (Simplified)
 * Load non-critical CSS asynchronously to improve initial page load
 * 
 * Currently not in use as all CSS is critical.
 * Add custom CSS files to the array when needed.
 */

/**
 * Load CSS file asynchronously
 * @param href - URL of the CSS file
 * @returns Promise that resolves when CSS is loaded
 */
export const loadCSS = (href: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
    
    document.head.appendChild(link);
  });
};

/**
 * Load multiple CSS files in parallel
 */
export const loadCSSFiles = (hrefs: string[]): Promise<void[]> => {
  return Promise.all(hrefs.map(href => loadCSS(href)));
};

/**
 * Optimize CSS delivery (deferred non-critical CSS)
 * Add custom CSS files to the array when needed
 */
export const optimizeCSSDelivery = async (): Promise<void> => {
  // Add non-critical CSS files here when available
  const nonCriticalCSS: string[] = [
    // Example: '/css/animations.css'
    // Example: '/css/print.css'
  ];

  // Load after page is interactive
  if (nonCriticalCSS.length > 0) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        loadCSSFiles(nonCriticalCSS).catch(console.error);
      });
    } else {
      loadCSSFiles(nonCriticalCSS).catch(console.error);
    }
  }
};
