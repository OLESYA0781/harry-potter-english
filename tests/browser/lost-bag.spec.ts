import { test, expect } from '@playwright/test';

for (const width of [320,390,820,1440]) test(`Lost Bag scene, dialogue and drafts at ${width}`,async({page})=>{
  await page.setViewportSize({width,height:1000});
  await page.addInitScript(()=>{if(!localStorage.getItem('hogwarts-english-v1')) localStorage.setItem('hogwarts-english-v1',JSON.stringify({version:3,data:{step:0,name:'',answers:{oldHomework:'keep','@vika/lesson/lesson-3':{version:1,data:{step:0,name:'',answers:{oldDraft:'keep old lesson'},scores:{},ratings:{}}}},scores:{},ratings:{}}}));});
  await page.goto('/#/lessons/lesson-4');
  await expect(page.getByRole('heading',{name:'The Mystery of the Lost Bag',exact:true})).toBeVisible();
  await expect(page.locator('.lb-window')).toHaveCount(6);
  await expect(page.locator('.lb-reply')).toHaveCount(0);
  await expect(page.locator('.lb-teacher')).toHaveCount(0);
  await expect(page.locator('.lb-main')).not.toContainText('My bag is');
  for(const image of await page.locator('.lb-case img,.lb-house>img').all()){await image.scrollIntoViewIfNeeded();await expect.poll(()=>image.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);}
  for(const name of ['Alice','Jack','Sophie','Daniel','Emma','Oliver']){
    const window=page.getByRole('button',{name:new RegExp(`Flat \\d — ${name}$`)});
    if(name==='Alice'){await window.focus();await page.keyboard.press('Enter');}else await window.click();
    const dialog=page.locator('#lb-dialog');await expect(dialog.getByRole('heading',{name,exact:true})).toBeVisible();
    await expect(dialog.locator('textarea')).toHaveCount(12);
    const card=dialog.locator('.lb-question').first();
    await expect(card.getByRole('button',{name:'Ask',exact:true})).toBeDisabled();
    await card.locator('textarea').fill(`  My own ${name} question?\n`);
    await expect(card.locator('.lb-reply')).toHaveCount(0);
    await card.getByRole('button',{name:'Ask',exact:true}).click();
    await expect(card.locator('.lb-reply')).toHaveText(`${name}: My name is ${name}.`);
    await dialog.getByRole('button',{name:'Back to the house',exact:false}).first().click();
  }
  await page.getByRole('button',{name:'Flat 4 — Daniel',exact:true}).click();
  const notebook=page.locator('#lb-dialog .lb-question').nth(10);await notebook.locator('textarea').fill('Have notebook?');await notebook.getByRole('button',{name:'Ask',exact:true}).click();
  await expect(notebook.locator('.lb-reply')).toContainText("I don't have a notebook.");
  await expect(page.locator('.lb-notebook input')).toHaveCount(36);
  for(const input of await page.locator('.lb-notebook input').all())await expect(input).toHaveValue('');
  await page.getByRole('textbox',{name:'Emma, Bag colour',exact:true}).fill('my own note');
  await page.getByRole('textbox',{name:'Who is the owner of the bag?',exact:true}).fill('I think it is Alice.');
  await page.getByRole('textbox',{name:'Write 4–6 sentences about the owner of the bag.',exact:true}).fill('  My own description.\nI can return later.  ');
  await page.reload();
  await expect(page.getByRole('heading',{name:'Daniel',exact:true})).toBeVisible();
  await expect(notebook.locator('.lb-reply')).toContainText("I don't have a notebook.");
  await expect(notebook.locator('textarea')).toHaveValue('Have notebook?');
  await expect(page.getByRole('textbox',{name:'Emma, Bag colour',exact:true})).toHaveValue('my own note');
  await expect(page.getByRole('textbox',{name:'Who is the owner of the bag?',exact:true})).toHaveValue('I think it is Alice.');
  await expect(page.getByRole('textbox',{name:'Write 4–6 sentences about the owner of the bag.',exact:true})).toHaveValue('  My own description.\nI can return later.  ');
  await expect(page.locator('.lb-main')).not.toContainText('I think the bag belongs to Emma.');
  await expect(page.locator('.lb-main')).not.toContainText(/Correct!|Incorrect!|Try again!/);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await page.getByRole('button',{name:'Teacher mode',exact:true}).click();
  await expect(page.locator('.lb-teacher')).toContainText("What's your name?");
  await expect(page.locator('.lb-teacher')).toContainText('I think the bag belongs to Emma.');
  await expect(page.locator('.lb-teacher')).toContainText('My own Alice question?');
  await page.getByRole('button',{name:'Exit teacher mode',exact:true}).click();
  await expect(page.locator('.lb-teacher')).toHaveCount(0);
  const answers=await page.evaluate(()=>JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!).state.answers);
  expect(answers.oldHomework).toBe('keep');expect(answers['@vika/lesson/lesson-3'].data.answers.oldDraft).toBe('keep old lesson');
  await page.getByRole('button',{name:'Flat 5 — Emma',exact:true}).click();await page.locator('#lb-dialog').getByRole('button',{name:'Back to the house',exact:false}).first().click();
  await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
  await page.screenshot({path:`work/lost-bag-house-${width}.png`});
  await page.getByRole('link',{name:'Common objects — My Vocabulary',exact:true}).click();
  await expect(page).toHaveURL(/#\/vocabulary\/lesson-3$/);
});

test('phone windows and Ask work by touch',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  try{const page=await context.newPage();await page.goto('http://127.0.0.1:5173/#/lessons/lesson-4');
    const window=page.getByRole('button',{name:'Flat 1 — Alice',exact:true});await window.tap();
    const card=page.locator('#lb-dialog .lb-question').first();await card.locator('textarea').fill('What is your name?');await card.getByRole('button',{name:'Ask',exact:true}).tap();
    await expect(card.locator('.lb-reply')).toHaveText('Alice: My name is Alice.');
    await expect(page.getByRole('textbox',{name:'Alice, Bag colour',exact:true})).toHaveValue('');
  }finally{await context.close();}
});
