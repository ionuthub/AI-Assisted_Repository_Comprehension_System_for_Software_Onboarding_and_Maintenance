/**
 * Performance monitoring utilities
 * Tracks Core Web Vitals and custom performance metrics
 */

interface PerformanceMetric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Core Web Vitals thresholds
 */
const THRESHOLDS = {
    LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
    FID: { good: 100, poor: 300 },   // First Input Delay
    CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
    FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
    TTFB: { good: 800, poor: 1800 }, // Time to First Byte
};

/**
 * Get rating for a metric value
 */
function getRating(
    value: number,
    thresholds: { good: number; poor: number }
): 'good' | 'needs-improvement' | 'poor' {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
}

/**
 * Measure and report Core Web Vitals
 */
export const measureWebVitals = (): void => {
    if (typeof window === 'undefined' || !('performance' in window)) {
        return;
    }

    // Largest Contentful Paint (LCP)
    const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
            renderTime?: number;
            loadTime?: number;
        };

        const value = lastEntry.renderTime || lastEntry.loadTime || 0;
        const metric: PerformanceMetric = {
            name: 'LCP',
            value,
            rating: getRating(value, THRESHOLDS.LCP),
        };

        reportMetric(metric);
    });

    try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
        // LCP not supported
    }

    // First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
            const fidEntry = entry as PerformanceEntry & { processingStart?: number };
            const value = fidEntry.processingStart
                ? fidEntry.processingStart - entry.startTime
                : 0;

            const metric: PerformanceMetric = {
                name: 'FID',
                value,
                rating: getRating(value, THRESHOLDS.FID),
            };

            reportMetric(metric);
        });
    });

    try {
        fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
        // FID not supported
    }

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
            const layoutShift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
            if (!layoutShift.hadRecentInput) {
                clsValue += layoutShift.value || 0;
            }
        });
    });

    try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
        // CLS not supported
    }

    // Report CLS on page unload
    window.addEventListener('beforeunload', () => {
        const metric: PerformanceMetric = {
            name: 'CLS',
            value: clsValue,
            rating: getRating(clsValue, THRESHOLDS.CLS),
        };
        reportMetric(metric);
    });

    // First Contentful Paint (FCP)
    const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
            const metric: PerformanceMetric = {
                name: 'FCP',
                value: entry.startTime,
                rating: getRating(entry.startTime, THRESHOLDS.FCP),
            };
            reportMetric(metric);
        });
    });

    try {
        fcpObserver.observe({ entryTypes: ['paint'] });
    } catch (e) {
        // FCP not supported
    }

    // Time to First Byte (TTFB)
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        const metric: PerformanceMetric = {
            name: 'TTFB',
            value: ttfb,
            rating: getRating(ttfb, THRESHOLDS.TTFB),
        };
        reportMetric(metric);
    }
};

/**
 * Report metric to analytics and monitoring services
 */
function reportMetric(metric: PerformanceMetric): void {
    // Log to console in development
    if (import.meta.env.DEV) {
        console.log(`[Performance] ${metric.name}:`, {
            value: `${metric.value.toFixed(2)}ms`,
            rating: metric.rating,
        });
    }

    // Send to Sentry for performance monitoring
    if (window.Sentry) {
        window.Sentry.captureMessage(`Performance: ${metric.name}`, {
            level: metric.rating === 'poor' ? 'warning' : 'info',
            extra: {
                metric: metric.name,
                value: metric.value,
                rating: metric.rating,
            },
        });
    }

    // Send to analytics
    if (window.plausible) {
        window.plausible('Performance Metric', {
            props: {
                metric: metric.name,
                value: Math.round(metric.value),
                rating: metric.rating,
            },
        });
    }
}

/**
 * Measure custom timing
 */
export const measureTiming = (name: string, startTime: number): void => {
    const duration = performance.now() - startTime;

    if (import.meta.env.DEV) {
        console.log(`[Timing] ${name}: ${duration.toFixed(2)}ms`);
    }

    // Report to analytics
    if (window.plausible) {
        window.plausible('Custom Timing', {
            props: {
                name,
                duration: Math.round(duration),
            },
        });
    }
};

/**
 * Mark performance milestone
 */
export const markPerformance = (name: string): void => {
    if (typeof performance !== 'undefined' && performance.mark) {
        performance.mark(name);
    }
};

/**
 * Measure between two performance marks
 */
export const measureBetweenMarks = (
    measureName: string,
    startMark: string,
    endMark: string
): void => {
    if (typeof performance !== 'undefined' && performance.measure) {
        try {
            performance.measure(measureName, startMark, endMark);
            const measure = performance.getEntriesByName(measureName)[0];

            if (import.meta.env.DEV) {
                console.log(`[Measure] ${measureName}: ${measure.duration.toFixed(2)}ms`);
            }
        } catch (e) {
            // Marks not found
        }
    }
};

// Extend Window interface for TypeScript
declare global {
    interface Window {
        Sentry?: {
            captureMessage: (message: string, context?: unknown) => void;
        };
    }
}
