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

    const colours = await page.evaluate(() => {
      const heading = document.querySelector('h1');
      const helper = Array.from(document.querySelectorAll('p')).find((element) =>
        element.textContent?.includes('Search and questions work across')
      );
      const input = document.querySelector<HTMLInputElement>('#github-url');
      if (!heading || !helper || !input) throw new Error('Expected start-screen elements were not found');
      return {
        background: getComputedStyle(document.body).backgroundColor,
        heading: getComputedStyle(heading).color,
        helper: getComputedStyle(helper).color,
        inputBackground: getComputedStyle(input).backgroundColor,
        inputBorder: getComputedStyle(input).borderTopColor,
      };
    });

    expect(contrastRatio(colours.heading, colours.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colours.helper, colours.background)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(colours.inputBorder, colours.inputBackground)).toBeGreaterThanOrEqual(3);
  });

  test('reduced-motion preference disables smooth scrolling and transition motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const scrollBehavior = await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior);
    expect(scrollBehavior).toBe('auto');

    const analyseLink = page.getByRole('link', { name: 'Analyse' });
    const transitionDuration = await analyseLink.evaluate((element) => getComputedStyle(element).transitionDuration);
    expect(['0s', '0.00001s']).toContain(transitionDuration);
  });
});
