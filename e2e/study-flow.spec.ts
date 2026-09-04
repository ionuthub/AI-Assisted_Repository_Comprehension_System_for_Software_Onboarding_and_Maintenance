import { expect, test } from '@playwright/test';

const NASA_LABELS = [
  'Mental Demand',
  'Physical Demand',
  'Temporal Demand',
  'Performance',
  'Effort',
  'Frustration',
];

test.describe('participant comparative study runner', () => {
  test('captures manual and Codemap conditions, NASA-TLX, SUS, feedback and export', async ({ page }) => {
    await page.goto('/study');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Repository comprehension evaluation' }),
    ).toBeVisible();
    await expect(page.getByText('Eligibility: current Year 3 Computer Science student.')).toBeVisible();

    await page.getByLabel('Participant ID').fill('P01');
    await page.getByRole('button', { name: 'Prepare session' }).click();

    await expect(page.getByRole('heading', { name: 'Manual repository inspection' })).toBeVisible();
    await expect(page.getByText('warehouse-dispatch')).toBeVisible();
    await page.getByRole('button', { name: 'Begin timed tasks' }).click();

    await expect(page.getByText('Manual · Task 1 of 4')).toBeVisible();
    await page.getByLabel('Your answer').fill('src/main.tsx renders App and starts the application.');
    await page.getByRole('button', { name: 'Submit and next task' }).click();

    await expect(page.getByText('Manual · Task 2 of 4')).toBeVisible();
    await page.getByRole('button', { name: 'Unable to answer / skip' }).click();

    await page.getByLabel('Your answer').fill('Reservation happens during allocation, release and revalidation.');
    await page.getByRole('button', { name: 'Submit and next task' }).click();

    await page.getByLabel('Your answer').fill('Update the type, configuration maps and register a handler.');
    await page.getByRole('button', { name: 'Submit task and continue' }).click();

    await expect(page.getByRole('heading', { name: 'NASA-TLX' })).toBeVisible();
    for (const label of NASA_LABELS) {
      await page.getByLabel(label).selectOption('50');
    }
    await page.getByRole('button', { name: 'Continue to second condition' }).click();

    await expect(page.getByRole('heading', { name: 'Codemap' })).toBeVisible();
    await expect(page.getByText('clinic-triage')).toBeVisible();
    await page.getByRole('button', { name: 'Begin timed tasks' }).click();

    for (let task = 1; task <= 4; task += 1) {
      await expect(page.getByText(`Codemap · Task ${task} of 4`)).toBeVisible();
      await page.getByLabel('Your answer').fill(`Codemap answer ${task}`);
      await page
        .getByRole('button', { name: task === 4 ? 'Submit task and continue' : 'Submit and next task' })
        .click();
    }

    await expect(page.getByRole('heading', { name: 'NASA-TLX' })).toBeVisible();
    for (const label of NASA_LABELS) {
      await page.getByLabel(label).selectOption('50');
    }
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'System Usability Scale' })).toBeVisible();
    for (let index = 0; index < 10; index += 1) {
      await page.locator(`input[name="sus-${index}"][value="3"]`).check();
    }
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await page
      .getByLabel('What helped you understand the repository when using Codemap?')
      .fill('The repository overview and grounded answers.');
    await page
      .getByLabel('What was difficult or confusing when using Codemap?')
      .fill('Tracing some cross-file behaviour.');
    await page
      .getByLabel('Compared with manual browsing, which approach did you prefer and why?')
      .fill('Codemap because it reduced the amount of navigation required.');

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export participant data' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('study-P01-comparative.json');
    await expect(page.getByRole('heading', { name: 'Session complete' })).toBeVisible();
  });
});
