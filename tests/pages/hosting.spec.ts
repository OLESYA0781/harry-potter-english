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
      ['lesson-1', 'Warm-up — Back to Hogwarts!'], ['lesson-2', 'Warm-up — The Mystery House'],
    ]) {
      await page.goto(`./#/lessons/${id}`);
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
      await page.reload();
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
      await page.getByRole('link', { name: 'Main Menu', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'My Lessons', exact: true })).toBeVisible();
    }
    await page.goto('./#/lessons/lesson-2');
    if(await page.locator('.ar-sidebar').isVisible())await page.locator('.ar-sidebar button').last().click();else await page.getByLabel('Choose Lesson 2 section').selectOption('11');
    await expect(page.locator('.gk-building')).toHaveCount(6);
    expect(await page.locator('.gk-building-art').first().evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('/harry-potter-english/art/lesson-2/quest/buildings.webp');
    await page.goto('./#/homework/1');
    await expect(page.getByRole('heading',{name:'Lesson 1 — Present Simple Homework',exact:true})).toBeVisible();
    const anna=page.locator('.hw1-anna img');await anna.scrollIntoViewIfNeeded();await expect(anna).toBeVisible();await expect.poll(()=>anna.evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await page.reload();await expect(page.locator('.hw1-task')).toHaveCount(7);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
    await page.goto('./#/vocabulary');
    const vocabularyCount = await page.locator('.vocab-entry').count();
    expect(vocabularyCount).toBeGreaterThan(73);
    await expect(page.locator('.vocab-entry')).toHaveCount(vocabularyCount);
    await page.reload();
    await expect(page.locator('.vocab-entry')).toHaveCount(vocabularyCount);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
    await page.goto('./#/homework/3');
    await expect(page.getByRole('heading', { name: 'Homework — Lesson 3', exact: true })).toBeVisible();
    await expect(page.locator('.hw3-task')).toHaveCount(8);
    const listeningPicture = page.locator('.hw3-pictures img').first();
    await listeningPicture.scrollIntoViewIfNeeded();
    await expect.poll(() => listeningPicture.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect(listeningPicture).toHaveAttribute('src', '/harry-potter-english/art/homework-3/picture-a.webp');
    await page.reload();
    await expect(page.locator('.hw3-task')).toHaveCount(8);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
    expect(badResources).toEqual([]);
    expect(errors).toEqual([]);
  });
}
