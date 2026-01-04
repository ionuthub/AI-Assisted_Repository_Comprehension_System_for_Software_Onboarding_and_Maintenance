import DOMPurify from 'dompurify';

/**
 * Security utilities for input sanitization and XSS protection
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param dirty - Potentially unsafe HTML string
 * @returns Sanitized HTML string safe for rendering
 */
export const sanitizeHtml = (dirty: string): string => {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'code', 'pre', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
        ALLOW_DATA_ATTR: false,
    });
};

/**
 * Sanitizes user input for safe storage and display
 * @param input - User input string
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    });
};

/**
 * Sanitizes markdown content while preserving formatting
 * @param markdown - Markdown string
 * @returns Sanitized markdown
 */
export const sanitizeMarkdown = (markdown: string): string => {
    return DOMPurify.sanitize(markdown, {
        ALLOWED_TAGS: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'hr',
            'strong', 'em', 'b', 'i', 'u', 's', 'del',
            'a', 'img',
            'ul', 'ol', 'li',
            'blockquote', 'code', 'pre',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class'],
        ALLOW_DATA_ATTR: false,
    });
};

/**
 * Validates and sanitizes URL to prevent javascript: and data: URIs
 * @param url - URL string to validate
 * @returns Sanitized URL or empty string if invalid
 */
export const sanitizeUrl = (url: string): string => {
    const trimmed = url.trim();

    // Block dangerous protocols
    if (
        trimmed.toLowerCase().startsWith('javascript:') ||
        trimmed.toLowerCase().startsWith('data:') ||
        trimmed.toLowerCase().startsWith('vbscript:')
    ) {
        return '';
    }

    try {
        const parsed = new URL(trimmed);
        // Only allow http, https, and mailto
        if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
            return trimmed;
        }
    } catch {
        // Invalid URL
        return '';
    }

    return '';
};

/**
 * Escapes special characters in a string for safe use in regex
 * @param str - String to escape
 * @returns Escaped string
 */
export const escapeRegex = (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns True if valid email format
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validates GitHub repository URL
 * @param url - GitHub URL to validate
 * @returns True if valid GitHub repo URL
 */
export const isValidGitHubUrl = (url: string): boolean => {
    try {
        const parsed = new URL(url);
        return (
            (parsed.hostname === 'github.com' || parsed.hostname === 'www.github.com') &&
            parsed.pathname.split('/').filter(Boolean).length >= 2
        );
    } catch {
        return false;
    }
};

/**
 * Rate limiter for client-side request throttling
 */
export class RateLimiter {
    private requests: Map<string, number[]> = new Map();

    constructor(
        private maxRequests: number,
        private windowMs: number
    ) { }

    /**
     * Checks if a request should be allowed
     * @param key - Unique identifier for the rate limit (e.g., user ID, IP)
     * @returns True if request is allowed, false if rate limited
     */
    isAllowed(key: string): boolean {
        const now = Date.now();
        const requests = this.requests.get(key) || [];

        // Remove requests outside the time window
        const validRequests = requests.filter(time => now - time < this.windowMs);

        if (validRequests.length >= this.maxRequests) {
            return false;
        }

        validRequests.push(now);
        this.requests.set(key, validRequests);
        return true;
    }

    /**
     * Gets the time until the next request is allowed
     * @param key - Unique identifier
     * @returns Milliseconds until next request, or 0 if allowed now
     */
    getTimeUntilReset(key: string): number {
        const requests = this.requests.get(key) || [];
        if (requests.length === 0) return 0;

        const oldestRequest = Math.min(...requests);
        const resetTime = oldestRequest + this.windowMs;
        const now = Date.now();

        return Math.max(0, resetTime - now);
    }

    /**
     * Clears rate limit for a key
     * @param key - Unique identifier
     */
    reset(key: string): void {
        this.requests.delete(key);
    }
}

/**
 * Global rate limiters for different operations
 */
export const rateLimiters = {
    // API calls: 15 per minute
    api: new RateLimiter(15, 60 * 1000),

    // File uploads: 5 per minute
    upload: new RateLimiter(5, 60 * 1000),

    // Project generation: 3 per minute
    generation: new RateLimiter(3, 60 * 1000),

    // Authentication attempts: 5 per 5 minutes
    auth: new RateLimiter(5, 5 * 60 * 1000),
};
