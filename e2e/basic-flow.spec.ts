import { test, expect } from '@playwright/test';

/**
 * Smoke coverage for the main application routes and controls.
 * Network-dependent assertions are avoided because repository analysis calls external services.
 */
test.describe('Repository Comprehension System - core flow', () => {
    test('landing page exposes the ingestion controls', async ({ page }) => {
        await page.goto('/');

        await expect(page.getByRole('heading', { level: 1 })).toContainText('Analyse a repository');

        const urlInput = page.locator('#github-url');
        await expect(urlInput).toBeVisible();
        await expect(urlInput).toHaveAttribute('placeholder', /github\.com/);
        await expect(page.getByRole('button', { name: /Analyse Repository/i })).toBeVisible();
    });

    test('rejects a malformed repository URL without navigating away', async ({ page }) => {
        await page.goto('/');
        await page.locator('#github-url').fill('not-a-github-url');
        await page.getByRole('button', { name: /Analyse Repository/i }).click();
        await expect(page.locator('#github-url')).toBeVisible();
    });

    test('unknown routes render the not-found page', async ({ page }) => {
        await page.goto('/no-such-route');
        await expect(page.getByText(/404|not found/i).first()).toBeVisible();
    });
});
