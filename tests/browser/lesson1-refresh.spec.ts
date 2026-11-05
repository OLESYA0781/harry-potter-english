import { test, expect, type Page } from '@playwright/test';
async function topic(page: Page, id: string, width: number) {
  if (width <= 600) await page.getByLabel('Choose Lesson 1 topic').selectOption(id);
  else await page.getByRole('navigation', { name: 'Lesson 1 topics' }).getByRole('button').filter({ hasText: ({ transport: 'Means of Transport', affirmative: 'Affirmative Sentences', frequency: 'Adverbs of Frequency', questions: 'Questions', translations: 'Переведи предложение на английский', negative: 'Negative Sentences' } as Record<string, string>)[id] }).click();
}
for (const width of [390, 820]) test(`two picture-only randomizers exhaust decks without repeats at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto('/#/lessons/lesson-1'); await topic(page, 'transport', width);
  await expect(page.locator('.ps2-panel h2')).toHaveText('How do we travel?');
  await expect(page.locator('.ps2-by-badge')).toHaveText('By …');
  await expect(page.locator('.ps2-panel .ps2-word-grid')).toHaveCount(0);
  await page.getByRole('button', { name: 'Next →', exact: true }).click();
  const cards = page.locator('.ps2-randomizers button');
  await expect(cards).toHaveCount(2);
  expect((await page.locator('.ps2-randomizers').innerText()).trim()).toBe('');
  const images = page.locator('.ps2-randomizers img');
  const sets: string[][] = [[], []];
  for (let draw = 0; draw < 10; draw++) {
    for (let i = 0; i < 2; i++) {
      sets[i].push((await images.nth(i).getAttribute('alt'))!);
      if (draw < 9) await cards.nth(i).click();
    }
  }
  expect(new Set(sets[0]).size).toBe(10); expect(new Set(sets[1]).size).toBe(10);
  await page.reload();
  await expect(images.nth(0)).toHaveAttribute('alt', sets[0][9]);
  await expect(images.nth(1)).toHaveAttribute('alt', sets[1][9]);
  await cards.nth(0).click();
  await expect(images.nth(0)).not.toHaveAttribute('alt', sets[0][9]);
  await expect(images.nth(1)).toHaveAttribute('alt', sets[1][9]);
  await page.getByRole('button', { name: 'Next →', exact: true }).click();
  await expect(page.locator('.ps2-heading h1')).toHaveText('Negative Sentences');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
for (const width of [390, 1366]) test(`translations, game grammar table and block-seven journeys at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto('/#/lessons/lesson-1'); await topic(page, 'affirmative', width);
  const translation = 'affirmative/affirm-write/affirm-translate-01';
  if(width<=600) await page.getByLabel('Choose Lesson 1 section').selectOption(translation);
  else await page.locator('.ps2-subnav a').filter({hasText:'Переведи предложение на английский · 1–4'}).click();
  await expect(page.locator('.ps2-panel h2')).toHaveText('Переведи предложение на английский');
  await page.getByLabel('Врач работает в больнице.', { exact: true }).fill('  The doctor works at the hospital.  ');
  await page.getByRole('button', { name: 'My Vocabulary', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Jobs', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('ветеринар');
  await page.getByRole('button', { name: 'Закрыть словарь' }).click();
  await topic(page, 'questions', width);
  const table = page.locator('.ps2-helper-table'); await expect(table).toBeVisible();
  await expect(table.locator('.ps2-helper-token')).toHaveText(['Do', 'Does']);
  await expect(page.locator('.ps2-panel')).not.toContainText('Magic — магия');
  expect(await table.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await topic(page, 'negative', width); await expect(page.locator('.ps2-panel')).not.toContainText('Spider — паук');
  await topic(page, 'frequency', width);
  await expect(page.locator('.ps2-heading > span')).toHaveText('07');
  for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Next →', exact: true }).click();
  await expect(page.locator('.ps2-panel h2')).toHaveText('Write your journeys');
  await expect(page.locator('.ps2-journey-pair')).toHaveCount(2);
  const inputs = page.locator('.ps2-journey-pair textarea'); await expect(inputs).toHaveCount(4);
  await inputs.nth(0).fill('  How do you usually get to school?\n ');
  await inputs.nth(1).fill('I usually go to school by bus.');
  await page.reload();
  await expect(inputs.nth(0)).toHaveValue('  How do you usually get to school?\n ');
  await expect(inputs.nth(1)).toHaveValue('I usually go to school by bus.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
for (const width of [390,1366]) test(`every topic offers direct subsection navigation at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.goto('/#/lessons/lesson-1');
 const {topics,pages}=await import('../../src/lessons/presentSimple/course');
 for(const item of topics){
  if(width<=600)await page.getByLabel('Choose Lesson 1 topic').selectOption(item.id);
  else {const button=page.getByRole('navigation',{name:'Lesson 1 topics'}).getByRole('button').filter({hasText:item.title});if(await button.getAttribute('aria-expanded')!=='true')await button.click();}
  const sections=pages.filter(part=>part.topicId===item.id);
  const target=sections[sections.length-1];
  if(width<=600){await expect(page.getByLabel('Choose Lesson 1 section').locator('option')).toHaveCount(sections.length);await page.getByLabel('Choose Lesson 1 section').selectOption(target.id);}
  else {await expect(page.locator('.ps2-subnav a')).toHaveCount(sections.length);await page.locator('.ps2-subnav a').last().click();}
  await expect(page.locator('.ps2-panel h2')).toHaveText(target.unit.title);
  await page.reload();await expect(page.locator('.ps2-panel h2')).toHaveText(target.unit.title);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
});
test('expanded sidebar scrolls to every remaining topic on a short tablet viewport',async({page})=>{
 await page.setViewportSize({width:820,height:700});await page.goto('/#/lessons/lesson-1');
 const nav=page.getByRole('navigation',{name:'Lesson 1 topics'});
 await nav.getByRole('button').filter({hasText:'When Do We Use'}).click();
 const last=nav.getByRole('button').filter({hasText:'Present Simple vs To Be'});
 await last.scrollIntoViewIfNeeded();await expect(last).toBeInViewport();await last.click();
 await expect(page.locator('.ps2-heading h1')).toHaveText('Present Simple vs To Be');
 await expect(nav.getByRole('button')).toHaveCount(10);
 expect(await nav.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);
});
test('active topic toggles subsections without resetting the exercise or draft',async({page})=>{
 await page.setViewportSize({width:1366,height:900});await page.goto('/#/lessons/lesson-1');
 const nav=page.getByRole('navigation',{name:'Lesson 1 topics'});
 const topic=nav.getByRole('button').filter({hasText:'Affirmative Sentences'});await topic.click();
 await page.locator('.ps2-subnav a').filter({hasText:'Переведи предложение на английский · 1–4'}).click();
 const input=page.getByLabel('Врач работает в больнице.',{exact:true});await input.fill('The doctor works at the hospital.');
 await topic.click();await expect(topic).toHaveAttribute('aria-expanded','false');await expect(page.locator('.ps2-subnav')).toHaveCount(0);
 await expect(input).toHaveValue('The doctor works at the hospital.');
 await topic.click();await expect(topic).toHaveAttribute('aria-expanded','true');await expect(page.locator('.ps2-subnav')).toBeVisible();
 await expect(input).toHaveValue('The doctor works at the hospital.');
});
