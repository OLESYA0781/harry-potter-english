import { test, expect } from '@playwright/test';
for (const [width, height] of [[390, 844], [820, 1180], [1180, 820], [1440, 1000]]) {
  test(`Homework 0 inline gaps and written answers at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => {
      if (!localStorage.getItem('hogwarts-english-v1')) localStorage.setItem('hogwarts-english-v1', JSON.stringify({ version: 3, data: {step:0,name:'',answers:{
        '@vika/lesson/lesson-0-homework/magic-sentences/bank/0':'old bank answer',
        '@vika/lesson/lesson-0-homework/magic-sentences/cafe/0':'old cafe answer',
        '@vika/lesson/lesson-0-homework/mystery/friends/0':'old friends answer',
      },scores:{},ratings:{}} }));
    });
    await page.goto('/#/lessons/lesson-0');
    await page.getByRole('link', { name: 'Hogwarts Homework — The Magic of To Be →' }).click();
    await expect(page).toHaveURL(/#\/homework\/0$/);
    await expect(page.getByRole('heading', { name: 'Hogwarts Homework — The Magic of To Be', exact: true })).toBeVisible();
    const fields = page.locator('.hw0-gap');
    await expect(fields).toHaveCount(25);
    await expect(page.getByLabel('Task 1, sentence 7, gap 1', {exact:true})).toHaveValue('');
    await expect(page.getByLabel('Task 1, sentence 8, gap 1', {exact:true})).toHaveValue('');
    await expect(page.getByLabel('Task 4, sentence 6, gap 1', {exact:true})).toHaveValue('');
    for (let i = 0; i < 25; i++) await fields.nth(i).fill(`draft ${i}`);
    const written = page.locator('.hw0-written');
    await expect(written).toHaveCount(16);
    for (let i = 0; i < 16; i++) await written.nth(i).fill(`  Written answer ${i}\nSecond line.  `);
    await page.reload();
    for (let i = 0; i < 16; i++) await expect(written.nth(i)).toHaveValue(`  Written answer ${i}\nSecond line.  `);
    for (let i = 0; i < 25; i++) await expect(fields.nth(i)).toHaveValue(`draft ${i}`);
    const answers = await page.evaluate(() => JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!).state.answers);
    expect(answers['@vika/lesson/lesson-0-homework/magic-sentences/bank/0']).toBe('old bank answer');
    expect(answers['@vika/lesson/lesson-0-homework/magic-sentences/cafe/0']).toBe('old cafe answer');
    expect(answers['@vika/lesson/lesson-0-homework/mystery/friends/0']).toBe('old friends answer');
    await expect(page.getByLabel('Task 1, sentence 10, gap 1', { exact: true })).toHaveValue('draft 10');
    await expect(page.getByLabel('Task 1, sentence 10, gap 2', { exact: true })).toHaveValue('draft 11');
    await expect(page.locator('.hw0-task').filter({ has: page.locator('#hw0-title-2') })).not.toContainText(/near(?: to)?/i);
    await expect(page.locator('.hw0-notebook')).toHaveCount(0);
    for (const [number, count] of [[2, 10], [3, 5], [5, 1]]) {
      const task = page.locator('.hw0-task').filter({ has: page.locator(`#hw0-title-${number}`) });
      await expect(task.locator('textarea')).toHaveCount(count);
      await expect(task).not.toContainText('письменно в тетради');
    }
    await expect(page.locator('.hw0-homework select')).toHaveCount(0);
    await expect(page.locator('.hw0-homework')).not.toContainText(/Correct!|Try again!/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    for (const field of await fields.all()) {
      const box = (await field.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(48);
      expect(box.width).toBeGreaterThanOrEqual(80);
    }
    await page.getByRole('link', { name: '← Lesson 0', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'TO BE — Am / Is / Are', exact: true })).toBeVisible();
    await page.goto('/#/homework/0');
    await expect(fields.first()).toHaveValue('draft 0');
    await expect(written.last()).toHaveValue('  Written answer 15\nSecond line.  ');
  });
}
