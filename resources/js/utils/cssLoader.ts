/**
 * CSS Lazy Loading Utility
 * Load non-critical CSS asynchronously to improve initial page load
 */

/**
 * Load CSS file asynchronously
 * @param href - URL of the CSS file
 * @param media - Media query (default: 'all')
 * @returns Promise that resolves when CSS is loaded
 */
export const loadCSS = (href: string, media: string = 'all'): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = media;
    
    link.onload = () => {
      // Change media to 'all' after loading to apply styles
      link.media = 'all';
      resolve();
    };
    
    link.onerror = () => {
      reject(new Error(`Failed to load CSS: ${href}`));
    };
    
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
 * Load CSS with media query (for responsive styles)
 * Useful for loading mobile/tablet/desktop specific CSS
 */
export const loadResponsiveCSS = (href: string, mediaQuery: string): Promise<void> => {
  return loadCSS(href, mediaQuery);
};

/**
 * Preload CSS file (for better performance)
 * File will be loaded but not applied until needed
 */
export const preloadCSS = (href: string): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'style';
  link.href = href;
  document.head.appendChild(link);
};

/**
 * Load CSS when element becomes visible (Intersection Observer)
 */
export const loadCSSOnVisible = (href: string, selector: string): void => {
  const element = document.querySelector(selector);
  if (!element) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadCSS(href).catch(console.error);
        observer.unobserve(entry.target);
      }
    });
  });

  observer.observe(element);
};

/**
 * Load CSS on user interaction (click, scroll, etc.)
 */
export const loadCSSOnInteraction = (href: string, events: string[] = ['click', 'scroll', 'mousemove']): void => {
  const loadOnce = () => {
    loadCSS(href).catch(console.error);
    events.forEach(event => {
      document.removeEventListener(event, loadOnce);
    });
  };

  events.forEach(event => {
    document.addEventListener(event, loadOnce, { once: true });
  });
};

/**
 * Inline critical CSS and defer non-critical CSS
 * This should be called during app initialization
 */
export const optimizeCSSDelivery = async (): Promise<void> => {
  // Defer non-critical CSS files
  const nonCriticalCSS = [
    // Add non-critical CSS files here
    // Example: '/css/animations.css'
    // Example: '/css/print.css'
  ];

  // Load non-critical CSS asynchronously
  if (nonCriticalCSS.length > 0) {
    // Load after page interactive
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        loadCSSFiles(nonCriticalCSS).catch(console.error);
      });
    } else {
      loadCSSFiles(nonCriticalCSS).catch(console.error);
    }
  }
};
