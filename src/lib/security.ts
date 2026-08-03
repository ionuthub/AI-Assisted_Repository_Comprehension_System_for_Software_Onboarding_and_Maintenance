/**
 * Client-side request throttling.
 *
 * The sanitisation helpers that used to sit here (sanitizeHtml, sanitizeInput,
 * sanitizeMarkdown, sanitizeUrl, escapeRegex) and the validators (isValidEmail,
 * isValidGitHubUrl) had no callers in the application — only their own tests. They were
 * not protecting anything: no component renders with dangerouslySetInnerHTML, so React
 * escapes model output by construction, and github.ts does its own URL parsing and path
 * validation. Keeping them inflated the test count with coverage of code the application
 * never runs.
 */

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
