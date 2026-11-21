import { test, expect } from '@playwright/test';

for (const [width, height] of [[390, 844], [820, 1180], [1180, 820], [1440, 1000]]) {
  test(`vocabulary lesson filter, translations and abbreviation lookup at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.locator('.vocabulary-home-card').click();
    await expect(page).toHaveURL(/#\/vocabulary$/);
    await expect(page.getByRole('heading', { name: 'My Vocabulary' })).toBeVisible();
    const header = (await page.locator('.vocab-header').boundingBox())!;
    const title = (await page.locator('.vocab-header h1').boundingBox())!;
    expect(title.y).toBeGreaterThanOrEqual(header.y);
    expect(title.y + title.height).toBeLessThanOrEqual(header.y + header.height);
    const total = Number((await page.locator('.vocab-count').innerText()).match(/\d+/)?.[0]);
    expect(total).toBeGreaterThan(73);
    const entries = page.locator('.vocab-entry');
    await expect(entries).toHaveCount(total);
    await expect(entries.first().locator('td')).toHaveCount(1);
    await expect(page.getByRole('columnheader', { name: 'Example' })).toHaveCount(0);
    await expect(page.getByText('The hospital is near the park.', { exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();

    const filters = page.getByRole('group', { name: 'Уроки словаря' });
    await expect(filters.getByRole('button')).toHaveCount(6);
    await filters.getByRole('button', { name: /^Lesson 3/ }).click();
    const lessonTotal = await entries.count();
    expect(lessonTotal).toBeGreaterThan(13);
    expect(lessonTotal).toBeLessThan(total);
    const search = page.getByRole('searchbox', { name: 'Поиск по словарю' });
    await search.fill('private message');
    await expect(entries).toHaveCount(1);
    await expect(entries).toContainText('PM');
    await expect(entries).toContainText('личное сообщение');
    await filters.getByRole('button', { name: /^Lesson 1/ }).click();
    await expect(entries).toHaveCount(0);
    await page.getByRole('button', { name: 'Показать все слова' }).click();
    await expect(entries).toHaveCount(total);

    await page.getByLabel('Тема словаря').selectOption('transport');
    await expect(entries).toHaveCount(10);
    await page.getByLabel('Тема словаря').selectOption('all');
    await search.fill('БОЛЬНИЦА');
    await expect(entries).toHaveCount(1);
    await expect(entries).toContainText('hospital');
    await page.reload();
    await expect(entries).toHaveCount(total);
    await page.getByRole('link', { name: 'Main Menu', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'My Lessons', exact: true })).toBeVisible();
    await page.locator('.vocabulary-nav-link').click();
    await expect(entries).toHaveCount(total);
  });
}
