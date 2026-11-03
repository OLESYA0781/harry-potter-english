import { test, expect } from '@playwright/test';
for (const [width, height] of [[390, 844], [820, 1180], [1180, 820], [1440, 1000]]) {
  test(`vocabulary content, search, topics and navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.locator('.vocabulary-home-card').click();
    await expect(page).toHaveURL(/#\/vocabulary$/);
    await expect(page.getByRole('heading', { name: /My Vocabulary/ })).toBeVisible();
    const header = (await page.locator('.vocab-header').boundingBox())!;
    const title = (await page.locator('.vocab-header h1').boundingBox())!;
    expect(title.y).toBeGreaterThanOrEqual(header.y);
    expect(title.y + title.height).toBeLessThanOrEqual(header.y + header.height);
    await expect(page.locator('.vocab-entry')).toHaveCount(42);
    for (const entry of await page.locator('.vocab-entry').all()) {
      await expect(entry.locator('th')).not.toHaveText('');
      await expect(entry.locator('td').first()).not.toHaveText('');
      await expect(entry.locator('td').last()).not.toHaveText('');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    const search = page.getByRole('searchbox', { name: 'Поиск по словарю' });
    await search.fill('БОЛЬНИЦА');
    await expect(page.locator('.vocab-entry')).toHaveCount(1);
    await expect(page.locator('.vocab-entry')).toContainText('The hospital is near the park.');
    await page.getByRole('button', { name: 'Очистить поиск' }).click();
    await page.getByRole('button', { name: /Transport Транспорт/ }).click();
    await expect(page.locator('.vocab-entry')).toHaveCount(10);
    await search.fill('café');
    await expect(page.locator('.vocab-entry')).toHaveCount(0);
    await expect(page.getByText(/Слова не найдены/)).toBeVisible();
    await page.getByRole('button', { name: 'Показать все слова' }).click();
    await expect(page.locator('.vocab-entry')).toHaveCount(42);
    await page.reload();
    await expect(page.locator('.vocab-entry')).toHaveCount(42);
    await page.getByRole('link', { name: 'Главное меню', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'My Lessons', exact: true })).toBeVisible();
    await page.locator('.vocabulary-nav-link').click();
    await expect(page.locator('.vocab-entry')).toHaveCount(42);
  });
}
