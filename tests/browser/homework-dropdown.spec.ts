import { test, expect } from '@playwright/test';
for (const [width, height] of [[320, 568], [360, 740], [390, 844], [430, 932], [600, 360], [820, 1180], [1440, 1000]]) {
  test(`Homework dropdown stays inside viewport at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/#/homework/0');
    const menu = page.locator('.homework-menu');
    await menu.locator('summary').click();
    const list = menu.locator('ul');
    await expect(list).toBeVisible();
    const box = (await list.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(box.y + box.height).toBeLessThanOrEqual(height);
    for (const title of ['Homework 0', 'Homework 1']) {
      const link = menu.getByRole('link', { name: new RegExp(title) });
      await link.scrollIntoViewIfNeeded();
      await expect(link).toBeVisible();
      const linkBox = (await link.boundingBox())!;
      expect(linkBox.x).toBeGreaterThanOrEqual(0);
      expect(linkBox.x + linkBox.width).toBeLessThanOrEqual(width);
    }
    await menu.getByRole('link', { name: /Homework 1/ }).click();
    await expect(page.getByRole('heading', { name: 'Homework 1', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  });
}
for (const width of [320,390,601,820,1440]) test(`menus are exclusive and never covered at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto('/#/vocabulary');
  const lessons = page.locator('.lesson-menu:not(.homework-menu)');
  const homework = page.locator('.homework-menu');
  await expect(page.getByRole('link', { name: 'Main Menu', exact: true })).toBeVisible();
  await expect(page.locator('.vocabulary-nav-link')).toHaveText('My Vocabulary');
  await lessons.locator('summary').click();
  await expect(lessons).toHaveJSProperty('open', true);
  await expect(homework).toHaveJSProperty('open', false);
  const list = (await lessons.locator('ul').boundingBox())!;
  const button = (await homework.locator('summary').boundingBox())!;
  expect(list.y).toBeGreaterThanOrEqual(button.y + button.height);
  for (const link of await lessons.locator('a').all()) {
    await link.scrollIntoViewIfNeeded();
    expect(await link.evaluate(element => {
      const rect = element.getBoundingClientRect();
      return element.contains(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2));
    })).toBeTruthy();
  }
  await homework.locator('summary').click();
  await expect(lessons).toHaveJSProperty('open', false);
  await expect(homework).toHaveJSProperty('open', true);
  await expect(page.locator('.lesson-menu[open]')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('.lesson-menu[open]')).toHaveCount(0);
  await expect(homework.locator('summary')).toBeFocused();
  await lessons.locator('summary').click();
  await page.mouse.click(2, 800);
  await expect(page.locator('.lesson-menu[open]')).toHaveCount(0);
});
