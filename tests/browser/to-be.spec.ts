import {test,expect} from '@playwright/test';
for(const width of [390,768,1024,1366]) test(`one To Be slide has three connected branches at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000});await page.goto('/');
  await expect(page.getByLabel('Выбери своё приключение').locator('option')).toHaveText(['Lesson 0 — To Be · Ещё не начат','Lesson 1 — Present Simple · Ещё не начат','Trial Lesson · Ещё не начат']);
  await page.getByRole('button',{name:'Начать урок',exact:true}).click();
  await expect(page).toHaveURL(/#\/lessons\/lesson-0$/);
  await expect(page.getByRole('heading',{name:'TO BE',exact:true})).toHaveCount(1);
  await expect(page.locator('.to-be-source')).toHaveText('TO BE');
  await expect(page.locator('.to-be-arrows > path')).toHaveCount(3);
  await expect(page.locator('.to-be-group')).toHaveCount(3);
  await expect(page.locator('.to-be-group h2')).toHaveText(['I','HE / SHE / IT','YOU / WE / THEY']);
  await expect(page.locator('.to-be-group > strong')).toHaveText(['AM','IS','ARE']);
  const boxes=await page.locator('.to-be-group').evaluateAll(elements=>elements.map(e=>({x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y})));
  expect(boxes[1].x).toBeGreaterThan(boxes[0].x);expect(boxes[2].x).toBeGreaterThan(boxes[1].x);
  expect(Math.abs(boxes[0].y-boxes[2].y)).toBeLessThan(1);
  await expect(page.locator('.to-be-lesson textarea, .to-be-lesson input, .to-be-lesson button')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`work/to-be-${width}.png`,fullPage:true});
});
