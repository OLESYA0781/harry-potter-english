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

async function toStage(page:import('@playwright/test').Page,index:number,width=1280) {
 if(width<=600) await page.getByLabel('Choose Lesson 0 stage').selectOption(String(index));
 else await page.getByRole('navigation',{name:'Lesson 0 stages'}).getByRole('button').nth(index).click();
}
test('expanded To Be lesson preserves original answers, identifies adaptations and never grades',async({page})=>{
 await page.goto('/#/lessons/lesson-0');
 await expect(page.getByRole('navigation',{name:'Lesson 0 stages'}).getByRole('button')).toHaveCount(13);
 await toStage(page,5);
 await expect(page.locator('.tb-task')).toHaveCount(9);
 await page.getByLabel('I ... a pupil.',{exact:true}).fill('  is?  ');
 await toStage(page,6);await expect(page.getByText(/Адаптация предложений упражнения 157/)).toBeVisible();
 await expect(page.locator('.tb-task')).toHaveCount(6);
 await page.getByLabel('I am a pupil.',{exact:true}).fill('I no pupil.\n');
 await toStage(page,7);await page.getByLabel('I am a pupil.',{exact:true}).fill('Am I a pupil??');
 await toStage(page,8);await expect(page.getByText(/не найдено/)).toBeVisible();await expect(page.locator('.tb-panel input,.tb-panel textarea')).toHaveCount(0);
 await toStage(page,9);await expect(page.locator('.tb-reading input')).toHaveCount(8);await page.getByLabel('Пропуск 1',{exact:true}).fill('am');
 await toStage(page,10);await expect(page.locator('.tb-task')).toHaveCount(6);
 await toStage(page,11);await expect(page.getByText('Авторское задание — не из учебника.')).toBeVisible();await expect(page.locator('.tb-panel textarea')).toHaveCount(7);await page.getByLabel('Утверждение 1',{exact:true}).fill('  I is Vika.\n ');
 await page.reload();await expect(page.getByLabel('Утверждение 1',{exact:true})).toHaveValue('  I is Vika.\n ');
 await toStage(page,5);await expect(page.getByLabel('I ... a pupil.',{exact:true})).toHaveValue('  is?  ');
 await toStage(page,6);await expect(page.getByLabel('I am a pupil.',{exact:true})).toHaveValue('I no pupil.\n');
 await toStage(page,7);await expect(page.getByLabel('I am a pupil.',{exact:true})).toHaveValue('Am I a pupil??');
 await toStage(page,9);await expect(page.getByLabel('Пропуск 1',{exact:true})).toHaveValue('am');
 await expect(page.getByText(/Correct!|Try again!/)).toHaveCount(0);
 await toStage(page,12);await expect(page.getByRole('button',{name:'Next →',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'← Back',exact:true}).click();await expect(page.getByLabel('Утверждение 1',{exact:true})).toHaveValue('  I is Vika.\n ');
});
for(const width of [390,768,1024,1366]) test(`all To Be theory and practice sections fit ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:950});await page.goto('/#/lessons/lesson-0');
 for(let i=0;i<13;i++){await toStage(page,i,width);await expect(page.locator('.tb-heading h1')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.screenshot({path:`work/to-be-expanded-${width}.png`,fullPage:true});
});
