import { test, expect } from '@playwright/test';
test('five sections, exact drafts, speech, completion and responsive layout', async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).spoken = [];
    (window as any).SpeechSynthesisUtterance = class { text: string; constructor(text: string) { this.text = text; } };
    Object.defineProperty(window, 'speechSynthesis', {value:{cancel(){}, getVoices(){return [{lang:'en-GB'}];}, speak(u: SpeechSynthesisUtterance){(window as any).spoken.push(u.text);}}});
  });
  await page.goto('/#/lessons/trial');
  await page.getByRole('tab', {name:'Homework',exact:true}).click();
  await expect(page.getByRole('heading',{name:'New Words',exact:true})).toBeVisible();
  await expect(page.locator('.hw-words article')).toHaveCount(17);
  await page.getByRole('button',{name:'Listen: Usually',exact:true}).click();
  expect(await page.evaluate(()=>(window as any).spoken)).toEqual(['Usually']);
  await expect(page.locator('.hw-words input[type=checkbox]')).toHaveCount(0);
  await page.getByLabel('Переведи «обычно» на английский.').fill('  usualy\n ');
  await page.getByRole('button',{name:"2. Найди и исправь ошибки"}).click();
  const drafts = ['  Hermione drink.\n','Ron sit!!','Harry write','There is book','She no like'];
  for (let i=0;i<5;i++) await page.locator('.hw-field textarea').nth(i).fill(drafts[i]);
  await page.reload(); await page.getByRole('tab',{name:'Homework',exact:true}).click();
  await expect(page.getByLabel('Переведи «обычно» на английский.')).toHaveValue('  usualy\n ');
  await expect(page.getByLabel('Выучено',{exact:true})).toHaveCount(0);
  await page.getByRole('button',{name:"2. Найди и исправь ошибки"}).click();
  for(let i=0;i<5;i++) await expect(page.locator('.hw-field textarea').nth(i)).toHaveValue(drafts[i]);
  await expect(page.getByRole('button',{name:/^Check$|Correct!|Try again!/})).toHaveCount(0);
  await page.getByRole('button',{name:'3. The Secret Letter'}).click();
  await expect(page.getByRole('button',{name:'Listen to the letter'})).toHaveCount(0);
  await expect(page.getByText('Секретное письмо',{exact:true})).toBeVisible();
  await expect(page.getByText('Прочитай письмо Гермионы и ответь на вопросы.',{exact:true})).toBeVisible();
  await expect(page.locator('.hw-field textarea')).toHaveCount(4);
  await page.getByRole('button',{name:'4. A Day at Hogwarts'}).click();
  await page.getByLabel('My magical day').fill('I is happy.\nI has owl!');
  await expect(page.getByLabel('Mark as completed')).toHaveCount(0);
  await expect(page.getByText(/sentences · aim for/)).toHaveCount(0);
  await page.getByRole('button',{name:'5. My Magic Room'}).click();
  await expect(page.locator('.hw-room')).toBeVisible();
  expect(await page.locator('.hw-room').evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(0);
  await page.getByLabel('My room description').fill('A owl.'); await expect(page.getByLabel('Выполнено',{exact:true})).toHaveCount(0);
  for(const width of [390,768,1280]) { await page.setViewportSize({width,height:900}); expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
  await expect(page.getByRole('button',{name:'Mission progress',exact:true})).toHaveCount(0);
  await expect(page.locator('.hw-steps button')).toHaveCount(5);
  await expect(page.getByRole('button',{name:'Next →',exact:true})).toBeDisabled();
  await expect(page.locator('.hw-paging')).toContainText('5 / 5');
  await expect(page.getByRole('progressbar')).toHaveCount(0);
  await expect(page.getByText('Hogwarts Homework Star',{exact:true})).toHaveCount(0);
  await page.getByRole('tab',{name:'Lesson',exact:true}).click();
  await expect(page.locator('.nav-item')).toHaveCount(12);
});

test('missing speech support shows notice', async ({page}) => {
  await page.addInitScript(() => { delete (window as any).SpeechSynthesisUtterance; });
  await page.goto('/#/lessons/trial'); await page.getByRole('tab',{name:'Homework',exact:true}).click();
  await page.getByRole('button',{name:'Listen: Usually',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('недоступно');
});

for (const width of [390, 768, 1280]) test(`trial tabs remain visible and clickable beside chapter navigation at ${width}px`, async ({page}) => {
  await page.setViewportSize({width,height:900});
  await page.goto('/#/lessons/trial');
  const lesson = page.getByRole('tab',{name:'Lesson',exact:true});
  const homework = page.getByRole('tab',{name:'Homework',exact:true});
  for (let i=0;i<2;i++) {
    await homework.click();
    await expect(page.getByRole('heading',{name:'New Words',exact:true})).toBeVisible();
    if(width > 600) {
      const sidebar = page.locator('.homework-sidebar');
      await expect(sidebar).toBeVisible();
      const rail = await sidebar.boundingBox();
      const content = await page.locator('.homework').boundingBox();
      expect(content!.x).toBeGreaterThanOrEqual(rail!.x+rail!.width);
      await page.getByRole('button',{name:'3. The Secret Letter',exact:true}).click();
    } else {
      await page.getByRole('combobox',{name:'Choose homework section'}).selectOption('2');
    }
    await expect(page.getByRole('heading',{name:'The Secret Letter',exact:true})).toBeVisible();
    await lesson.click();
    await expect(page.locator('.sidebar nav button')).toHaveCount(12);
    await expect(lesson).toHaveAttribute('aria-selected','true');
    if(width>600) {
      const rail=await page.locator('.sidebar').boundingBox();
      const tab=await lesson.boundingBox();
      expect(tab!.x).toBeGreaterThanOrEqual(rail!.x+rail!.width);
    }
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('study cards and writing tasks remain usable without helper blocks', async ({page}) => {
  for (const width of [390, 768, 1024, 1280]) {
    await page.setViewportSize({width,height:1000});
    await page.goto('/');
    await page.goto('/#/lessons/trial');
    await page.getByRole('tab',{name:'Homework',exact:true}).click();
    const cards=page.locator('.hw-word-card');
    await expect(cards).toHaveCount(17);
    if(width<=1100) {
      const first=await cards.nth(0).boundingBox(), second=await cards.nth(1).boundingBox();
      expect(second!.y).toBeGreaterThan(first!.y+first!.height);
    }
    expect(await cards.first().locator('h3').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(27);
    const listen=await cards.first().getByRole('button').boundingBox();
    expect(listen!.height).toBeGreaterThanOrEqual(48);
    await expect(cards.getByLabel('Выучено',{exact:true})).toHaveCount(0);
    if(width<=600) await page.getByLabel('Choose homework section').selectOption('3');
    else await page.getByRole('button',{name:'4. A Day at Hogwarts',exact:true}).click();
    await expect(page.locator('.hw-helper')).toHaveCount(0);
    await expect(page.getByRole('heading',{name:'Useful Words',exact:true})).toHaveCount(0);
    expect(await page.locator('.hw-field textarea').evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(20);
    await page.getByLabel('My magical day').fill('I is happy.  My owl sleep!');
    await expect(page.getByLabel('Mark as completed')).toHaveCount(0);
    if(width<=600) await page.getByLabel('Choose homework section').selectOption('4');
    else await page.getByRole('button',{name:'5. My Magic Room',exact:true}).click();
    await expect(page.locator('.hw-helper')).toHaveCount(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});
