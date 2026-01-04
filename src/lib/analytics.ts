/**
 * Analytics utility for tracking user events
 * Supports Plausible Analytics (privacy-friendly, GDPR compliant)
 * Can be extended to support Google Analytics 4
 */

interface PlausibleEvent {
    (eventName: string, options?: { props?: Record<string, string | number | boolean> }): void;
}

declare global {
    interface Window {
        plausible?: PlausibleEvent;
    }
}

/**
 * Track an event with Plausible Analytics
 * @param eventName - Name of the event (e.g., "Sign Up", "Project Generated")
 * @param props - Optional properties to attach to the event
 */
export const trackEvent = (
    eventName: string,
    props?: Record<string, string | number | boolean>
): void => {
    // Only track in production or if explicitly enabled
    if (!import.meta.env.PROD && !import.meta.env.VITE_PLAUSIBLE_DOMAIN) {
        console.log('[Analytics]', eventName, props);
        return;
    }

    // Plausible Analytics
    if (window.plausible) {
        window.plausible(eventName, { props });
    }

    // Add Google Analytics 4 support here if needed
    // if (window.gtag) {
    //   window.gtag('event', eventName, props);
    // }
};

/**
 * Track page view (automatically handled by Plausible script)
 * Only needed for SPAs with custom routing
 */
export const trackPageView = (url?: string): void => {
    if (!import.meta.env.PROD && !import.meta.env.VITE_PLAUSIBLE_DOMAIN) {
        console.log('[Analytics] Page View:', url || window.location.pathname);
        return;
    }

    // Plausible automatically tracks page views
    // Manual tracking only needed for custom implementations
};

/**
 * Common event names for consistency
 */
export const AnalyticsEvents = {
    // Authentication
    SIGN_IN: 'Sign In',
    SIGN_OUT: 'Sign Out',
    SIGN_UP: 'Sign Up',

    // Projects
    PROJECT_GENERATED: 'Project Generated',
    GITHUB_ANALYZED: 'GitHub Analyzed',
    FOLDER_UPLOADED: 'Folder Uploaded',
    PROJECT_DELETED: 'Project Deleted',
    PROJECT_DOWNLOADED: 'Project Downloaded',

    // Account
    ACCOUNT_DELETED: 'Account Deleted',
    SETTINGS_VIEWED: 'Settings Viewed',

    // Errors
    ERROR_OCCURRED: 'Error Occurred',
    RATE_LIMIT_HIT: 'Rate Limit Hit',

    // Engagement
    CODE_EXPLAINED: 'Code Explained',
    FILE_SELECTED: 'File Selected',
    SKILL_LEVEL_CHANGED: 'Skill Level Changed',
} as const;

/**
 * Initialize analytics (call this in main.tsx or App.tsx)
 */
export const initAnalytics = (): void => {
    const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;

    if (!domain) {
        console.log('[Analytics] Not initialized - VITE_PLAUSIBLE_DOMAIN not set');
        return;
    }

    // Plausible script is loaded via index.html
    // This function is for any additional setup
    console.log('[Analytics] Initialized for domain:', domain);
};
