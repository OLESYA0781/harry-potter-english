import { test, expect } from '@playwright/test';
for (const [width, height] of [[390, 844], [820, 1180], [1180, 820], [1440, 1000]]) {
  test(`Homework 0 inline drafts and notebook tasks at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => {
      if (!localStorage.getItem('hogwarts-english-v1')) localStorage.setItem('hogwarts-english-v1', JSON.stringify({ version: 3, data: {step:0,name:'',answers:{
        '@vika/lesson/lesson-0-homework/magic-sentences/bank/0':'old bank answer',
        '@vika/lesson/lesson-0-homework/magic-sentences/cafe/0':'old cafe answer',
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
    for (let i = 0; i < 25; i++) await fields.nth(i).fill(`draft ${i}`);
    await page.reload();
    for (let i = 0; i < 25; i++) await expect(fields.nth(i)).toHaveValue(`draft ${i}`);
    const answers = await page.evaluate(() => JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!).state.answers);
    expect(answers['@vika/lesson/lesson-0-homework/magic-sentences/bank/0']).toBe('old bank answer');
    expect(answers['@vika/lesson/lesson-0-homework/magic-sentences/cafe/0']).toBe('old cafe answer');
    await expect(page.getByLabel('Task 1, sentence 10, gap 1', { exact: true })).toHaveValue('draft 10');
    await expect(page.getByLabel('Task 1, sentence 10, gap 2', { exact: true })).toHaveValue('draft 11');
    await expect(page.locator('.hw0-task').filter({ has: page.locator('#hw0-title-2') })).not.toContainText(/near(?: to)?/i);
    await expect(page.locator('.hw0-notebook')).toHaveCount(3);
    for (const number of [2, 3, 5]) {
      const task = page.locator('.hw0-task').filter({ has: page.locator(`#hw0-title-${number}`) });
      await expect(task.locator('input,textarea')).toHaveCount(0);
      await expect(task).toContainText('письменно в тетради');
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
  });
}
