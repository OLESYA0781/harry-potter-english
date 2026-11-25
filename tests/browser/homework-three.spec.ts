import { test, expect } from '@playwright/test';

for (const width of [320, 390, 820, 1440]) test(`Homework 3 content, choices and durable saving at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: 950 });
  await page.addInitScript(() => {
    if (!localStorage.getItem('hogwarts-english-v1')) localStorage.setItem('hogwarts-english-v1', JSON.stringify({ version: 3, data: { step: 0, name: '', answers: { oldAnswer: 'keep me' }, scores: {}, ratings: {} } }));
  });
  await page.goto('/#/homework/3');
  await expect(page.getByRole('heading', { name: 'Homework — Lesson 3', exact: true })).toBeVisible();
  await expect(page.locator('.hw3-task')).toHaveCount(8);
  const notebookParts = page.locator('#hw3-part-1b, #hw3-part-2, #hw3-part-3, #hw3-part-5');
  await expect(notebookParts.locator('textarea, input:not([type=checkbox]), select')).toHaveCount(0);
  for (const [part, count] of [['1a', 15], ['1b', 10], ['2', 12], ['3', 15], ['5', 15]] as const) {
    await expect(page.locator(`#hw3-part-${part} > .hw1-numbered > li`)).toHaveCount(count);
  }
  await expect(page.locator('#hw3-part-4c .hw1-numbered > li')).toHaveCount(6);
  await expect(page.locator('.hw3-teacher')).toHaveCount(0);
  await expect(page.getByText('She has three childs.', { exact: true })).toBeVisible();
  await expect(page.locator('.hw3-audio')).toHaveCount(3);
  await expect(page.locator('audio')).toHaveCount(0); // No substitute recording or broken player.
  await expect(page.locator('.hw3-audio').first()).toContainText('пока не добавлена');
  await page.getByRole('group', { name: 'Sentence 1, gap 1', exact: true }).getByRole('button', { name: 'an', exact: true }).click();
  await page.getByRole('group', { name: 'Sentence 14, gap 1', exact: true }).getByRole('button', { name: 'an', exact: true }).click();
  await page.getByRole('group', { name: 'Sentence 14, gap 2', exact: true }).getByRole('button', { name: 'a', exact: true }).click();
  const checks = page.getByRole('checkbox', { name: 'Done in my notebook' });
  await expect(checks).toHaveCount(4);
  for (let i = 0; i < 4; i++) await checks.nth(i).check();
  await page.getByRole('group', { name: 'Ralph: picture' }).getByRole('button', { name: 'B', exact: true }).click();
  await page.getByRole('group', { name: 'Yolanda: picture' }).getByRole('button', { name: 'C', exact: true }).click();
  await page.getByRole('button', { name: 'Choose British', exact: true }).click();
  await page.getByRole('button', { name: 'Ralph, Nationality: empty', exact: true }).click();
  await page.getByRole('button', { name: 'Choose British', exact: true }).click();
  await page.getByRole('button', { name: 'Yolanda, Nationality: empty', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Ralph, Nationality: empty', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Choose Brazilian', exact: true }).click();
  await page.getByRole('button', { name: 'Ralph, Nationality: empty', exact: true }).click();
  await page.getByRole('button', { name: 'Clear Yolanda, Nationality', exact: true }).click();
  await page.getByRole('group', { name: 'Statement 1', exact: true }).getByRole('button', { name: 'False', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('group', { name: 'Sentence 14, gap 1', exact: true }).getByRole('button', { name: 'an', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('group', { name: 'Sentence 14, gap 2', exact: true }).getByRole('button', { name: 'a', exact: true })).toHaveAttribute('aria-pressed', 'true');
  for (let i = 0; i < 4; i++) await expect(checks.nth(i)).toBeChecked();
  await checks.nth(1).uncheck(); await page.reload();
  await expect(checks.nth(1)).not.toBeChecked(); await expect(checks.nth(0)).toBeChecked();
  await expect(page.getByRole('group', { name: 'Ralph: picture' }).getByRole('button', { name: 'B', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Ralph, Nationality: Brazilian', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Yolanda, Nationality: empty', exact: true })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Statement 1', exact: true }).getByRole('button', { name: 'False', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const images = page.locator('.hw3-pictures img'); await expect(images).toHaveCount(4);
  for (const img of await images.all()) { await img.scrollIntoViewIfNeeded(); await expect.poll(() => img.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0); }
  await page.getByRole('button', { name: 'Teacher mode', exact: true }).click();
  await expect(page.locator('.hw3-teacher')).toHaveCount(8);
  await expect(page.locator('#hw3-part-3 .hw3-teacher')).toContainText('There are two countries on the map.');
  await expect(page.locator('#hw3-part-5 .hw3-teacher > ol > li')).toHaveCount(15);
  await page.getByRole('button', { name: 'Exit teacher mode', exact: true }).click();
  await expect(page.locator('.hw3-teacher')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
  const answers = await page.evaluate(() => JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!).state.answers);
  expect(answers.oldAnswer).toBe('keep me');
});

test('word bank supports real dragging and keyboard selection', async ({ page }) => {
  await page.goto('/#/homework/3');
  const word = page.getByRole('button', { name: 'Choose British', exact: true });
  const cell = page.getByRole('button', { name: 'Ralph, Nationality: empty', exact: true });
  await word.scrollIntoViewIfNeeded();
  const from = await word.boundingBox(), to = await cell.boundingBox();
  await page.mouse.move(from!.x + from!.width / 2, from!.y + from!.height / 2);
  await page.mouse.down(); await page.mouse.move(from!.x + from!.width / 2 + 12, from!.y + from!.height / 2, { steps: 5 });
  await page.mouse.move(to!.x + to!.width / 2, to!.y + to!.height / 2, { steps: 15 }); await page.mouse.up();
  await expect(page.getByRole('button', { name: 'Ralph, Nationality: British', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Choose London', exact: true }).focus(); await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Yolanda, From: empty', exact: true }).focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Yolanda, From: London', exact: true })).toBeVisible();
});

test('phone touch selection works without dragging', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage(); await page.goto('http://127.0.0.1:5173/#/homework/3');
  await page.getByRole('button', { name: 'Choose Sheffield', exact: true }).tap();
  await page.getByRole('button', { name: 'Ralph, From: empty', exact: true }).tap();
  await expect(page.getByRole('button', { name: 'Ralph, From: Sheffield', exact: true })).toBeVisible();
  await page.locator('#hw3-part-4b').scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'work/homework-3-phone-table.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
  await context.close();
});
