import {test,expect} from '@playwright/test';
for(const width of [390,768,1024,1366]) test(`one To Be slide has three connected branches at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000});await page.goto('/');
  await expect(page.getByLabel('Выбери своё приключение').locator('option')).toHaveText(['Lesson 1 — Present Simple · Ещё не начат','Lesson 0 — To Be · Ещё не начат','Trial Lesson · Ещё не начат']);
  await page.getByLabel('Выбери своё приключение').selectOption('lesson-0');
  await page.getByRole('button',{name:'Начать урок',exact:true}).click();
  await expect(page).toHaveURL(/#\/lessons\/lesson-0$/);
  await expect(page.getByRole('heading',{name:'TO BE — Am / Is / Are',exact:true})).toHaveCount(1);
  await expect(page.locator('.to-be-source')).toHaveText('TO BE');
  await expect(page.locator('.to-be-arrows > path')).toHaveCount(3);
  await expect(page.locator('.to-be-group')).toHaveCount(3);
  await expect(page.locator('.to-be-group h2')).toHaveText(['I','HE / SHE / IT','YOU / WE / THEY']);
  await expect(page.locator('.to-be-group > strong')).toHaveText(['AM','IS','ARE']);
  const boxes=await page.locator('.to-be-group').evaluateAll(elements=>elements.map(e=>({x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y})));
  expect(boxes[1].x).toBeGreaterThan(boxes[0].x);expect(boxes[2].x).toBeGreaterThan(boxes[1].x);
  expect(Math.abs(boxes[0].y-boxes[2].y)).toBeLessThan(1);
  await expect(page.locator('.to-be-lesson textarea, .to-be-lesson input, .to-be-lesson button')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`work/to-be-${width}.png`,fullPage:true});
});

async function toStage(page:import('@playwright/test').Page,legacy:number,width=1280) {
 const index=[0,1,2,3,4,0,2,3,5,5,5,6,6][legacy];
 if(width<=600) await page.getByLabel('Choose Lesson 0 stage').selectOption(String(index));
 else await page.getByRole('navigation',{name:'Lesson 0 stages'}).getByRole('button').nth(index).click();
}
test('expanded To Be lesson preserves original answers, identifies adaptations and never grades',async({page})=>{
 await page.goto('/#/lessons/lesson-0');
 await expect(page.getByRole('navigation',{name:'Lesson 0 stages'}).getByRole('button')).toHaveCount(7);
 await toStage(page,5);
 await expect(page.locator('.tb-task')).toHaveCount(9);
 await page.getByLabel('I ... a pupil.',{exact:true}).fill('  is?  ');
 await toStage(page,6);await expect(page.getByText(/Авторское закрепление to be/)).toHaveCount(0);
 await expect(page.locator('.tb-task')).toHaveCount(6);
 await page.getByLabel('The café is open.',{exact:true}).fill('The café no open.\n');
 await toStage(page,7);await page.getByLabel('The hospital is clean.',{exact:true}).fill('Hospital clean??');
 await toStage(page,8);await expect(page.getByRole('region',{name:'Correct the mistakes',exact:true}).locator('textarea')).toHaveCount(12);await expect(page.locator('.tb-panel')).not.toContainText('не найдено');
 await toStage(page,9);await expect(page.locator('.tb-reading input')).toHaveCount(8);await page.getByLabel('Пропуск 1',{exact:true}).fill('am');
 await toStage(page,10);await expect(page.getByRole('region',{name:'Mixed Grammar Challenge',exact:true})).toHaveCount(0);
 await toStage(page,4);await page.getByLabel('Is the boat on the river?',{exact:true}).fill('  Yes, it is.\n ');
 await page.reload();await expect(page.getByLabel('Is the boat on the river?',{exact:true})).toHaveValue('  Yes, it is.\n ');
 await toStage(page,5);await expect(page.getByLabel('I ... a pupil.',{exact:true})).toHaveValue('  is?  ');
 await toStage(page,6);await expect(page.getByLabel('The café is open.',{exact:true})).toHaveValue('The café no open.\n');
 await toStage(page,7);await expect(page.getByLabel('The hospital is clean.',{exact:true})).toHaveValue('Hospital clean??');
 await toStage(page,9);await expect(page.getByLabel('Пропуск 1',{exact:true})).toHaveValue('am');
 await expect(page.getByText(/Correct!|Try again!/)).toHaveCount(0);
 await toStage(page,12);await expect(page.getByRole('button',{name:'Next →',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'← Back',exact:true}).click();await expect(page.getByLabel('Пропуск 1',{exact:true})).toHaveValue('am');
});
for(const width of [390,768,1024,1366]) test(`all To Be theory and practice sections fit ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:950});await page.goto('/#/lessons/lesson-0');
 for(const i of [0,1,2,3,4,8,12]){await toStage(page,i,width);await expect(page.locator('.tb-heading h1')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.screenshot({path:`work/to-be-expanded-${width}.png`,fullPage:true});
});

