import {test,expect} from '@playwright/test';
import {warmupAreas} from '../../src/lessons/presentSimple/WarmupDifferences';
for(const width of [390,820,1180,1440])test(`all seven real-coordinate warm-up differences work at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.goto('/#/lessons/lesson-1');
 await expect(page.locator('.ps2-heading h1')).toHaveText('Warm-up — Back to Hogwarts!');
 const game=page.locator('.ps2-warmup'),pictures=game.locator('.difference-scene');
 await expect(pictures).toHaveCount(2);await expect(game.locator('.difference-hotspot')).toHaveCount(14);await expect(game.locator('.difference-counter')).toContainText('0 / 7');
 for(let index=0;index<7;index++){
  const side=index%2?'B':'A',picture=pictures.nth(side==='A'?0:1),area=warmupAreas[side][index];
  const size=await picture.boundingBox();expect(Math.abs(size!.width-size!.height)).toBeLessThan(1);
  await picture.click({position:{x:size!.width*(area.left+area.width/2)/100,y:size!.height*(area.top+area.height/2)/100}});
  await expect(game.locator('.difference-counter')).toContainText(`${index+1} / 7`);
  const other=pictures.nth(side==='A'?1:0).getByRole('button').nth(index);await expect(other).toHaveAttribute('aria-pressed','true');
  await other.click();await expect(game.locator('.difference-counter')).toContainText(`${index+1} / 7`);
 }
 await expect(game.getByText('Amazing! You found all 7 differences!',{exact:true})).toBeVisible();await expect(game.locator('.difference-hotspot.found')).toHaveCount(14);
 await page.reload();await expect(game.locator('.difference-counter')).toContainText('7 / 7');
 await expect(game.getByRole('heading',{name:'Let’s Talk About the Pictures!'})).toHaveCount(0);
 await page.getByRole('button',{name:'Teacher mode',exact:true}).click();await expect(game.locator('.ps2-warmup-speaking li')).toHaveCount(7);
 await expect(game.locator('.ps2-warmup-speaking')).toContainText("No, Hermione isn't in Picture B.");
 const a=await pictures.nth(0).boundingBox(),b=await pictures.nth(1).boundingBox(),speaking=await game.locator('.ps2-warmup-speaking').boundingBox();
 expect(speaking!.y).toBeGreaterThan(a!.y+a!.height);expect(speaking!.y).toBeGreaterThan(b!.y+b!.height);
 if(width===1440)expect(Math.abs(a!.y-b!.y)).toBeLessThan(1);else if(width<=820)expect(b!.y).toBeGreaterThan(a!.y+a!.height);
 for(const button of await game.locator('.difference-hotspot').all()){const rect=await button.boundingBox();expect(rect!.width).toBeGreaterThanOrEqual(43.9);expect(rect!.height).toBeGreaterThanOrEqual(43.9);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await game.getByRole('button',{name:'Play Again',exact:true}).click();await expect(game.locator('.difference-counter')).toContainText('0 / 7');await expect(game.locator('.difference-hotspot.found')).toHaveCount(0);
 await expect(game.locator('.ps2-warmup-speaking')).toHaveCount(0);await expect(game).not.toContainText(/Correct!|Try again!/);
 await page.screenshot({path:`work/warmup-${width}.png`,fullPage:true});
});
test('keyboard discovery and replay preserve unrelated Lesson 1 and Trial answers',async({page})=>{
 await page.goto('/#/lessons/lesson-1');const game=page.locator('.ps2-warmup');
 await game.getByRole('button',{name:'Compare area 1 in picture A',exact:true}).focus();await page.keyboard.press('Enter');
 await expect(game.locator('.difference-counter')).toContainText('1 / 7');await page.keyboard.press('Enter');await expect(game.locator('.difference-counter')).toContainText('1 / 7');
 await page.getByRole('navigation',{name:'Lesson 1 topics'}).getByRole('button').filter({hasText:'Affirmative Sentences'}).click();
 await page.locator('.ps2-subnav a').filter({hasText:'Переведи предложение на английский · 1–4'}).click();
 const draft=page.getByLabel('Врач работает в больнице.',{exact:true});await draft.fill('Keep my answer.');
 await page.getByRole('navigation',{name:'Lesson 1 topics'}).getByRole('button').filter({hasText:'Warm-up — Back to Hogwarts!'}).click();
 await expect(game.locator('.difference-counter')).toContainText('1 / 7');await game.getByRole('button',{name:'Play Again',exact:true}).click();
 await page.getByRole('navigation',{name:'Lesson 1 topics'}).getByRole('button').filter({hasText:'Affirmative Sentences'}).click();await page.locator('.ps2-subnav a').filter({hasText:'Переведи предложение на английский · 1–4'}).click();await expect(draft).toHaveValue('Keep my answer.');
});
