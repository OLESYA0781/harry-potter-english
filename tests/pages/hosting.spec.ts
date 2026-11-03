import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

test('every public file is served intact under the project prefix', async ({ request }) => {
  function files(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
      entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]);
  }
  for (const file of files('public')) {
    const response = await request.get(file.replace(/^public\//, ''));
    expect(response.ok(), file).toBeTruthy();
    expect(await response.body(), file).toEqual(readFileSync(file));
  }
});

for (const [name, width, height] of [
  ['desktop', 1440, 1000], ['tablet portrait', 820, 1180],
  ['tablet landscape', 1180, 820], ['phone', 390, 844],
] as const) {
  test(`${name}: direct lesson links, reload and resources use the project prefix`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    const badResources: string[] = [];
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      const url = new URL(request.url());
      if (['image', 'stylesheet', 'script', 'font'].includes(request.resourceType()) &&
          (url.origin !== 'http://127.0.0.1:5186' || !url.pathname.startsWith('/harry-potter-english/'))) {
        badResources.push(url.href);
      }
    });
    for (const [id, heading] of [
      ['trial', 'Welcome to Hogwarts!'], ['lesson-0', 'TO BE — Am / Is / Are'],
      ['lesson-1', 'The Magic of Everyday Life'],
    ]) {
      await page.goto(`./#/lessons/${id}`);
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
      await page.reload();
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
      await page.getByRole('link', { name: 'Main Menu', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'My Lessons', exact: true })).toBeVisible();
    }
    await page.goto('./#/vocabulary');
    await expect(page.locator('.vocab-entry')).toHaveCount(42);
    await page.reload();
    await expect(page.locator('.vocab-entry')).toHaveCount(42);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
    expect(badResources).toEqual([]);
    expect(errors).toEqual([]);
  });
}
