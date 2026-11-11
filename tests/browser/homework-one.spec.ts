import {test,expect} from '@playwright/test';
import {agencyDescriptions,agencyJobs} from '../../src/lessons/homeworkOne/data';
for(const width of [390,820,1180,1440])test(`seven homework tasks fit ${width}px, notebook tasks have no answer fields, and drafts persist`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.goto('/#/homework/1');
 await expect(page.locator('.hw1-task')).toHaveCount(7);await expect(page.locator('.hw1-description')).toHaveCount(15);await expect(page.locator('.hw1-job-bank .hw1-job-card')).toHaveCount(15);
 for(const number of [2,3,5,6,7]){const task=page.locator(`#hw1-task-${number}`);await expect(task).toContainText('WRITE IN YOUR NOTEBOOK');await expect(task.locator('textarea,input[type=text]')).toHaveCount(0);}
 await expect(page.locator('#hw1-task-2 .hw1-numbered li')).toHaveCount(10);await expect(page.locator('#hw1-task-3 .hw1-numbered li')).toHaveCount(10);
 await expect(page.locator('#hw1-task-4 textarea')).toHaveCount(8);await expect(page.locator('#hw1-task-6 .hw1-numbered li')).toHaveCount(5);await expect(page.locator('#hw1-task-7 .hw1-numbered li')).toHaveCount(6);
 await expect(page.locator('#hw1-task-7 .hw1-field-prompt strong,#hw1-task-7 .hw1-field-prompt mark,#hw1-task-7 .hw1-field-prompt u')).toHaveCount(0);
 await expect(page.locator('.hw1-extra-profiles article')).toHaveCount(2);await expect(page.locator('.hw1-extra-profiles')).toContainText('chef');await expect(page.locator('.hw1-extra-profiles')).toContainText('pilot');await expect(page.locator('.hw1-anna')).toContainText('9 a.m.');await expect(page.locator('.hw1-anna')).toContainText('a green coat');
 const inputs=page.locator('.hw1-written-card textarea');for(let i=0;i<await inputs.count();i++)await inputs.nth(i).fill(`  My answer ${i}!\n `);
 await page.getByRole('button',{name:'Select pilot',exact:true}).click();await page.getByRole('button',{name:'Place selected job in description 1',exact:true}).click();
 await page.reload();await expect(page.locator('[data-slot=paint]')).toContainText('pilot');await expect(page.locator('.hw1-job-bank .hw1-job-card')).toHaveCount(14);
 for(let i=0;i<await inputs.count();i++)await expect(inputs.nth(i)).toHaveValue(`  My answer ${i}!\n `);
 await expect(page.locator('.hw1-homework')).not.toContainText(/Correct!|Try again!/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await expect(page.locator('.hw1-task-nav')).toHaveCount(0);await expect(page.locator('.hw1-notebook-done')).toHaveCount(0);await expect(page.locator('.hw1-task').last()).toHaveAttribute('id','hw1-task-3');await expect(page.locator('.hw1-question-translation')).toHaveCount(8);await page.screenshot({path:`work/homework-one-${width}.png`,fullPage:true});
});
test('tap/keyboard placement is unique, reversible, and does not grade incorrect matches',async({page})=>{
 await page.goto('/#/homework/1');const artist=page.getByRole('button',{name:'Select artist',exact:true});await artist.focus();await page.keyboard.press('Enter');
 await page.getByRole('button',{name:'Place selected job in description 2',exact:true}).click();await expect(page.locator('[data-slot=houses]')).toContainText('artist');
 await artist.click();await page.getByRole('button',{name:'Place selected job in description 3',exact:true}).click();await expect(page.locator('[data-slot=houses] .hw1-job-card')).toHaveCount(0);await expect(page.locator('[data-slot=bus] .hw1-job-card')).toHaveCount(1);
 await page.getByRole('button',{name:'Return artist to the bank',exact:true}).click();await expect(page.locator('.hw1-job-bank')).toContainText('artist');await expect(page.locator('.hw1-job-bank .hw1-job-card')).toHaveCount(15);
 for(let i=0;i<agencyJobs.length;i++){await page.getByRole('button',{name:`Select ${agencyJobs[i].label}`,exact:true}).click();await page.getByRole('button',{name:`Place selected job in description ${15-i}`,exact:true}).click();}
 await expect(page.locator('.hw1-job-bank .hw1-job-card')).toHaveCount(0);await expect(page.locator('.hw1-placed .hw1-job-card')).toHaveCount(15);
 await expect(page.locator('.hw1-task-nav')).toHaveCount(0);
 await expect(page.locator('.hw1-homework')).not.toContainText(/Correct!|Try again!/);
});
test('actual mouse drag moves a card to a description and back to the bank',async({page})=>{
 await page.setViewportSize({width:1440,height:1000});await page.goto('/#/homework/1');
 await page.locator('.hw1-agency-grid').scrollIntoViewIfNeeded();
 const source=page.locator('.hw1-job-bank .hw1-job-card').first(),label=(await source.innerText()).trim();await source.scrollIntoViewIfNeeded();
 const target=page.locator('[data-slot=paint]');await target.scrollIntoViewIfNeeded();const a=await source.boundingBox(),b=await target.boundingBox();
 await page.mouse.move(a!.x+a!.width/2,a!.y+a!.height/2);await page.mouse.down();await page.mouse.move(a!.x+a!.width/2+10,a!.y+a!.height/2,{steps:4});await page.mouse.move(b!.x+b!.width/2,b!.y+b!.height/2,{steps:16});await page.mouse.up();
 await expect(target.locator('.hw1-job-card')).toHaveText(label);
 const placed=target.locator('.hw1-job-card'),bank=page.locator('.hw1-job-bank'),p=await placed.boundingBox(),r=await bank.boundingBox();
 await page.mouse.move(p!.x+p!.width/2,p!.y+p!.height/2);await page.mouse.down();await page.mouse.move(p!.x+p!.width/2+10,p!.y+p!.height/2,{steps:4});await page.mouse.move(r!.x+r!.width/2,r!.y+30,{steps:16});await page.mouse.up();
 await expect(target.locator('.hw1-job-card')).toHaveCount(0);await expect(bank.locator('.hw1-job-card')).toHaveCount(15);
});
test('actual long-press touch drag works on a phone',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{const page=await context.newPage();await page.goto('/#/homework/1');const source=page.locator('.hw1-job-bank .hw1-job-card').last();const label=(await source.innerText()).trim();await source.scrollIntoViewIfNeeded();
  const initialBox=await source.boundingBox();await page.evaluate(y=>window.scrollBy(0,y-260),initialBox!.y);const a=await source.boundingBox(),b=await page.locator('[data-slot=paint]').boundingBox();
  expect(a!.y).toBeGreaterThan(180);expect(b!.y+b!.height/2).toBeLessThan(844);
  const session=await context.newCDPSession(page),x=a!.x+a!.width/2,y=a!.y+a!.height/2,tx=b!.x+b!.width/2,ty=b!.y+b!.height/2;
  await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await page.waitForTimeout(240);
  for(let step=1;step<=12;step++)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+(tx-x)*step/12,y:y+(ty-y)*step/12,id:1}]});
  await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(page.locator('[data-slot=paint] .hw1-job-card')).toHaveText(label);
 }finally{await context.close();}
});
