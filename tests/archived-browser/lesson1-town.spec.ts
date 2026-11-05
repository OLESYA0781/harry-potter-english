// Retired with Lesson 1 Places block; historical browser scenario retained.
import {test,expect} from '@playwright/test';
const route='/#/lessons/lesson-1';
async function topic(page:import('@playwright/test').Page,id:string){await page.getByLabel('Choose Lesson 1 topic').selectOption(id);}
test('Hogwarts Town reuses generated scenes for to be, likes and opening times',async({page})=>{
 await page.goto(route);await topic(page,'places');await page.getByRole('button',{name:'Next →',exact:true}).click();await page.getByRole('button',{name:'Next →',exact:true}).click();
 for(const title of ['Museum','Café','Cinema','Theatre','Stadium']){
  await expect(page.locator('.ps2-panel h2')).toHaveText(`Hogwarts Town — ${title}`);
  const img=page.locator('.ps2-town-art img');await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(img).toHaveAttribute('src','/art/lesson-0/places.webp');await expect(page.locator('.ps2-task textarea')).toHaveCount(3);
  if(title==='Museum'){
   await expect(page.locator('.ps2-town-scene')).toContainText('09:00');
   await page.getByLabel('Гермиона любит музей.',{exact:true}).fill('  Hermione likes the museum.\n ');
   await expect(page.getByText('Подсказки для учителя',{exact:true})).toHaveCount(0);
   await expect(page.locator('.ps2-source li')).toHaveCount(0);
   await page.getByRole('button',{name:'Teacher mode',exact:true}).click();await page.getByText('Подсказки для учителя',{exact:true}).click();await expect(page.getByText('The museum opens at nine.',{exact:true})).toBeVisible();
   await page.getByRole('button',{name:'Exit teacher mode',exact:true}).click();
  }
  await page.getByRole('button',{name:'Next →',exact:true}).click();
 }
 await expect(page.locator('.ps2-heading h1')).toHaveText('Affirmative Sentences');
 await page.reload();await topic(page,'places');await page.getByRole('button',{name:'Next →',exact:true}).click();await page.getByRole('button',{name:'Next →',exact:true}).click();
 await expect(page.getByLabel('Гермиона любит музей.',{exact:true})).toHaveValue('  Hermione likes the museum.\n ');
 await expect(page.getByRole('navigation',{name:'Lesson 1 topics'})).not.toContainText('Word Order');
});
