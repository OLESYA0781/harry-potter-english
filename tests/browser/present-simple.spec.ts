import {test,expect} from '@playwright/test';
import {allTasks,pages,topics} from '../../src/lessons/presentSimple/course';
const route='/#/lessons/lesson-1';
async function topic(page:import('@playwright/test').Page,id:string,width=1280){
 if(width<=600)await page.getByLabel('Choose Lesson 1 topic').selectOption(id);
 else await page.getByRole('navigation',{name:'Lesson 1 topics'}).getByRole('button').nth(topics.findIndex(topic=>topic.id===id)).click();
}
test('eleven topics replace the old lesson, restore drafts and offer an opt-in vocabulary dialog',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hogwarts-english-v1',JSON.stringify({version:3,data:{step:0,name:'',scores:{},ratings:{},answers:{'@vika/lesson/lesson-1':{version:1,data:{step:8,name:'',scores:{},ratings:{},answers:{grammarNotes:'  Old notes\n ','exercise3:p5-3-2':'Historical answer'}}}}}})));
 await page.goto(route);
 await expect(page.getByRole('navigation',{name:'Lesson 1 topics'}).getByRole('button')).toHaveCount(11);
 await expect(page.locator('.ps2-heading h1')).toHaveText('My Vocabulary');
 await expect(page.locator('.ps2-jobs-vocabulary > div')).toHaveCount(15);
 await expect(page.locator('.ps2-jobs-vocabulary')).toContainText('ветеринар');
 await expect(page.locator('.ps2-jobs-vocabulary button')).toHaveCount(15);
 await expect(page.getByRole('dialog')).not.toBeVisible();
 await expect(page.getByText(/Ожидаются оригинальные материалы|Professor’s Grammar Room|Watch or listen and read/)).toHaveCount(0);
 await topic(page,'negative');await page.getByRole('button',{name:'Next →',exact:true}).click();
 const first=page.locator('.ps2-task textarea').first();await expect(first).toHaveValue('');
 await first.fill('  My words stay.\n ');
 await page.getByRole('button',{name:'My Vocabulary',exact:true}).click();
 const dictionary=page.getByRole('dialog');await expect(dictionary).toBeVisible();await expect(dictionary.locator('.ps2-word')).toHaveCount(20);
 await expect(dictionary.getByRole('heading',{name:'Useful expressions'})).toBeVisible();
 await page.getByRole('button',{name:'Закрыть словарь'}).click();await expect(first).toHaveValue('  My words stay.\n ');
 await page.reload();await expect(first).toHaveValue('  My words stay.\n ');
 await page.getByText('Ответы предыдущей версии урока',{exact:true}).click();
 await expect(page.getByLabel('Заметки по грамматике')).toHaveValue('  Old notes\n ');
 await expect(page.locator('.ps2-legacy textarea').last()).toHaveValue('Historical answer');
 await expect(page.locator('.ps2-panel')).not.toContainText('Авторский материал');
 await page.getByRole('button',{name:'Teacher mode',exact:true}).click();await expect(page.locator('.ps2-source')).toContainText('Авторский материал');
 await page.getByRole('button',{name:'Exit teacher mode',exact:true}).click();await expect(page.locator('.ps2-source')).toHaveCount(0);
});
test('all new practice pages save original responses and allow completion without grading',async({page})=>{
 test.setTimeout(90000);
 await page.goto(route);
 let answered=0;
 for(let i=0;i<pages.length;i++){
  await expect(page.locator('.ps2-panel h2')).toHaveText(pages[i].unit.title);
  const selects=page.locator('.ps2-task select'),fields=page.locator('.ps2-task textarea');
  for(const select of await selects.all()){await select.selectOption({index:1});answered++;}
  for(const field of await fields.all()){await field.fill(`  Pupil draft ${answered}.\n `);answered++;}
  await expect(page.locator('.ps2-panel')).not.toContainText(/Correct!|Try again!/);
  if(i<pages.length-1)await page.getByRole('button',{name:'Next →',exact:true}).click();
 }
 expect(answered).toBe(allTasks.length);
 await expect(page.getByRole('button',{name:'Next →',exact:true})).toBeDisabled();
 await page.getByRole('link',{name:'Main Menu',exact:true}).click();
 await expect(page.locator('.lesson-card').filter({has:page.getByRole('heading',{name:'Lesson 1 — Present Simple',exact:true})})).toContainText('100%');
 await page.goto(route);await topic(page,'negative');await page.getByRole('button',{name:'Next →',exact:true}).click();
 await expect(page.locator('.ps2-task textarea').first()).toHaveValue(/Pupil draft/);
});
for(const width of [390,768,1024,1366])test(`new Lesson 1 topics, tables and vocabulary fit ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.goto(route);
 for(const entry of topics){
  await topic(page,entry.id,width);await expect(page.locator('.ps2-heading h1')).toHaveText(entry.title);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await expect(page.locator('.ps2-sidebar')).not.toContainText('Vocabulary: Places in Town');
 await topic(page,'short-answers',width);
 const row=page.locator('.ps2-question-table .ps2-table-row').first(),cells=row.getByRole('cell');
 const question=await cells.nth(0).boundingBox(),yes=await cells.nth(1).boundingBox(),no=await cells.nth(2).boundingBox();
 expect(question!.width).toBeGreaterThan(yes!.width);expect(Math.abs(yes!.x-no!.x)).toBeLessThan(1);expect(no!.y).toBeGreaterThanOrEqual(yes!.y+yes!.height);
 await page.screenshot({path:`work/lesson1-v2-${width}.png`,fullPage:true});
 await page.getByRole('button',{name:'My Vocabulary',exact:true}).click();
 const dictionary=page.getByRole('dialog');expect(await dictionary.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
 await page.keyboard.press('Escape');await expect(dictionary).not.toBeVisible();
});
test('speech uses the existing browser mechanism and unavailable speech has a clear notice',async({page})=>{
 await page.addInitScript(()=>{
  (window as unknown as {spoken:string[]}).spoken=[];
  Object.defineProperty(window,'SpeechSynthesisUtterance',{value:class {text:string;constructor(text:string){this.text=text;}}});
  Object.defineProperty(window,'speechSynthesis',{value:{cancel(){},getVoices(){return[];},speak(utterance:{text:string}){(window as unknown as {spoken:string[]}).spoken.push(utterance.text);}}});
 });
 await page.goto(route);await page.getByRole('button',{name:'My Vocabulary',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Listen: bank',exact:true}).click();
 expect(await page.evaluate(()=>(window as unknown as {spoken:string[]}).spoken)).toEqual(['bank']);
});

test('unsupported speech reports a notice without losing drafts',async({page})=>{
 await page.addInitScript(()=>{delete (window as unknown as {speechSynthesis?:unknown}).speechSynthesis;delete (window as unknown as {SpeechSynthesisUtterance?:unknown}).SpeechSynthesisUtterance;});
 await page.goto(route);await page.getByRole('button',{name:'My Vocabulary',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Listen: bank',exact:true}).click();
 await expect(page.getByRole('status')).toHaveText('Английское произношение недоступно в этом браузере.');
});

test('removed third block resumes at Affirmative and keeps its historical answers',async({page})=>{
 await page.addInitScript(()=>{
  const course={schemaVersion:2,activePage:'places/places-match/place-match-bank',seen:['places'],responses:{'place-match-bank':'банк','place-gap-01':'  cinema  '}};
  const lesson={step:0,name:'',scores:{},ratings:{},answers:{'present-simple:v2':course}};
  const data={step:0,name:'',scores:{},ratings:{},answers:{'@vika/lesson/lesson-1':{version:1,data:lesson}}};
  localStorage.setItem('hogwarts-english-v1',JSON.stringify({version:3,data}));
 });
 await page.goto(route);await expect(page.locator('.ps2-heading h1')).toHaveText('Affirmative Sentences');
 await expect(page.locator('.ps2-panel')).not.toContainText('Match the words');
 await expect(page.locator('.ps2-panel .ps2-word-grid')).toHaveCount(0);
 await page.getByRole('button',{name:'Next →',exact:true}).click();await page.getByRole('button',{name:'← Back',exact:true}).click();
 await expect(page.locator('.ps2-heading h1')).toHaveText('Affirmative Sentences');
 const answers=await page.evaluate(()=>JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!).state.answers['@vika/lesson/lesson-1'].data.answers['present-simple:v2'].responses);
 expect(answers['place-match-bank']).toBe('банк');
 expect(answers['place-gap-01']).toBe('  cinema  ');
});
