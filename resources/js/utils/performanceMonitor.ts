/**
 * Performance Monitoring Utility
 * Track and log performance metrics for optimization
 */

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (command: string, eventName: string, eventParams?: Record<string, string | number | boolean>) => void;
  }
}

export interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private marks: Map<string, number> = new Map();

  /**
   * Start measuring a performance metric
   */
  start(label: string): void {
    this.marks.set(label, performance.now());
  }

  /**
   * End measuring and record the metric
   */
  end(label: string): number {
    const startTime = this.marks.get(label);
    if (!startTime) {
      console.warn(`Performance mark "${label}" not found`);
      return 0;
    }

    const duration = performance.now() - startTime;
    
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }

    this.metrics.get(label)!.push({
      name: label,
      duration,
      timestamp: Date.now(),
    });

    this.marks.delete(label);
    return duration;
  }

  /**
   * Get average duration for a metric
   */
  getAverage(label: string): number {
    const metricsList = this.metrics.get(label);
    if (!metricsList || metricsList.length === 0) return 0;

    const total = metricsList.reduce((sum, m) => sum + m.duration, 0);
    return total / metricsList.length;
  }

  /**
   * Get all metrics
   */
  getMetrics(): Record<string, PerformanceMetrics[]> {
    const result: Record<string, PerformanceMetrics[]> = {};
    this.metrics.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Log all metrics to console
   */
  logMetrics(): void {
    console.group('Performance Metrics');
    this.metrics.forEach((metricsList, label) => {
      const average = this.getAverage(label);
      const min = Math.min(...metricsList.map(m => m.duration));
      const max = Math.max(...metricsList.map(m => m.duration));
      
      console.log(`${label}:`, {
        count: metricsList.length,
        average: `${average.toFixed(2)}ms`,
        min: `${min.toFixed(2)}ms`,
        max: `${max.toFixed(2)}ms`,
      });
    });
    console.groupEnd();
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
    this.marks.clear();
  }

  /**
   * Measure function execution time
   */
  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      return await fn();
    } finally {
      const duration = this.end(label);
      if (import.meta.env.DEV) {
        console.log(`${label}: ${duration.toFixed(2)}ms`);
      }
    }
  }

  /**
   * Measure synchronous function execution time
   */
  measureSync<T>(label: string, fn: () => T): T {
    this.start(label);
    try {
      return fn();
    } finally {
      const duration = this.end(label);
      if (import.meta.env.DEV) {
        console.log(`${label}: ${duration.toFixed(2)}ms`);
      }
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Report Core Web Vitals to analytics
 */
export interface WebVitalMetric {
  name: string;
  value: number;
  rating?: string;
  id: string;
}

export const reportWebVitals = (metric: WebVitalMetric): void => {
  if (import.meta.env.DEV) {
    console.log('Web Vitals:', {
      name: metric.name,
      value: metric.value.toFixed(2),
      rating: metric.rating,
    });
  }

  // Send to analytics service in production
  if (import.meta.env.PROD && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
};

/**
 * Log resource timing information
 */
export const logResourceTiming = (): void => {
  if (import.meta.env.DEV) {
    const resources = performance.getEntriesByType('resource');
    console.group('Resource Timing');
    resources.forEach(resource => {
      const resourceTiming = resource as PerformanceResourceTiming;
      console.log(`${resource.name}:`, {
        duration: `${(resource.duration as number).toFixed(2)}ms`,
        size: `${(resourceTiming.transferSize || 0) / 1024}KB`,
      });
    });
    console.groupEnd();
  }
};

/**
 * Log navigation timing
 */
export const logNavigationTiming = (): void => {
  if (import.meta.env.DEV) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      console.group('Navigation Timing');
      console.log('DNS Lookup:', `${(navigation.domainLookupEnd - navigation.domainLookupStart).toFixed(2)}ms`);
      console.log('TCP Connection:', `${(navigation.connectEnd - navigation.connectStart).toFixed(2)}ms`);
      console.log('Request Time:', `${(navigation.responseStart - navigation.requestStart).toFixed(2)}ms`);
      console.log('Response Time:', `${(navigation.responseEnd - navigation.responseStart).toFixed(2)}ms`);
      console.log('DOM Processing:', `${(navigation.domComplete - navigation.domContentLoadedEventStart).toFixed(2)}ms`);
      console.log('Total Load Time:', `${(navigation.loadEventEnd - navigation.fetchStart).toFixed(2)}ms`);
      console.groupEnd();
    }
  }
};
