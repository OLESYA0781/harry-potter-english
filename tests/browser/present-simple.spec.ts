import { test, expect } from '@playwright/test';
const route='/#/lessons/lesson-1';
async function stage(page: import('@playwright/test').Page,index:number,width=1280) {
  if(width<=600) await page.getByLabel('Choose Lesson 1 stage').selectOption(String(index));
  else await page.getByRole('navigation',{name:'Lesson 1 stages'}).getByRole('button').nth(index).click();
}
test('first menu entry; nine stages and six grammar slides; notes restore independently',async({page})=>{
  await page.goto('/');
  await expect(page.getByLabel('Выбери своё приключение').locator('option').nth(1)).toContainText('Lesson 1 — Present Simple');
  await page.getByLabel('Выбери своё приключение').selectOption('lesson-1');
  await page.getByRole('button',{name:'Начать урок',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Welcome to Hogwarts!',exact:true})).toBeVisible();
  await expect(page.getByRole('navigation',{name:'Lesson 1 stages'}).getByRole('button')).toHaveCount(9);
  await expect(page.getByText('Intro Video 0.1 — файл ожидается')).toBeVisible();
  await expect(page.locator('audio,video')).toHaveCount(0);
  await stage(page,1);
  const titles=['When do we use Present Simple?','Signal Words','Affirmative Sentences','Negative Sentences','Questions','Grammar Cheat Sheet'];
  for(let i=0;i<6;i++) {
    await expect(page.getByRole('heading',{name:titles[i],exact:true})).toBeVisible();
    if(i<5) await page.getByRole('button',{name:'Next slide →',exact:true}).click();
  }
  await page.getByLabel('Мои заметки по грамматике').fill('  She play?\nDon’t change my notes.  ');
  await page.reload();
  await expect(page.getByRole('heading',{name:'Grammar Cheat Sheet',exact:true})).toBeVisible();
  await expect(page.getByLabel('Мои заметки по грамматике')).toHaveValue('  She play?\nDon’t change my notes.  ');
  await page.getByRole('button',{name:"Continue to Student's Book",exact:true}).click();
  await expect(page.getByRole('heading',{name:'Student’s Book · page 5 · Exercise 3',exact:true})).toBeVisible();
  await expect(page.getByText('Ожидаются оригинальные материалы')).toBeVisible();
  for(let i=3;i<=8;i++) { await page.getByRole('button',{name:'Next →',exact:true}).click(); await expect(page.locator('.ps-heading h1')).toHaveText(`Exercise ${i+1}`); }
  await expect(page.getByRole('heading',{name:'Lesson 1 Complete!',exact:true})).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Next →',exact:true})).toBeDisabled();
  await page.getByRole('link',{name:'Главное меню',exact:true}).click();
  await page.getByLabel('Выбери своё приключение').selectOption('trial');
  await page.getByRole('button',{name:'Начать урок',exact:true}).click();
  await expect(page.locator('.nav-item')).toHaveCount(12);
  await page.getByRole('tab',{name:'Homework',exact:true}).click();
  await expect(page.getByRole('heading',{name:'New Words',exact:true})).toBeVisible();
});
for(const width of [390,768,1024,1366]) test(`grammar and pending stages fit ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:950});await page.goto(route);await stage(page,1,width);
  for(let i=0;i<6;i++) {
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    if(i<5) await page.getByRole('button',{name:'Next slide →',exact:true}).click();
  }
  await page.screenshot({path:`work/present-simple-${width}.png`,fullPage:true});
  for(let i=0;i<9;i++) {await stage(page,i,width);await expect(page.locator('.ps-heading h1')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
