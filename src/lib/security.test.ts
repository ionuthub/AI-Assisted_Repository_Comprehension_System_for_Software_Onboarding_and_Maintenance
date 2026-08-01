import { describe, it, expect, beforeEach } from 'vitest';
import { RateLimiter } from './security';

describe('Security Utilities', () => {
    describe('RateLimiter', () => {
        let rateLimiter: RateLimiter;

        beforeEach(() => {
            rateLimiter = new RateLimiter(3, 1000); // 3 requests per second
        });

        it('should allow requests within limit', () => {
            expect(rateLimiter.isAllowed('user1')).toBe(true);
            expect(rateLimiter.isAllowed('user1')).toBe(true);
            expect(rateLimiter.isAllowed('user1')).toBe(true);
        });

        it('should block requests exceeding limit', () => {
            rateLimiter.isAllowed('user1');
            rateLimiter.isAllowed('user1');
            rateLimiter.isAllowed('user1');
            expect(rateLimiter.isAllowed('user1')).toBe(false);
        });

        it('should track different users separately', () => {
            rateLimiter.isAllowed('user1');
            rateLimiter.isAllowed('user1');
            rateLimiter.isAllowed('user1');

            // user2 should still be allowed
            expect(rateLimiter.isAllowed('user2')).toBe(true);
        });

        it('should reset after time window', async () => {
            rateLimiter.isAllowed('user1');
            rateLimiter.isAllowed('user1');
            rateLimiter.isAllowed('user1');
            expect(rateLimiter.isAllowed('user1')).toBe(false);

            // Wait for window to expire
            await new Promise(resolve => setTimeout(resolve, 1100));
            expect(rateLimiter.isAllowed('user1')).toBe(true);
        });

        it('should calculate time until reset correctly', () => {
            rateLimiter.isAllowed('user1');
            const timeUntilReset = rateLimiter.getTimeUntilReset('user1');
            expect(timeUntilReset).toBeGreaterThan(0);
            expect(timeUntilReset).toBeLessThanOrEqual(1000);
        });

        it('should reset rate limit for specific user', () => {
            rateLimiter.isAllowed('user1');
            rateLimiter.isAllowed('user1');
            rateLimiter.isAllowed('user1');
            expect(rateLimiter.isAllowed('user1')).toBe(false);

            rateLimiter.reset('user1');
            expect(rateLimiter.isAllowed('user1')).toBe(true);
        });
    });
});
