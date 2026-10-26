import { test, expect } from '@playwright/test';
// Historical exercise interaction tests are retained in tests/archived-browser/.
// The production trial no longer exposes chapters 13, 14 or 15.
const base = { name: 'Alice', answers: { differencesFound: [], differencesSceneVersion: 2, grammarA2: { index: 3, savedDraft: 'visited' }, grammarB1: { index: 6, savedDraft: 'had gone' } }, scores: { grammar0: { correct: true, first: false, latest: true, skill: 'Grammar' } }, ratings: { reading: 2 } };

test('trial exposes twelve chapters and ends at Find the differences', async ({ page }) => {
  await page.goto('/#/lessons/trial');
  await expect(page.locator('.nav-item')).toHaveCount(12);
  await expect(page.getByRole('button', { name: /Grammar Challenge/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Congratulations!/ })).toHaveCount(0);
  await page.locator('.nav-item').last().click();
  await expect(page.locator('.section-heading h1')).toHaveText('Find the differences');
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toHaveCount(0);
  await expect(page.getByRole('progressbar', { name: 'Lesson chapter' })).toHaveAttribute('aria-valuemax', '12');
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(page.getByLabel('Choose lesson stage').locator('option')).toHaveCount(12);
});

for (const step of [12, 13, 14]) test(`old chapter ${step + 1} falls back without clearing saved answers or ratings`, async ({ page }) => {
  await page.addInitScript(data => {
    if (!localStorage.getItem('hogwarts-english-v1')) localStorage.setItem('hogwarts-english-v1', JSON.stringify({ version: 3, data }));
  }, { ...base, step });
  await page.goto('/#/lessons/trial');
  await expect(page.locator('.section-heading h1')).toHaveText('Find the differences');
  await expect(page.locator('.grammar-challenge')).toHaveCount(0);
  await expect(page.locator('.congratulations')).toHaveCount(0);
  await page.reload();
  await expect(page.locator('.section-heading h1')).toHaveText('Find the differences');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('hogwarts-english-v1')!).data);
  expect(saved.step).toBe(step);
  expect(saved.answers.grammarA2).toEqual(base.answers.grammarA2);
  expect(saved.answers.grammarB1).toEqual(base.answers.grammarB1);
  expect(saved.scores).toEqual(base.scores);
  expect(saved.ratings).toEqual(base.ratings);
});

test('version two final location keeps existing progress without reopening removed chapters', async ({ page }) => {
  await page.addInitScript(data => {
    if (!localStorage.getItem('hogwarts-english-v1')) localStorage.setItem('hogwarts-english-v1', JSON.stringify({ version: 2, data }));
  }, { ...base, step: 12 });
  await page.goto('/#/lessons/trial');
  await expect(page.locator('.section-heading h1')).toHaveText('Find the differences');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('hogwarts-english-v1')!));
  expect(saved.version).toBe(3);
  expect(saved.data.step).toBe(14);
  expect(saved.data.answers.grammarA2).toEqual(base.answers.grammarA2);
  expect(saved.data.ratings.reading).toBe(2);
});
