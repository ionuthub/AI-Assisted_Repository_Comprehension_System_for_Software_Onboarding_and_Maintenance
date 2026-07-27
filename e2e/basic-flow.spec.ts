import { test, expect } from '@playwright/test';

/**
 * Smoke coverage for the routes and controls a study session depends on.
 * Deliberately avoids network-dependent assertions: analysing a real repository
 * calls the GitHub API and Gemini, which would make the suite flaky and consume
 * rate limit on every CI run.
 */
test.describe('Repository Comprehension System - core flow', () => {
    test('landing page exposes the ingestion controls', async ({ page }) => {
        await page.goto('/');

        await expect(page.getByRole('heading', { level: 1 })).toContainText('Repository Comprehension System');

        const urlInput = page.locator('#github-url');
        await expect(urlInput).toBeVisible();
        await expect(urlInput).toHaveAttribute('placeholder', /github\.com/);

        await expect(page.getByRole('button', { name: /Analyse Repository/i })).toBeVisible();
    });

    test('rejects a malformed repository URL without navigating away', async ({ page }) => {
        await page.goto('/');

        await page.locator('#github-url').fill('not-a-github-url');
        await page.getByRole('button', { name: /Analyse Repository/i }).click();

        // The workspace must not open; the ingestion form stays on screen.
        await expect(page.locator('#github-url')).toBeVisible();
    });

    test('navigates to the evaluation page used to run study sessions', async ({ page }) => {
        await page.goto('/');

        await page.getByRole('link', { name: /Evaluation/i }).click();

        await expect(page).toHaveURL(/\/evaluation/);
        await expect(page.getByText(/participant/i).first()).toBeVisible();
    });

    test('unknown routes render the not-found page', async ({ page }) => {
        await page.goto('/no-such-route');
        await expect(page.getByText(/404|not found/i).first()).toBeVisible();
    });
});
