import {test,expect,type Page} from '@playwright/test';
import {jobs} from '../../src/lessons/presentSimple/jobsData';
import {pages} from '../../src/lessons/presentSimple/course';
async function section(page:Page,unit:string,last=false){
 const target=pages.filter(part=>part.unit.id===unit);const chosen=last?target.at(-1)!:target[0];
 await page.getByLabel('Choose Lesson 1 topic').selectOption(chosen.topicId);
 await page.getByLabel('Choose Lesson 1 section').selectOption(chosen.id);
}
for(const width of [390,820,1180,1440])test(`page-six illustrated activities fit ${width}px and persist selections`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.goto('/#/lessons/lesson-1');
 // Mobile selectors are visually hidden on larger screens; use desktop section links there.
 const navigate=async(unit:string,last=false)=>{
  if(width<=600)return section(page,unit,last);
  const target=pages.filter(part=>part.unit.id===unit),chosen=last?target.at(-1)!:target[0];
  const {topics}=await import('../../src/lessons/presentSimple/course');
  const title=topics.find(topic=>topic.id===chosen.topicId)!.title;
  const button=page.getByRole('navigation',{name:'Lesson 1 topics'}).getByRole('button').filter({hasText:title});
  if(await button.getAttribute('aria-expanded')!=='true')await button.click();
  await page.locator('.ps2-subnav a').nth(pages.filter(part=>part.topicId===chosen.topicId).findIndex(part=>part.id===chosen.id)).click();
 };
 const seen:string[]=[];
 for(let i=0;i<5;i++){
  seen.push(...await page.locator('.ps2-job-card h3').allTextContents());
  await expect(page.locator('.ps2-job-card svg[role=img]')).toHaveCount(3);
  if(i<4)await page.getByRole('button',{name:'More words →'}).click();
 }
 expect(seen).toEqual(jobs.map(job=>job.name));
 await navigate('qw-who');await expect(page.locator('.ps2-panel')).toContainText('Who works at a hospital?');
 await expect(page.locator('.ps2-panel')).toContainText('do / does не нужен');
 await navigate('jobs-groups');const group=page.locator('.ps2-job-categories').first();
 await group.getByLabel('Work outdoors',{exact:true}).check();await group.getByLabel('Work indoors',{exact:true}).check();
 await page.reload();await expect(group.getByLabel('Work outdoors',{exact:true})).toBeChecked();await expect(group.getByLabel('Work indoors',{exact:true})).toBeChecked();
 await navigate('peter-factfile',true);await expect(page.getByLabel('Peter Nichols factfile')).toContainText('Park Hill General Hospital');await expect(page.getByLabel('Peter Nichols factfile')).toContainText('usually at 8 a.m.');
 await page.getByLabel('How does he travel to work?',{exact:true}).fill('He travels to work by motorbike.');
 await navigate('question-machine');const machine=page.locator('.ps2-question-machine').first();
 await machine.locator('.ps2-chunk-bank button').nth(2).click();await machine.locator('.ps2-chunk-bank button').nth(3).click();
 await page.reload();await expect(machine.locator('.ps2-chunk-answer button')).toHaveText(['Where','does']);
 await machine.locator('.ps2-chunk-answer button').first().click();await expect(machine.locator('.ps2-chunk-bank button').nth(2)).toBeEnabled();
 await machine.getByRole('button',{name:'Собрать заново'}).click();await expect(machine.locator('.ps2-chunk-answer button')).toHaveCount(0);
 await expect(page.locator('.ps2-panel')).not.toContainText(/Correct!|Try again!/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`work/jobs-machine-${width}.png`,fullPage:true});
});
test('interview is teacher-only with two separate persistent empty factfiles',async({page})=>{
 await page.setViewportSize({width:390,height:1000});await page.goto('/#/lessons/lesson-1');await section(page,'job-interview');
 await expect(page.locator('.ps2-interview textarea')).toHaveCount(0);
 await page.getByRole('button',{name:'Teacher mode',exact:true}).click();
 await expect(page.locator('.ps2-interview textarea')).toHaveCount(5);
 for(const input of await page.locator('.ps2-interview textarea').all())await expect(input).toHaveValue('');
 await page.getByLabel('Interview job, round 1').selectOption('chef');await page.getByLabel('Interview round 1: Workplace',{exact:true}).fill('My magical café');
 await page.getByRole('button',{name:'Раунд 2: ученица спрашивает'}).click();await page.getByLabel('Interview round 2: Workplace',{exact:true}).fill('A farm');
 await page.reload();await expect(page.locator('.ps2-interview textarea')).toHaveCount(0);await page.getByRole('button',{name:'Teacher mode',exact:true}).click();
 await expect(page.getByLabel('Interview round 2: Workplace',{exact:true})).toHaveValue('A farm');
 await page.getByRole('button',{name:'Раунд 1: ученица отвечает'}).click();await expect(page.getByLabel('Interview round 1: Workplace',{exact:true})).toHaveValue('My magical café');
 await expect(page.getByLabel('Interview job, round 1')).toHaveValue('chef');
});