for(const width of [390,768,1024,1366]) test(`question panel is larger and No sits below Yes at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.goto('/#/lessons/lesson-0');
 for(const stage of [3,4,12]) {
  await toStage(page,stage,width);
  const row=page.locator('.tb-question-table .tb-table-row').first();
  await expect(row.getByRole('cell')).toHaveCount(3);
  const cells=await row.getByRole('cell').all();
  const question=await cells[0].boundingBox(),yes=await cells[1].boundingBox(),no=await cells[2].boundingBox();
  expect(question!.width).toBeGreaterThan(yes!.width);
  expect(Math.abs(no!.x-yes!.x)).toBeLessThan(1);
  expect(no!.y).toBeGreaterThanOrEqual(yes!.y+yes!.height);
  expect(question!.x+question!.width).toBeLessThanOrEqual(yes!.x);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.screenshot({path:`work/question-answers-${width}.png`,fullPage:true});
});

test('correction cards save all original drafts without revealing answers or grading',async({page})=>{
 await page.goto('/#/lessons/lesson-0');await toStage(page,8);
 await expect(page.getByText('Find the mistake in each sentence. Write the correct sentence.',{exact:true})).toBeVisible();
 await expect(page.getByRole('region',{name:'Correct the mistakes',exact:true}).locator('.tb-task')).toHaveCount(12);
 await expect(page.locator('.tb-panel select')).toHaveCount(0);
 const drafts=Array.from({length:12},(_,i)=>`  my own wrong answer ${i+1}.\n `);
 for(let i=0;i<12;i++)await page.getByRole('region',{name:'Correct the mistakes',exact:true}).locator('textarea').nth(i).fill(drafts[i]);
 await page.reload();
 for(let i=0;i<12;i++)await expect(page.getByRole('region',{name:'Correct the mistakes',exact:true}).locator('textarea').nth(i)).toHaveValue(drafts[i]);
 await expect(page.locator('.tb-panel')).not.toContainText('I am eleven years old.');
 await expect(page.locator('.tb-panel')).not.toContainText(/Correct!|Try again!|не найдено/);
 await page.getByRole('button',{name:'Next →',exact:true}).click();await page.getByRole('button',{name:'← Back',exact:true}).click();
 await expect(page.getByRole('region',{name:'Correct the mistakes',exact:true}).locator('textarea').first()).toHaveValue(drafts[0]);
 await page.getByRole('link',{name:'Главное меню',exact:true}).click();
 await expect(page.locator('.lesson-card').filter({has:page.getByRole('heading',{name:'Lesson 0 — To Be',exact:true})})).toContainText('3 из 13 частей');
});

test('seven topics alternate theory and practice without duplicating old sections',async({page})=>{
 await page.goto('/#/lessons/lesson-0');
 const layout=[['TO BE','Complete the sentences','Hogwarts Magic Town — Look and Say'],['Affirmative','Make affirmative sentences','Who is this?'],['Negative','Make negative sentences','Find the False Facts'],['Questions','Make questions','Hogwarts Magic Town — Look and Describe'],['Short Answers','Write short answers'],['Correct the mistakes','Read and complete'],['To Be Cheat Sheet']];
 const actual:string[]=[];
 for(let i=0;i<7;i++){
  await expect(page.locator('.tb-part')).toHaveCount(layout[i].length);
  const parts=await page.locator('.tb-part').evaluateAll(elements=>elements.map(e=>e.getAttribute('aria-label')));
  expect(parts).toEqual(layout[i]);actual.push(...parts as string[]);
  if(i===1)await page.getByRole('region',{name:'Make affirmative sentences',exact:true}).getByLabel('George ... fourteen years old.',{exact:true}).fill('  George is fourteen.\n ');
  if(i===4){await expect(page.getByRole('region',{name:'Write short answers',exact:true}).locator('textarea')).toHaveCount(6);await page.getByRole('region',{name:'Write short answers',exact:true}).getByLabel('Is the boat on the river?',{exact:true}).fill('  Yes, it is!\n ');}
  if(i<6)await page.getByRole('button',{name:'Next →',exact:true}).click();
 }
 expect(new Set(actual).size).toBe(17);
 await page.reload();await expect(page.locator('.tb-heading h1')).toHaveText('Grammar Summary');
 await toStage(page,1);await expect(page.getByLabel('George ... fourteen years old.',{exact:true})).toHaveValue('  George is fourteen.\n ');
 await toStage(page,4);await expect(page.getByLabel('Is the boat on the river?',{exact:true})).toHaveValue('  Yes, it is!\n ');
});

test('old profile position redirects to summary and old answers never appear under new prompts',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hogwarts-english-v1',JSON.stringify({version:3,data:{step:0,name:'',scores:{},ratings:{},answers:{'@vika/lesson/lesson-0':{version:1,data:{step:11,name:'',scores:{},ratings:{},answers:{toBeActiveBlock:'profile','profile:0':'Old personal answer','affirmative:157-5':'Old pupil answer','negative:157-5':'Old negative answer'}}}}}})));
 await page.goto('/#/lessons/lesson-0');await expect(page.locator('.tb-heading h1')).toHaveText('Grammar Summary');
 await expect(page.getByText('My Hogwarts Profile',{exact:true})).toHaveCount(0);
 await toStage(page,1);await expect(page.getByLabel('George ... fourteen years old.',{exact:true})).toHaveValue('');
 await page.getByLabel('George ... fourteen years old.',{exact:true}).fill('New George answer');await page.reload();
 await expect(page.getByLabel('George ... fourteen years old.',{exact:true})).toHaveValue('New George answer');
 const answers=await page.evaluate(()=>JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!).state.answers['@vika/lesson/lesson-0'].data.answers);
 expect(answers['profile:0']).toBe('Old personal answer');expect(answers['affirmative:157-5']).toBe('Old pupil answer');expect(answers['negative:157-5']).toBe('Old negative answer');
});

test('source annotations appear only in active teacher mode; short answer directions stay visible',async({page})=>{
 await page.goto('/#/lessons/lesson-0');
 for(const stage of [0,1,2,3,4,8]){
  await toStage(page,stage);
  await expect(page.locator('.tb-panel')).not.toContainText(/Авторское|Go Getter|Голицынский|Упр\.|Упражнение 157|В оригинале/);
 }
 await toStage(page,4);
 await expect(page.locator('.tb-task small').filter({hasText:/^(Да|Нет)$/})).toHaveCount(6);
 await page.getByRole('button',{name:'Teacher mode',exact:true}).click();
 await expect(page.locator('.tb-panel')).toContainText('Go Getter 3');
 await toStage(page,0);await expect(page.locator('.tb-panel')).toContainText('Голицынский');
 await page.getByRole('button',{name:'Exit teacher mode',exact:true}).click();
 await expect(page.locator('.tb-panel')).not.toContainText('Голицынский');
});

async function loadedPictures(region:import('@playwright/test').Locator){
 const imgs=region.locator('img');
 for(const img of await imgs.all()){
  await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
 }
}
test('visual speaking scenes, false facts and twenty translated words work without pupil questions or recording',async({page})=>{
 test.setTimeout(90000);
 await page.goto('/#/lessons/lesson-0');
 await toStage(page,1);
 const who=page.getByRole('region',{name:'Who is this?',exact:true});await expect(who.getByRole('button',{name:/Картинка/})).toHaveCount(4);
 for(let i=0;i<4;i++){await who.getByRole('button',{name:`Картинка ${i+1}`,exact:true}).click();await loadedPictures(who);}
 await expect(who.getByText('Who are they?',{exact:true})).toHaveCount(0);
 await expect(who.locator('input,textarea,audio,video')).toHaveCount(0);
 await page.getByRole('button',{name:'Teacher mode',exact:true}).click();await expect(who.getByText('Who are they?',{exact:true})).toBeVisible();
 await who.getByText('Teacher’s questions',{exact:true}).click();await expect(who.getByText('Who are they?',{exact:true})).not.toBeVisible();
 await page.getByRole('button',{name:'Exit teacher mode',exact:true}).click();
 await toStage(page,2);
 const facts=page.getByRole('region',{name:'Find the False Facts',exact:true});await expect(facts.getByRole('button',{name:/Картинка/})).toHaveCount(3);
 for(let i=0;i<3;i++){await facts.getByRole('button',{name:`Картинка ${i+1}`,exact:true}).click();await loadedPictures(facts);await expect(facts.locator('.tb-false-facts li')).toHaveCount(3);}
 await expect(facts.getByText('Варианты исправлений для учителя')).toHaveCount(0);
 await toStage(page,3);const room=page.getByRole('region',{name:'Hogwarts Magic Town — Look and Describe',exact:true});await loadedPictures(room);await expect(room.locator('.tb-speaking-teacher')).toHaveCount(0);
 await toStage(page,0);const town=page.getByRole('region',{name:'Hogwarts Magic Town — Look and Say',exact:true});
 for(const group of ['Places','Transport']){
  await town.getByRole('button',{name:group,exact:true}).click();await expect(town.locator('.tb-town-word')).toHaveCount(10);
  for(let i=0;i<10;i++){const card=town.locator('.tb-town-word').nth(i);await expect(card.locator('h3')).toBeVisible();await expect(card.locator('p[lang=ru]')).toBeVisible();await loadedPictures(card);}
 }
 await expect(town.getByRole('button',{name:/Открыть|Скрыть/})).toHaveCount(0);
 await page.reload();await expect(town.getByRole('button',{name:'Transport',exact:true})).toHaveAttribute('aria-pressed','true');await expect(town.getByRole('heading',{name:'underground',exact:true})).toBeVisible();
 await toStage(page,1);await expect(who.getByRole('button',{name:'Картинка 4',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(page.getByRole('button',{name:/микрофон|record|microphone/i})).toHaveCount(0);
});

for(const width of [390,768,1024,1366])test(`oral illustrations and teacher panels fit ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});await page.goto('/#/lessons/lesson-0');
 await page.getByRole('button',{name:'Teacher mode',exact:true}).click();
 for(const [stage,title] of [[1,'Who is this?'],[2,'Find the False Facts'],[3,'Hogwarts Magic Town — Look and Describe']] as const){
  await toStage(page,stage,width);
  const region=page.getByRole('region',{name:title,exact:true});await loadedPictures(region);
  await region.scrollIntoViewIfNeeded();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const picture=region.locator('.tb-speaking-picture').first();const bounds=await picture.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(width);
  if(stage===2){await region.getByRole('button',{name:'Картинка 2',exact:true}).click();await loadedPictures(region);await expect(region.getByText('This is a hotel.',{exact:true})).toBeVisible();}
  await region.screenshot({path:`work/to-be-oral-${stage}-${width}.png`});
 }
});

