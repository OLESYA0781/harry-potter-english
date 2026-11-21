import { expect, test } from '@playwright/test';

const route = '/#/lessons/lesson-3';
const assignments = [
  ['Sophie', 6], ['Emma', 4], ['Jane', 5], ['Anna', 2],
  ['Ron', 1], ['Tom', 3], ['Lily', 7], ['Jack', 8],
] as const;

test('a teacher and learner restore all eight homes by drag and tap, then reopen the saved finale', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1280, height: 1050 });
  await page.goto('/');
  await page.locator('.lesson-menu:not(.homework-menu) summary').click();
  const lesson = page.locator('.lesson-menu:not(.homework-menu) li a').first();
  await expect(lesson).toHaveAttribute('href', '#/lessons/lesson-3');
  await lesson.click();
  await expect(page.getByRole('heading', { name: '1. Warm-up: The Mixed-Up Village' })).toBeVisible();
  await expect(page.locator('.village-house')).toHaveCount(8);
  await expect(page.locator('.village-resident')).toHaveCount(8);
  await expect(page.locator('.village-landscape')).toBeVisible();
  expect(await page.locator('.village-landscape').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);

  await page.getByRole('button', { name: 'Sophie', exact: true }).click();
  await expect(page.getByText('Ask the resident some questions!')).toBeVisible();
  await expect(page.getByRole('button', { name: 'House 6', exact: true })).toHaveAttribute('aria-disabled', 'true');
  await expect(page.getByText('What do you do?', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Interview completed' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Teacher mode', exact: true }).click();

  for (const [name, house] of assignments) {
    const resident = page.getByRole('button', { name, exact: true });
    await resident.click();
    await page.getByRole('button', { name: 'Interview completed' }).click();

    if (name === 'Sophie') {
      const wrongHouse = page.getByRole('button', { name: 'House 4', exact: true });
      await page.locator('.village-board').evaluate(board => board.scrollIntoView({ block: 'start' }));
      const source = (await resident.boundingBox())!;
      await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
      await page.mouse.down();
      await page.mouse.move(source.x + source.width / 2 - 12, source.y + source.height / 2, { steps: 4 });
      await expect(resident).toHaveAttribute('data-dragging', 'true');
      const target = (await wrongHouse.boundingBox())!;
      await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 16 });
      await expect(wrongHouse).toHaveAttribute('data-over', 'true');
      await page.mouse.up();
      await expect(page.getByRole('button', { name: 'House 4, Sophie' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Confirm placement' })).toBeDisabled();
    }
    await page.getByRole('button', { name: `House ${house}`, exact: true }).click();
    await expect(page.getByRole('button', { name: `House ${house}, ${name}`, exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Confirm placement' }).click();
    await expect(page.getByText('The Article Challenge', { exact: true })).toBeVisible();
    if (name === 'Emma') await expect(page.getByText('Emma is an artist.', { exact: true }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Confirm article challenge' }).click();
  }

  await expect(page.getByRole('heading', { name: 'Amazing work! Everyone is home again!' })).toBeVisible();
  await expect(page.locator('.village-window')).toHaveCount(8);
  await page.reload();
  await expect(page.getByText('You are a great detective!')).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Teacher’s Mode' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Back to Lesson 3' }).click();
  await expect(page.getByRole('region', { name: 'Lesson 3 sections' })).toBeVisible();
  await page.getByRole('button', { name: '1. Warm-up: The Mixed-Up Village' }).click();
  await expect(page.getByText('You are a great detective!')).toBeVisible();
});

test('phone tap placement survives reload and can be reset by the teacher', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 360, height: 760 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto(route);
  const map = page.getByRole('region', { name: 'Карта деревни' });
  expect(await map.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Teacher mode', exact: true }).tap();
  await page.getByRole('button', { name: 'Jack', exact: true }).tap();
  await page.getByRole('button', { name: 'Interview completed' }).tap();
  await page.getByRole('button', { name: 'К карте · Jack' }).tap();
  await map.evaluate(element => { element.scrollLeft = element.scrollWidth; });
  await page.getByRole('button', { name: 'House 8', exact: true }).tap();
  await expect(page.getByRole('button', { name: 'House 8, Jack' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: 'House 8, Jack' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Teacher mode', exact: true }).tap();
  await page.getByRole('button', { name: 'Reset placement', exact: true }).tap();
  await expect(page.getByRole('button', { name: 'House 8', exact: true })).toHaveAttribute('aria-disabled', 'false');
  await page.getByRole('button', { name: 'Restart investigation' }).tap();
  await page.getByRole('button', { name: 'Начать заново' }).tap();
  await expect(page.getByRole('button', { name: 'House 8', exact: true })).toHaveAttribute('aria-disabled', 'true');
  await context.close();
});
