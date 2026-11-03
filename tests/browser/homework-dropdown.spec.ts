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
