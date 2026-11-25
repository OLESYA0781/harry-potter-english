import { expect, test } from '@playwright/test';

for (const width of [320, 390, 1440]) {
  test(`Lesson 3 homework and progress at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    const menu = page.locator('.homework-menu');
    await menu.locator('summary').click();
    await expect(menu.getByRole('link').first()).toHaveAttribute('href', '#/homework/3');
    await menu.getByRole('link').first().click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Homework — Lesson 3');

    const tasks = page.locator('main section');
    await expect(tasks.getByRole('heading', { level: 2 })).toHaveText([
      'Part 1A. Articles', 'Part 1B. Singular and Plural',
      'Part 2. Put the Words in the Correct Order', 'Part 3. Find and Correct the Mistakes',
      'Part 4A. Listening — Match', 'Part 4B. Listening — Complete the Table',
      'Part 4C. Listening — True or False', 'Part 5. Ask a Question',
    ]);
    for (const [index, count] of [[0, 15], [1, 10], [2, 12], [3, 15], [6, 6], [7, 15]]) {
      await expect(tasks.nth(index).locator('.hw1-numbered > li')).toHaveCount(count);
    }
    for (const index of [1, 2, 3, 7]) {
      const task = tasks.nth(index);
      await expect(task.locator('input:not([type=checkbox]), textarea, select, [draggable=true], [contenteditable=true]')).toHaveCount(0);
      await expect(task.getByText('Do the task in your notebook.', { exact: false })).toBeVisible();
      await task.getByRole('checkbox', { name: 'Done in my notebook' }).check();
    }
    await expect(tasks.first().getByRole('combobox')).toHaveCount(16);
    const articleOne = tasks.first().getByRole('combobox', { name: 'Sentence 14, article 1' });
    const articleTwo = tasks.first().getByRole('combobox', { name: 'Sentence 14, article 2' });
    await articleOne.selectOption('an');
    await articleTwo.selectOption('a');

    const pictures = tasks.nth(4).locator('img');
    await expect(pictures).toHaveCount(4);
    for (const picture of await pictures.all()) {
      await picture.scrollIntoViewIfNeeded();
      await expect.poll(() => picture.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(512);
      expect((await picture.boundingBox())!.width).toBeGreaterThanOrEqual(110);
    }
    const players = page.locator('main audio');
    await expect(players).toHaveCount(3);
    for (const player of await players.all()) {
      await expect(player).toHaveJSProperty('controls', true);
      await expect(player).toHaveJSProperty('autoplay', false);
    }

    const match = tasks.nth(4).getByRole('combobox', { name: 'Ralph' });
    await match.selectOption('B');
    const table = tasks.nth(5);
    const job = table.getByRole('combobox', { name: 'Ralph — Job' });
    await job.selectOption('police officer');
    await job.selectOption('');
    await expect(job).toHaveValue('');
    await table.getByRole('button', { name: 'digital designer' }).click();
    await table.getByRole('button', { name: 'Put digital designer in Ralph — Job' }).click();
    await expect(job).toHaveValue('digital designer');
    if (width === 1440) {
      const from = table.getByRole('combobox', { name: 'Yolanda — From' });
      await table.getByRole('button', { name: 'Manaus' }).dragTo(from);
      await expect(from).toHaveValue('Manaus');
    }
    const answer = tasks.nth(6).getByRole('combobox', { name: 'Statement 6, True or False' });
    await answer.selectOption('False');

    await page.reload();
    for (const check of await page.getByRole('checkbox', { name: 'Done in my notebook' }).all()) {
      await expect(check).toBeChecked();
    }
    await expect(articleOne).toHaveValue('an');
    await expect(articleTwo).toHaveValue('a');
    await expect(match).toHaveValue('B');
    await expect(job).toHaveValue('digital designer');
    await expect(answer).toHaveValue('False');

    const panels = page.getByRole('complementary', { name: 'Teacher’s Mode' });
    await expect(panels).toHaveCount(0);
    await page.getByRole('button', { name: 'Teacher mode', exact: true }).click();
    await expect(panels).toHaveCount(8);
    for (const [index, count] of [[0, 15], [1, 10], [2, 12], [3, 15], [7, 15]]) {
      await expect(panels.nth(index).locator('ol > li')).toHaveCount(count);
    }
    await expect(panels.nth(7).locator('ul > li')).toHaveCount(45);
    for (const index of [4, 5, 6]) {
      await expect(panels.nth(index).locator('ol')).toHaveCount(0);
    }
    await expect(page.getByText(/Grammar Reminder|Correct!|Try again!/)).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.getByRole('button', { name: 'Exit teacher mode', exact: true }).click();
    await expect(panels).toHaveCount(0);
  });
}

test('restarting Trial Lesson preserves Lesson 3 homework answers', async ({ page }) => {
  await page.goto('/#/homework/3');
  const article = page.getByRole('combobox', { name: 'Sentence 1, article 1', exact: true });
  await article.selectOption('an');
  const mark = page.getByRole('checkbox', { name: 'Done in my notebook' }).first();
  await mark.check();

  await page.goto('/#/lessons/trial');
  await page.getByRole('button', { name: 'Start our adventure!' }).click();
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await page.getByRole('button', { name: 'Restart lesson', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Welcome to Hogwarts!' })).toBeVisible();

  await page.goto('/#/homework/3');
  await expect(article).toHaveValue('an');
  await expect(mark).toBeChecked();
});
