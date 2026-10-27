import {test,expect} from '@playwright/test';
import {letter} from '../../src/lessons/homeworkData';
for(const viewport of [{width:390,height:844},{width:768,height:1024},{width:1024,height:768},{width:1366,height:900}]) {
  test(`letter stays readable and unobstructed at ${viewport.width}x${viewport.height}`,async({page})=>{
    await page.setViewportSize(viewport);
    await page.goto('/#/lessons/trial');
    await page.getByRole('tab',{name:'Homework',exact:true}).click();
    if(viewport.width<=600) await page.getByLabel('Choose homework section').selectOption('2');
    else await page.getByRole('button',{name:'3. The Secret Letter',exact:true}).click();
    const article=page.getByRole('article',{name:'Hermione’s letter'});
    await expect(article).toBeVisible();
    expect(await article.locator('p').allTextContents()).toEqual(letter.split('\n\n'));
    const style=await article.evaluate(e=>({font:parseFloat(getComputedStyle(e).fontSize),line:parseFloat(getComputedStyle(e).lineHeight),transform:getComputedStyle(e).transform,select:getComputedStyle(e).userSelect,animation:getComputedStyle(e).animationName}));
    await expect(page.locator('.magic-letter-scene')).toHaveCSS('background-image','none');
    await expect(page.locator('.magic-letter-decoration')).toHaveCount(0);
    expect(style.font).toBeGreaterThanOrEqual(viewport.width<=600?20:22);
    expect(style.font).toBeLessThanOrEqual(24);
    expect(style.line/style.font).toBeCloseTo(1.6,1);
    expect(style.transform).toBe('none');expect(style.select).toBe('text');expect(style.animation).toBe('none');
    const top=await page.locator('.magic-letter-top').boundingBox();
    const first=await article.locator('p').first().boundingBox();
    const bottom=await page.locator('.magic-letter-bottom').boundingBox();
    const last=await article.locator('p').last().boundingBox();
    expect(first!.y).toBeGreaterThanOrEqual(top!.y+top!.height);
    expect(last!.y+last!.height).toBeLessThanOrEqual(bottom!.y);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await expect(page.locator('.hw-field textarea')).toHaveCount(4);
    await page.screenshot({path:`work/magic-letter-${viewport.width}.png`,fullPage:true});
  });
}
test('light letter and text appear quickly when motion is allowed',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/#/lessons/trial');await page.getByRole('tab',{name:'Homework',exact:true}).click();await page.getByRole('button',{name:'3. The Secret Letter',exact:true}).click();
  await expect(page.locator('.magic-letter-text')).toHaveCSS('opacity','1');
  const animations=await page.locator('.magic-letter-card').evaluate(e=>getComputedStyle(e).animationDuration);
  expect(parseFloat(animations)).toBeLessThanOrEqual(.5);
});