test('old room selection opens the hospital replacement and teacher-only town hints follow each picture',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('hogwarts-english-v1',JSON.stringify({version:3,data:{step:0,name:'',scores:{},ratings:{},answers:{'@vika/lesson/lesson-0':{version:1,data:{step:2,name:'',scores:{},ratings:{},answers:{toBeActiveBlock:'negative','visual:v1:false:scene':'common-room'}}}}}})));
 await page.goto('/#/lessons/lesson-0');const facts=page.getByRole('region',{name:'Find the False Facts',exact:true});
 await expect(facts.getByRole('button',{name:'Картинка 2',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(facts.locator('.tb-false-facts')).toHaveText('This is a hotel.This is a museum.This is a bank.');
 await expect(facts.locator('img')).toHaveAttribute('src','/art/lesson-0/places.webp');
 await expect(facts).not.toContainText('The room is empty.');
 await toStage(page,3);const describe=page.getByRole('region',{name:'Hogwarts Magic Town — Look and Describe',exact:true});
 await expect(describe.getByRole('button',{name:/Картинка/})).toHaveCount(8);await expect(describe.locator('.tb-speaking-teacher')).toHaveCount(0);
 await page.getByRole('button',{name:'Teacher mode',exact:true}).click();await expect(describe.getByText('Текстовые подсказки для учителя',{exact:true})).toBeVisible();
 for(let i=0;i<8;i++){await describe.getByRole('button',{name:`Картинка ${i+1}`,exact:true}).click();await loadedPictures(describe);await expect(describe.locator('.tb-speaking-teacher').last()).toContainText('I am here');}
 await page.reload();await expect(describe.getByRole('button',{name:'Картинка 8',exact:true})).toHaveAttribute('aria-pressed','true');await expect(describe.locator('.tb-speaking-teacher')).toHaveCount(0);
});
