import { expect, test } from '@playwright/test';

for (const width of [320, 390, 1440]) {
  test(`Lesson 2 notebook tasks and teacher answers at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    const menu = page.locator('.homework-menu');
    await menu.locator('summary').click();
    const latest = menu.getByRole('link').first();
    await expect(latest).toHaveAttribute('href', '#/homework/2');
    await latest.click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Homework — Lesson 2: The Hogwarts Investigation');

    const tasks = page.locator('main section');
    await expect(tasks.getByRole('heading', { level: 2 })).toHaveText([
      '1Task 1. Question Words — Разминка',
      '2Task 2. The Wrong Questions — Найди ошибки',
      '3Task 3. The Secret Answers — Составь вопросы',
      '4Task 4. The Article Mystery — Тайна артиклей',
      '5Task 5. The Witness Statements — Показания свидетелей',
      '6Task 6. The Grammar Detective — Исправь письмо',
    ]);
    await expect(tasks.nth(1).locator('ol > li')).toHaveCount(12);
    await expect(tasks.nth(2).locator('ol > li')).toHaveCount(10);
    await expect(tasks.nth(3).locator('.hw2-blank')).toHaveText(
      Array.from({ length: 14 }, (_, i) => '(' + (i + 1) + ') ___'),
    );
    await expect(tasks.nth(3).getByText(/library is big/)).toBeVisible();
    await expect(tasks.nth(4).locator('article')).toHaveCount(3);
    await expect(tasks.nth(4).locator('ol > li')).toHaveCount(8);
    await expect(tasks.locator('input, textarea, select, [draggable="true"], [contenteditable="true"]')).toHaveCount(0);
    for (const picture of await page.locator('main img').all()) {
      await picture.scrollIntoViewIfNeeded();
      await expect.poll(() => picture.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

    await expect(tasks.getByRole('button', { name: 'Выполнено', exact: true })).toHaveCount(0);
    await expect(page.locator('main img')).toHaveCount(3);
    await expect(tasks.nth(4).getByText(/Если утверждение неверное/)).toHaveCount(0);
    const teacherPanels = tasks.getByRole('complementary', { name: 'Teacher’s Mode' });
    await expect(teacherPanels).toHaveCount(0);
    await page.getByRole('button', { name: 'Teacher mode', exact: true }).click();
    await expect(teacherPanels).toHaveCount(6);
    for (const [index, answer] of [
      '5 — How', 'Does the bus driver work at a stadium?', 'Where are they?',
      '14 — —', 'False — The doctor starts work at eight.', 'What does she do?',
    ].entries()) {
      await expect(teacherPanels.nth(index).getByText(answer, { exact: true })).toBeVisible();
    }
    await page.getByRole('button', { name: 'Exit teacher mode', exact: true }).click();
    await expect(teacherPanels).toHaveCount(0);
  });
}
