import { test, expect } from '@playwright/test';

test.describe('Repository Comprehension System - Core Flow', () => {
    test('should load the landing page and show the hero section', async ({ page }) => {
        await page.goto('/');

        // Check if the main title is visible
        const title = page.locator('h1');
        await expect(title).toBeVisible();

        // Check if the Get Started button exists
        const getStartedBtn = page.getByRole('button', { name: /Get Started Free|Începe gratuit/i });
        await expect(getStartedBtn).toBeVisible();
    });

    test('should navigate to FAQ page', async ({ page }) => {
        await page.goto('/');

        // Click on FAQ link in the header
        const faqLink = page.getByRole('link', { name: /FAQ|Întrebări frecvente/i }).first();
        await faqLink.click();

        // Verify we are on the FAQ page
        await expect(page).toHaveURL(/\/faq/);
        await expect(page.locator('h1')).toContainText(/FAQ|Frequently Asked Questions|Întrebări frecvente/i);
    });
});
