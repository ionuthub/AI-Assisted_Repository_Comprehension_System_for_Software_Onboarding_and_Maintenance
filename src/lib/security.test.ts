import { describe, it, expect, beforeEach } from 'vitest';
import {
    sanitizeHtml,
    sanitizeInput,
    sanitizeUrl,
    isValidEmail,
    isValidGitHubUrl,
    RateLimiter,
} from './security';

describe('Security Utilities', () => {
    describe('sanitizeHtml', () => {
        it('should allow safe HTML tags', () => {
            const input = '<p>Hello <strong>World</strong></p>';
            const result = sanitizeHtml(input);
            expect(result).toContain('<p>');
            expect(result).toContain('<strong>');
        });

        it('should remove dangerous script tags', () => {
            const input = '<p>Hello</p><script>alert("XSS")</script>';
            const result = sanitizeHtml(input);
            expect(result).not.toContain('<script>');
            expect(result).not.toContain('alert');
        });

        it('should remove event handlers', () => {
            const input = '<p onclick="alert(\'XSS\')">Click me</p>';
            const result = sanitizeHtml(input);
            expect(result).not.toContain('onclick');
        });
    });

    describe('sanitizeInput', () => {
        it('should remove all HTML tags', () => {
            const input = '<p>Hello <strong>World</strong></p>';
            const result = sanitizeInput(input);
            expect(result).not.toContain('<');
            expect(result).not.toContain('>');
        });

        it('should preserve plain text', () => {
            const input = 'Hello World';
            const result = sanitizeInput(input);
            expect(result).toBe('Hello World');
        });
    });

    describe('sanitizeUrl', () => {
        it('should allow valid HTTP URLs', () => {
            const url = 'https://example.com';
            const result = sanitizeUrl(url);
            expect(result).toBe(url);
        });

        it('should block javascript: URLs', () => {
            const url = 'javascript:alert("XSS")';
            const result = sanitizeUrl(url);
            expect(result).toBe('');
        });

        it('should block data: URLs', () => {
            const url = 'data:text/html,<script>alert("XSS")</script>';
            const result = sanitizeUrl(url);
            expect(result).toBe('');
        });

        it('should block vbscript: URLs', () => {
            const url = 'vbscript:msgbox("XSS")';
            const result = sanitizeUrl(url);
            expect(result).toBe('');
        });

        it('should allow mailto: URLs', () => {
            const url = 'mailto:test@example.com';
            const result = sanitizeUrl(url);
            expect(result).toBe(url);
        });
    });

    describe('isValidEmail', () => {
        it('should validate correct email addresses', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name+tag@example.co.uk')).toBe(true);
        });

        it('should reject invalid email addresses', () => {
            expect(isValidEmail('invalid')).toBe(false);
            expect(isValidEmail('invalid@')).toBe(false);
            expect(isValidEmail('@example.com')).toBe(false);
            expect(isValidEmail('test@')).toBe(false);
        });
    });

    describe('isValidGitHubUrl', () => {
        it('should validate correct GitHub URLs', () => {
            expect(isValidGitHubUrl('https://github.com/user/repo')).toBe(true);
            expect(isValidGitHubUrl('https://www.github.com/user/repo')).toBe(true);
        });

        it('should reject invalid GitHub URLs', () => {
            expect(isValidGitHubUrl('https://example.com/user/repo')).toBe(false);
            expect(isValidGitHubUrl('https://github.com/user')).toBe(false);
            expect(isValidGitHubUrl('https://github.com')).toBe(false);
            expect(isValidGitHubUrl('not-a-url')).toBe(false);
        });
    });

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
