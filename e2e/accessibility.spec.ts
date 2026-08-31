import { expect, test, type Locator, type Page } from '@playwright/test';

type RGB = [number, number, number];

function parseRgb(value: string): RGB {
  const parts = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  if (!parts || parts.length !== 3) throw new Error(`Could not parse colour: ${value}`);
  return parts as RGB;
}

function relativeLuminance([r, g, b]: RGB): number {
  const linear = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(a: string, b: string): number {
  const l1 = relativeLuminance(parseRgb(a));
  const l2 = relativeLuminance(parseRgb(b));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

async function tabUntilFocused(page: Page, target: Locator, maxTabs = 8) {
  for (let i = 0; i < maxTabs; i += 1) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((element) => document.activeElement === element)) return;
  }
  throw new Error('Target did not receive keyboard focus');
}

test.describe('accessibility design-system smoke checks', () => {
  test('start journey has semantic hierarchy and keyboard-visible focus', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1, name: 'Analyse a repository' })).toBeVisible();
    const repositoryInput = page.getByLabel('Repository URL');
    await expect(repositoryInput).toBeVisible();

    await page.keyboard.press('Tab');
    const logo = page.getByRole('link', { name: /Codemap, start a new repository analysis/i });
    await expect(logo).toBeFocused();
    const logoOutline = await logo.evaluate((element) => getComputedStyle(element).outlineStyle);
    expect(logoOutline).not.toBe('none');

    await tabUntilFocused(page, repositoryInput);
    await expect(repositoryInput).toBeFocused();
    const inputShadow = await repositoryInput.evaluate((element) => getComputedStyle(element).boxShadow);
    expect(inputShadow).not.toBe('none');
  });

  test('core text and control boundaries meet the documented contrast targets', async ({ page }) => {
    await page.goto('/');

    const heading = page.getByRole('heading', { level: 1, name: 'Analyse a repository' });
    const helper = page.getByText(/All eligible source and configuration files returned by GitHub are indexed/);
    const input = page.getByLabel('Repository URL');

    await expect(heading).toBeVisible();
    await expect(helper).toBeVisible();
    await expect(input).toBeVisible();

    const background = await page.locator('body').evaluate((element) => getComputedStyle(element).backgroundColor);
    const headingColour = await heading.evaluate((element) => getComputedStyle(element).color);
    const helperColour = await helper.evaluate((element) => getComputedStyle(element).color);
    const inputBackground = await input.evaluate((element) => getComputedStyle(element).backgroundColor);
    const inputBorder = await input.evaluate((element) => getComputedStyle(element).borderTopColor);

    expect(contrastRatio(headingColour, background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(helperColour, background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(inputBorder, inputBackground)).toBeGreaterThanOrEqual(3);
  });

  test('reduced-motion preference disables smooth scrolling and transition motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const scrollBehavior = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
    expect(scrollBehavior).toBe('auto');

    const analyseLink = page.getByRole('link', { name: 'Analyse' });
    const transitionDuration = await analyseLink.evaluate((element) => getComputedStyle(element).transitionDuration);
    expect(parseFloat(transitionDuration)).toBeLessThanOrEqual(0.00001);
  });
});
