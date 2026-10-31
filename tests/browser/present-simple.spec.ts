import { test, expect } from '@playwright/test';
const route='/#/lessons/lesson-1';
async function stage(page: import('@playwright/test').Page,index:number,width=1280) {
  if(width<=600) await page.getByLabel('Choose Lesson 1 stage').selectOption(String(index));
  else await page.getByRole('navigation',{name:'Lesson 1 stages'}).getByRole('button').nth(index).click();
}
test('first menu entry; nine stages and six grammar slides; notes restore independently',async({page})=>{
  await page.goto('/');
  await expect(page.getByLabel('Выбери своё приключение').locator('option').nth(0)).toContainText('Lesson 1 — Present Simple');
  await page.getByLabel('Выбери своё приключение').selectOption('lesson-1');
  await page.getByRole('button',{name:'Начать урок',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Welcome to Hogwarts!',exact:true})).toBeVisible();
  await expect(page.getByRole('navigation',{name:'Lesson 1 stages'}).getByRole('button')).toHaveCount(9);
  await expect(page.getByRole('heading',{name:'Hello!',exact:true})).toBeVisible();
  await expect(page.getByText('George: Hi, I’m George Nichols.',{exact:false})).toBeVisible();
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
  await expect(page.getByRole('heading',{name:'Exercise 3',exact:true,level:2})).toBeVisible();
  await expect(page.getByText('Ожидаются оригинальные материалы')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Monday',exact:true})).toBeVisible();
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
    for(const word of await page.locator('.ps-highlight').all()){
      await expect(word).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
      await expect(word).toHaveCSS('padding','0px');
      await expect(word).toHaveCSS('font-weight','800');
    }
    if(i===4){
      const answers=page.locator('.ps-short-answers p');
      for(const offset of [0,2]){
        const yes=await answers.nth(offset).boundingBox(),no=await answers.nth(offset+1).boundingBox();
        expect(Math.abs(yes!.x-no!.x)).toBeLessThan(1);
        expect(no!.y).toBeGreaterThanOrEqual(yes!.y+yes!.height);
      }
    }
    if(i===5){
      await expect(page.locator('.ps-cheat-head')).toHaveCSS('background-color','rgb(229, 237, 219)');
      await expect(page.locator('.ps-cheat-row').first()).toHaveCSS('background-color','rgb(255, 249, 231)');
      await expect(page.locator('.ps-cheat-row').last()).toHaveCSS('background-color','rgb(245, 240, 231)');
    }
    if(i<5) await page.getByRole('button',{name:'Next slide →',exact:true}).click();
  }
  await page.screenshot({path:`work/present-simple-${width}.png`,fullPage:true});
  for(let i=0;i<9;i++) {await stage(page,i,width);await expect(page.locator('.ps-heading h1')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});

test('all original textbook tasks accept drafts and complete only after the responses are filled',async({page})=>{
 await page.goto(route);
 const intro=page.locator('.ps-book-task textarea');await expect(intro).toHaveCount(4);
 for(let i=0;i<4;i++)await intro.nth(i).fill(`  Intro draft ${i}.\n `);
 await stage(page,1);
 for(let i=0;i<5;i++)await page.getByRole('button',{name:'Next slide →',exact:true}).click();
 await page.getByLabel('Мои заметки по грамматике').fill('Keep old notes');
 const counts=[5,1,4,1,4,7,5];
 for(let step=2;step<=8;step++){
  await stage(page,step);
  const fields=page.locator('.ps-book-task textarea');await expect(fields).toHaveCount(counts[step-2]);
  if(step===2)await page.getByRole('button',{name:'Monday',exact:true}).click();
  if(step===5 || step===6){const image=page.locator('.ps-book-image');await expect(image).toBeVisible();expect(await image.evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);}
  for(let i=0;i<counts[step-2];i++)await fields.nth(i).fill(`  My own wrong answer ${step}:${i}.\n `);
  await expect(page.locator('.ps-panel')).not.toContainText(/Correct!|Try again!|Ожидаются оригинальные материалы/);
 }
 await expect(page.getByRole('heading',{name:'Lesson 1 Complete!',exact:true})).toBeVisible();
 await page.reload();await expect(page.locator('.ps-book-task textarea').first()).toHaveValue('  My own wrong answer 8:0.\n ');
 await stage(page,2);await expect(page.getByRole('button',{name:'Monday',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('.ps-book-task textarea').first()).toHaveValue('  My own wrong answer 2:0.\n ');
 await stage(page,0);await expect(page.locator('.ps-book-task textarea').first()).toHaveValue('  Intro draft 0.\n ');
 await expect(page.locator('.ps-panel')).not.toContainText('Go Getter');
 await page.getByRole('button',{name:'Teacher mode',exact:true}).click();await expect(page.locator('.ps-panel')).toContainText('Go Getter');
});
