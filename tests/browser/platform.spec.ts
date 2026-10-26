import { test, expect } from '@playwright/test';
const fixture = '/tests/fixtures/platform.html';
test('root opens classroom; trial resumes old answers and all fifteen chapters', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('hogwarts-english-v1')) localStorage.setItem('hogwarts-english-v1', JSON.stringify({ version: 3, data: { step: 7, name: 'Вика', answers: { grammar0: 2 }, scores: { grammar0: { correct: true, first: false, latest: true, skill: 'Grammar' } }, ratings: { reading: 2 } } }));
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome to your English Adventure!' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Мои уроки' })).toBeVisible();
  await expect(page.getByLabel('Выбери своё приключение').locator('option')).toHaveText(['Пробное занятие · В процессе']);
  await page.getByRole('button', { name: 'Продолжить урок', exact: true }).click();
  await expect(page.locator('.section-heading h1')).toHaveText('Grammar spells');
  await expect(page.locator('.nav-item')).toHaveCount(15);
  await page.getByRole('link', { name: 'Главное меню', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Мои уроки' })).toBeVisible();
  await page.getByRole('button', { name: 'Продолжить урок', exact: true }).click();
  await expect(page.locator('.section-heading h1')).toHaveText('Grammar spells');
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem('hogwarts-english-v1')!).data);
  expect(state.scores.grammar0).toEqual({ correct: true, first: false, latest: true, skill: 'Grammar' });
  expect(state.ratings.reading).toBe(2);
});

test('registry adds new lessons to both menus in newest-first order; drafts and resets stay isolated', async ({ page }) => {
  await page.goto(fixture);
  const select = page.getByLabel('Выбери своё приключение');
  await expect(select.locator('option')).toHaveText(['Волшебное чтение · Ещё не начат', 'Слова и открытия · Ещё не начат', 'Пробное занятие · Ещё не начат']);
  await page.getByText('Уроки', { exact: true }).click();
  await expect(page.locator('.lesson-menu li strong')).toHaveText(['Волшебное чтение', 'Слова и открытия', 'Пробное занятие']);
  await page.locator('.lesson-menu').getByRole('link', { name: /Слова и открытия/ }).click();
  await page.getByLabel('Ответ нового урока').fill('word draft');
  await page.getByRole('button', { name: 'Проверить новый урок' }).click();
  await page.getByText('Уроки', { exact: true }).click();
  await page.locator('.lesson-menu').getByRole('link', { name: /Волшебное чтение/ }).click();
  await expect(page.getByLabel('Ответ нового урока')).toHaveValue('');
  await page.getByLabel('Ответ нового урока').fill('reading draft');
  await page.getByText('Уроки', { exact: true }).click();
  await page.locator('.lesson-menu').getByRole('link', { name: /Пробное занятие/ }).click();
  await page.getByRole('button', { name: 'Start our adventure!' }).click();
  await page.getByPlaceholder('Your name', { exact: true }).fill('Вика');
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await page.getByRole('button', { name: 'Restart lesson', exact: true }).click();
  await page.getByRole('link', { name: 'Главное меню', exact: true }).click();
  await expect(page.locator('.lesson-card').filter({ hasText: 'Слова и открытия' })).toContainText('Завершён');
  await select.selectOption('word-quest');
  await page.getByRole('button', { name: 'Продолжить урок', exact: true }).click();
  await expect(page.getByLabel('Ответ нового урока')).toHaveValue('word draft');
  await page.getByRole('button', { name: 'Сбросить этот урок' }).click();
  await page.reload();
  await expect(page.getByLabel('Ответ нового урока')).toHaveValue('');
  await page.getByText('Уроки', { exact: true }).click();
  await page.locator('.lesson-menu').getByRole('link', { name: /Волшебное чтение/ }).click();
  await expect(page.getByLabel('Ответ нового урока')).toHaveValue('reading draft');
});

for (const width of [390, 768, 1280]) test(`classroom and menu fit ${width}px and stay available inside lessons`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome to your English Adventure!' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `work/platform-home-${width}.png`, fullPage: true });
  await page.getByText('Уроки', { exact: true }).click();
  await page.locator('.lesson-menu').getByRole('link', { name: /Пробное занятие/ }).click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.getByText('Уроки', { exact: true })).toBeInViewport();
  await page.getByRole('link', { name: 'Главное меню', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Мои уроки' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
