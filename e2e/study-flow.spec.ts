import { expect, test } from '@playwright/test';

test.describe('participant usability study runner', () => {
  test('captures task attempts, SUS, feedback and JSON export', async ({ page }) => {
    await page.goto('/study');

    await expect(
      page.getByRole('heading', { level: 1, name: 'Repository comprehension usability test' }),
    ).toBeVisible();
    await expect(page.getByText('Eligibility: current Year 3 Computer Science student.')).toBeVisible();

    await page.getByLabel('Participant ID').fill('P99');
    await page.getByLabel('Assigned repository').selectOption('warehouse-dispatch');
    await page.getByRole('button', { name: 'Prepare session' }).click();

    await expect(page.getByRole('heading', { name: 'Researcher preparation' })).toBeVisible();
    await page.getByRole('button', { name: 'Begin timed tasks' }).click();

    await expect(page.getByText('Task 1 of 4')).toBeVisible();
    await page.getByLabel('Your answer').fill('src/main.tsx renders App and starts the application.');
    await page.getByRole('button', { name: 'Submit and next task' }).click();

    await expect(page.getByText('Task 2 of 4')).toBeVisible();
    await page.getByRole('button', { name: 'Unable to answer / skip' }).click();

    await expect(page.getByText('Task 3 of 4')).toBeVisible();
    await page.getByLabel('Your answer').fill('Reservation happens during allocation, release and revalidation.');
    await page.getByRole('button', { name: 'Submit and next task' }).click();

    await expect(page.getByText('Task 4 of 4')).toBeVisible();
    await page.getByLabel('Your answer').fill('Update the type, configuration maps and register a handler.');
    await page.getByRole('button', { name: 'Submit task and continue' }).click();

    await expect(page.getByRole('heading', { name: 'System Usability Scale' })).toBeVisible();
    for (let index = 0; index < 10; index += 1) {
      await page.locator(`input[name="sus-${index}"][value="3"]`).check();
    }
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByLabel('What helped you understand the repository?').fill('The repository overview.');
    await page.getByLabel('What was difficult or confusing?').fill('Tracing cross-file behaviour.');
    await page.getByLabel('What would you improve?').fill('More visible navigation cues.');

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Export participant data' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('study-P99-warehouse-dispatch.json');
    await expect(page.getByRole('heading', { name: 'Session complete' })).toBeVisible();
  });
});
