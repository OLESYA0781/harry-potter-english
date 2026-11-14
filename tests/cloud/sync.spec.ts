import { test, expect } from '@playwright/test';
import type { Page, BrowserContext } from '@playwright/test';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
const user = '00000000-0000-0000-0000-000000000001';
const authKey = `hogwarts-auth:${process.env.TEST_SUPABASE_URL || 'https://supabase.test'}`;
let db: PGlite;
let lostReply = false;
let refreshes = 0;
let calls = 0;
let tail = Promise.resolve();
const initial = { step: 0, name: '', answers: {}, scores: {}, ratings: {} };
async function rpc(changes: object = {}, migration: object | null = null) {
  const run = async () => {
    const result = await db.query<{ result: any }>('select public.sync_lesson($1::jsonb, $2::jsonb) as result', [JSON.stringify(changes), migration ? JSON.stringify(migration) : null]);
    return result.rows[0].result;
  };
  const result = tail.then(run); tail = result.then(() => {}, () => {}); return result;
}
async function route(context: BrowserContext) {
  await context.route('https://supabase.test/**', async route => {
    const request = route.request(), path = new URL(request.url());
    const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'content-type': 'application/json' };
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (path.pathname.includes('/token')) {
      const body = request.postDataJSON();
      if (path.searchParams.get('grant_type') === 'refresh_token') refreshes++;
      else if (body.password !== 'test-only-password') return route.fulfill({ status: 400, headers, json: { error: 'invalid_grant', error_description: 'Invalid login credentials' } });
      const expires = Math.floor(Date.now() / 1000) + 3600;
      const token = [Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'), Buffer.from(JSON.stringify({ sub: user, exp: expires, role: 'authenticated' })).toString('base64url'), 'test-signature'].join('.');
      return route.fulfill({ headers, json: { access_token: token, refresh_token: 'test-refresh', token_type: 'bearer', expires_in: 3600, expires_at: expires, user: { id: user, email: body.email || 'learner@example.test', aud: 'authenticated', created_at: '2026-01-01' } } });
    }
    if (path.pathname.includes('/logout')) return route.fulfill({ status: 204, headers });
    if (path.pathname.includes('/user')) return route.fulfill({ headers, json: { id: user, email: 'learner@example.test' } });
    if (path.pathname.endsWith('/rpc/sync_lesson')) {
      calls++;
      const body = request.postDataJSON();
      const result = await rpc(body.p_changes, body.p_import);
      if (lostReply && Object.keys(body.p_changes).length) { lostReply = false; return route.abort('failed'); }
      return route.fulfill({ headers, json: result });
    }
    throw new Error(`Unexpected Supabase endpoint ${path.pathname}`);
  });
}
async function login(page: Page, location = '/#/lessons/trial') {
  await page.goto(location);
  await page.locator('.cloud-progress > summary').click();
  await page.getByLabel('Email', { exact: true }).fill('learner@example.test');
  await page.getByLabel('Пароль', { exact: true }).fill('test-only-password');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Выйти', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!).migrated)).toBe(true);
}
async function sync(page: Page) {
  if (!await page.getByRole('button', { name: 'Синхронизировать', exact: true }).isVisible()) await page.locator('.cloud-progress > summary').click();
  await page.getByRole('button', { name: 'Синхронизировать', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!).pending).length + Object.keys(localStorage).filter(key => key.startsWith('hogwarts-outbox:')).length)).toBe(0);
}
test.beforeEach(async () => {
  lostReply = false; refreshes = 0; calls = 0; tail = Promise.resolve();
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as 'select nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid';
    grant usage on schema auth, public to anon, authenticated;`);
  await db.exec(await readFile('supabase/migrations/202610260001_lesson_sync.sql', 'utf8'));
  await db.exec(`insert into auth.users values ('${user}'); insert into public.lesson_students values ('${user}'); set role authenticated; select set_config('request.jwt.claim.sub', '${user}', false);`);
});
test.afterEach(async () => { await tail; await db.close(); });

test('imports legacy once after login; newer cloud wins; nested answers and backup survive', async ({ page, context }) => {
  await rpc({}, { id: 'existing-device', fields: { name: 'New cloud name', 'answers:cloudOnly': true } });
  await route(context);
  await page.addInitScript(state => {
    if (!localStorage.getItem('hogwarts-english-v1')) localStorage.setItem('hogwarts-english-v1', JSON.stringify({ version: 3, data: state }));
  }, { ...initial, name: 'Legacy name', answers: { grammarA2: { index: 3, questions: { q: { attempts: ['visited'], hint: true } } } }, ratings: { reading: 2 } });
  await login(page);
  const j = await page.evaluate(() => JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!));
  expect(j.state.name).toBe('New cloud name');
  expect(j.state.answers.grammarA2.questions.q.hint).toBe(true);
  expect(j.state.ratings.reading).toBe(2);
  expect(j.backup.name).toBe('Legacy name');
  const before = calls;
  await page.reload();
  await expect.poll(() => calls).toBeGreaterThan(before);
  const rows = await db.query<{ imports: Record<string, number> }>('select imports from public.lesson_progress');
  expect(Object.keys(rows.rows[0].imports)).toHaveLength(2);
});

test('offline edits survive immediate reload; stale same-field changes require a choice', async ({ page, context, browser }) => {
  await route(context); await login(page);
  await page.locator('.nav-item').nth(1).click(); await sync(page);
  const second = await browser.newContext(); await route(second);
  const other = await second.newPage(); await login(other);
  await context.setOffline(true);
  await page.getByPlaceholder('Your name', { exact: true }).fill('Offline name');
  await page.reload().catch(() => {});
  // Offline navigation is unavailable without a service worker; restoring network
  // loads the app and the durable queue, then detects the remote conflict.
  await other.getByPlaceholder('Your name', { exact: true }).fill('Other device name'); await sync(other);
  await context.setOffline(false); await page.goto('/#/lessons/trial');
  await page.locator('.cloud-progress > summary').click();
  await page.getByRole('button', { name: 'Синхронизировать', exact: true }).click();
  await expect(page.getByText(/Поле «name» изменено/)).toBeVisible();
  await expect(page.getByPlaceholder('Your name', { exact: true })).toHaveValue('Offline name');
  await page.getByRole('button', { name: 'Использовать облачную версию', exact: true }).click();
  await expect(page.getByPlaceholder('Your name', { exact: true })).toHaveValue('Other device name');
  await second.close();
});

test('lost response retries safely and session refresh retains the queue', async ({ page, context }) => {
  await route(context); await login(page);
  await page.locator('.nav-item').nth(1).click(); await sync(page);
  lostReply = true;
  await page.getByPlaceholder('Your name', { exact: true }).fill('After lost reply');
  await page.getByRole('button', { name: 'Синхронизировать', exact: true }).click();
  await expect.poll(() => lostReply).toBe(false);
  await sync(page);
  const result = await rpc(); expect(result.fields.name.revision).toBe(2);
  await page.evaluate(key => { const s = JSON.parse(localStorage.getItem(key)!); s.expires_at = 1; localStorage.setItem(key, JSON.stringify(s)); }, authKey);
  await page.reload(); await expect.poll(() => refreshes).toBeGreaterThan(0);
  await expect(page.getByPlaceholder('Your name', { exact: true })).toHaveValue('After lost reply');
});

test('local write-ahead log survives reload while consolidation is blocked', async ({ page, context }) => {
  await route(context); await login(page);
  await page.locator('.nav-item').nth(1).click(); await sync(page);
  await page.evaluate(() => { void navigator.locks.request('hogwarts-progress', () => new Promise(() => {})); });
  await page.getByPlaceholder('Your name', { exact: true }).fill('Saved before lock');
  expect(await page.evaluate(() => Object.keys(localStorage).some(key => key.startsWith('hogwarts-outbox:')))).toBe(true);
  await page.reload();
  await expect(page.getByPlaceholder('Your name', { exact: true })).toHaveValue('Saved before lock');
});

test('two tabs retain independent edits while the shared journal is locked', async ({ page, context }) => {
  await route(context); await login(page);
  await page.locator('.nav-item').nth(1).click(); await sync(page);
  const other = await context.newPage(); await other.goto('/#/lessons/trial');
  await expect(other.getByPlaceholder('Your name', { exact: true })).toBeVisible();
  await other.evaluate(() => {
    const control = window as typeof window & { releaseJournal?: () => void };
    void navigator.locks.request('hogwarts-progress', () => new Promise<void>(resolve => { control.releaseJournal = resolve; }));
  });
  await expect.poll(() => other.evaluate(() => !!(window as typeof window & { releaseJournal?: () => void }).releaseJournal)).toBe(true);
  await page.getByPlaceholder('Your name', { exact: true }).fill('Tab A name');
  await other.getByRole('button', { name: 'Happy!', exact: true }).click();
  await other.evaluate(() => (window as typeof window & { releaseJournal?: () => void }).releaseJournal!());
  await sync(page);
  const result = await rpc();
  expect(result.fields.name.value).toBe('Tab A name');
  expect(result.fields['answers:mood'].value).toBeDefined();
  await other.close();
});

test('failed login and logout preserve progress and do not expose registration', async ({ page, context }) => {
  await route(context); await page.goto('/#/lessons/trial');
  await page.locator('.cloud-progress > summary').click();
  await page.getByLabel('Email', { exact: true }).fill('learner@example.test');
  await page.getByLabel('Пароль', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Не удалось войти');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!).owner)).toBeNull();
  await page.getByLabel('Пароль', { exact: true }).fill('test-only-password');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!).migrated)).toBe(true);
  await page.locator('.nav-item').nth(1).click(); await sync(page);
  await page.getByPlaceholder('Your name', { exact: true }).fill('Retained after logout'); await sync(page);
  await page.getByRole('button', { name: 'Выйти', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Войти', exact: true })).toBeVisible();
  await page.getByPlaceholder('Your name', { exact: true }).fill('Unsynced after logout');
  await page.reload();
  await expect(page.getByPlaceholder('Your name', { exact: true })).toHaveValue('Unsynced after logout');
  const j = await page.evaluate(() => JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!));
  expect(j.pending.name.value).toBe('Unsynced after logout');
  expect(j.owner).toBe(user);
});

test('lesson modules synchronize independently across devices and survive scoped resets', async ({ page, context, browser }) => {
  const oldScore = { correct: true, first: false, latest: true, skill: 'Grammar' };
  await rpc({}, { id: 'pre-platform-progress', fields: { name: 'Вика', step: 7, 'answers:grammar0': 2, 'scores:grammar0': oldScore, 'ratings:reading': 2 } });
  await route(context);
  const home = '/tests/fixtures/platform.html';
  await login(page, home);
  await page.getByLabel('Выбери своё приключение').selectOption('word-quest');
  await page.getByRole('button', { name: 'Начать урок', exact: true }).click();
  await page.getByLabel('Ответ нового урока').fill('Cloud word answer');
  await page.getByRole('button', { name: 'Проверить новый урок' }).click(); await sync(page);
  await page.getByText('Lessons', { exact: true }).click();
  await page.locator('.lesson-menu').getByRole('link', { name: /Волшебное чтение/ }).click();
  await page.getByLabel('Ответ нового урока').fill('Independent reading draft'); await sync(page);
  const second = await browser.newContext(); await route(second);
  const other = await second.newPage(); await login(other, `${home}#/lessons/word-quest`);
  await expect(other.getByLabel('Ответ нового урока')).toHaveValue('Cloud word answer');
  await other.reload(); await expect(other.getByLabel('Ответ нового урока')).toHaveValue('Cloud word answer');
  await other.getByRole('button', { name: 'Сбросить этот урок' }).click(); await sync(other);
  let result = await rpc();
  expect(result.fields['scores:grammar0'].value).toEqual(oldScore);
  expect(result.fields['ratings:reading'].value).toBe(2);
  expect(result.fields['answers:@vika/lesson/reading-quest'].value.data.answers.draft).toBe('Independent reading draft');
  expect(result.fields['answers:@vika/lesson/word-quest'].value.data.answers).toEqual({});
  await page.getByText('Lessons', { exact: true }).click();
  await page.locator('.lesson-menu').getByRole('link', { name: /Пробное занятие/ }).click();
  await expect(page.locator('.section-heading h1')).toHaveText('Grammar spells');
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await page.getByRole('button', { name: 'Restart lesson', exact: true }).click(); await sync(page);
  result = await rpc();
  expect(result.fields['scores:grammar0'].value).toBeNull();
  expect(result.fields['answers:@vika/lesson/reading-quest'].value.data.answers.draft).toBe('Independent reading draft');
  await second.close();
});

test('same lesson edited offline retains both versions for explicit conflict resolution', async ({ page, context, browser }) => {
  const home = '/tests/fixtures/platform.html#/lessons/word-quest';
  await route(context); await login(page, home);
  await page.getByLabel('Ответ нового урока').fill('Original'); await sync(page);
  const second = await browser.newContext(); await route(second);
  const other = await second.newPage(); await login(other, home);
  await context.setOffline(true);
  await page.getByLabel('Ответ нового урока').fill('Offline lesson answer');
  await other.getByLabel('Ответ нового урока').fill('New remote answer'); await sync(other);
  await context.setOffline(false);
  await page.getByRole('button', { name: 'Синхронизировать', exact: true }).click();
  await expect(page.getByText(/Поле «answers:@vika\/lesson\/word-quest» изменено/)).toBeVisible();
  await expect(page.getByLabel('Ответ нового урока')).toHaveValue('Offline lesson answer');
  await page.getByRole('button', { name: 'Использовать облачную версию', exact: true }).click();
  await expect(page.getByLabel('Ответ нового урока')).toHaveValue('New remote answer');
  await second.close();
});

test('Teacher mode is hidden for ddarya.rr, stays hidden after reload and resets when that account signs in', async ({ page, context }) => {
  await route(context);
  await page.goto('/#/lessons/trial');
  await page.getByRole('button', { name: 'Teacher mode', exact: true }).click();
  await expect(page.locator('.teacher-panel')).toBeVisible();
  await page.locator('.cloud-progress > summary').click();
  await page.getByLabel('Email', { exact: true }).fill('ddarya.rr@gmail.com');
  await page.getByLabel('Пароль', { exact: true }).fill('test-only-password');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Выйти', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Teacher mode', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Exit teacher mode', exact: true })).toHaveCount(0);
  await expect(page.locator('.teacher-panel')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Teacher mode', exact: true })).toHaveCount(0);
  await page.locator('.nav-item').nth(11).click();
  await expect(page.getByRole('button', { name: 'Teacher mode', exact: true })).toHaveCount(0);
  await expect(page.locator('.teacher-panel')).toHaveCount(0);
  await page.goto('/#/lessons/lesson-0');
  await page.getByRole('navigation',{name:'Lesson 0 stages'}).getByRole('button').nth(1).click();
  await expect(page.getByRole('button',{name:'Teacher mode',exact:true})).toHaveCount(0);
  await expect(page.getByRole('region',{name:'Who is this?',exact:true}).locator('.tb-speaking-teacher')).toHaveCount(0);
  await page.reload();await expect(page.getByRole('button',{name:'Teacher mode',exact:true})).toHaveCount(0);
  await page.goto('/#/lessons/trial');
  if (!await page.getByRole('button', { name: 'Выйти', exact: true }).isVisible()) await page.locator('.cloud-progress > summary').click();
  await page.getByRole('button', { name: 'Выйти', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Teacher mode', exact: true })).toBeVisible();
  await expect(page.locator('.teacher-panel')).toHaveCount(0);
});

test('an old cloud position in a removed chapter keeps its answers and revisions after reload', async ({ page, context }) => {
  const oldA2 = { index: 3, savedDraft: 'visited' };
  const oldB1 = { index: 6, savedDraft: 'had gone' };
  await rpc({}, { id: 'old-advanced-cloud', fields: { name: 'Вика', step: 13, 'answers:grammarA2': oldA2, 'answers:grammarB1': oldB1, 'answers:differencesSceneVersion': 2, 'answers:differencesFound': [], 'ratings:reading': 2 } });
  await route(context); await login(page);
  await expect(page.locator('.nav-item')).toHaveCount(12);
  await expect(page.locator('.section-heading h1')).toHaveText('Find the differences');
  await expect(page.locator('.grammar-challenge')).toHaveCount(0);
  await sync(page);
  await page.reload();
  await expect(page.locator('.section-heading h1')).toHaveText('Find the differences');
  const result = await rpc();
  expect(result.fields.step.value).toBe(13);
  expect(result.fields.step.revision).toBe(1);
  expect(result.fields['answers:grammarA2'].value).toEqual(oldA2);
  expect(result.fields['answers:grammarB1'].value).toEqual(oldB1);
  expect(result.fields['ratings:reading'].value).toBe(2);
});

test('new Homework 1 retains archived Trial homework drafts across devices', async ({ page, context, browser }) => {
  const draft = '  Hermione usualy drink tea!!\nI is unsure.  ';
  const key = '@vika/lesson/trial-homework/mistake-0';
  await rpc({}, {id:'old-homework',fields:{['answers:'+key]:draft,'answers:diary':'Existing lesson answer','ratings:reading':2}});
  await route(context); await login(page);
  await page.goto('/#/homework/1');
  await expect(page.getByRole('heading',{name:'Lesson 1 — Present Simple Homework',exact:true})).toBeVisible();
  await expect(page.locator('.hw-field, .hw-words')).toHaveCount(0);
  await page.reload(); await sync(page);
  const second=await browser.newContext(); await route(second);
  try {
    const other=await second.newPage(); await login(other);
    for(const current of [page,other]) {
      const journal=await current.evaluate(()=>JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!));
      expect(journal.state.answers[key]).toBe(draft);
      expect(journal.state.answers.diary).toBe('Existing lesson answer');
      expect(journal.state.ratings.reading).toBe(2);
    }
  } finally { await second.close(); }
});

test('rebuilt Lesson 1 restores new responses and resolves offline conflicts while retaining old records',async({page,context,browser})=>{
 const legacy={version:1,data:{step:8,name:'Vika',answers:{grammarNotes:'  Old notes\n ','exercise3:p5-3-2':'Old book draft'},scores:{},ratings:{}}};
 await rpc({}, {id:'existing-lesson-pupil',fields:{'answers:diary':'Keep old lesson','ratings:reading':2,'answers:@vika/lesson/trial-homework/day':'Old homework draft','answers:@vika/lesson/lesson-1':legacy}});
 await route(context);await login(page,'/#/lessons/lesson-1');
 await page.getByRole('navigation',{name:'Lesson 1 topics'}).getByRole('button',{name:/Negative Sentences/}).click();
 await page.getByRole('button',{name:'Next →',exact:true}).click();
 const field=page.locator('.ps2-task textarea').first(),draft='  I no play.\nMy own answer!  ';
 await expect(field).toHaveValue('');await field.fill(draft);await sync(page);
 const second=await browser.newContext();await route(second);
 try{
  const other=await second.newPage();await login(other,'/#/lessons/lesson-1');
  const otherField=other.locator('.ps2-task textarea').first();await expect(otherField).toHaveValue(draft);
  await context.setOffline(true);await field.fill('Offline response');await otherField.fill('Other device response');await sync(other);
  await context.setOffline(false);await page.getByRole('button',{name:'Синхронизировать',exact:true}).click();
  await expect(page.getByText(/Поле «answers:@vika\/lesson\/lesson-1» изменено/)).toBeVisible();
  await expect(field).toHaveValue('Offline response');await page.getByRole('button',{name:'Использовать облачную версию',exact:true}).click();
  await expect(field).toHaveValue('Other device response');await page.reload();await expect(field).toHaveValue('Other device response');
  await page.getByText('Ответы предыдущей версии урока',{exact:true}).click();await expect(page.getByLabel('Заметки по грамматике')).toHaveValue('  Old notes\n ');
  const saved=await rpc();expect(saved.fields['answers:diary'].value).toBe('Keep old lesson');expect(saved.fields['ratings:reading'].value).toBe(2);expect(saved.fields['answers:@vika/lesson/trial-homework/day'].value).toBe('Old homework draft');
  const record=saved.fields['answers:@vika/lesson/lesson-1'].value as typeof legacy;
  expect(record.version).toBe(1);expect(record.data.step).toBe(8);expect(record.data.answers['exercise3:p5-3-2']).toBe('Old book draft');
 }finally{await second.close();}
});

test('Lesson 0 exact answers restore across devices; offline conflict preserves other lessons',async({page,context,browser})=>{
 await rpc({}, {id:'before-expanded-to-be',fields:{'answers:diary':'Keep trial','answers:@vika/lesson/trial-homework/day':'Keep homework','answers:@vika/lesson/lesson-1':{version:1,data:{...initial,answers:{grammarNotes:'Keep Lesson1'}}}}});
 await route(context);await login(page,'/#/lessons/lesson-0');
 await page.getByRole('navigation',{name:'Lesson 0 stages'}).getByRole('button',{name:/Negative Sentences/}).click();
 const original='  am?\n ';
 await page.getByLabel('The café is open.',{exact:true}).fill(original);await sync(page);
 const second=await browser.newContext();await route(second);
 try{
  const other=await second.newPage();await login(other,'/#/lessons/lesson-0');await expect(other.getByLabel('The café is open.',{exact:true})).toHaveValue(original);
  await context.setOffline(true);await page.getByLabel('The café is open.',{exact:true}).fill('Offline answer');await other.getByLabel('The café is open.',{exact:true}).fill('Other device answer');await sync(other);
  await context.setOffline(false);await page.getByRole('button',{name:'Синхронизировать',exact:true}).click();await expect(page.getByText(/Поле «answers:@vika\/lesson\/lesson-0» изменено/)).toBeVisible();
  await expect(page.getByLabel('The café is open.',{exact:true})).toHaveValue('Offline answer');await page.getByRole('button',{name:'Использовать облачную версию',exact:true}).click();await expect(page.getByLabel('The café is open.',{exact:true})).toHaveValue('Other device answer');await page.reload();await expect(page.getByLabel('The café is open.',{exact:true})).toHaveValue('Other device answer');
  const saved=await rpc();expect(saved.fields['answers:diary'].value).toBe('Keep trial');expect(saved.fields['answers:@vika/lesson/trial-homework/day'].value).toBe('Keep homework');expect(saved.fields['answers:@vika/lesson/lesson-1'].value.data.answers.grammarNotes).toBe('Keep Lesson1');
 }finally{await second.close();}
});

test('all twelve correction responses sync verbatim and preserve existing To Be work',async({page,context,browser})=>{
 await rpc({}, {id:'before-corrections',fields:{'answers:diary':'Trial unchanged','answers:@vika/lesson/lesson-0':{version:1,data:{...initial,step:8,answers:{'negative:157-5':'Keep negative draft'}}}}});
 await route(context);await login(page,'/#/lessons/lesson-0');
 const drafts=Array.from({length:12},(_,i)=>`  my incorrect answer ${i+1}!\n `);
 for(let i=0;i<12;i++)await page.locator('.tb-panel textarea').nth(i).fill(drafts[i]);await sync(page);
 const second=await browser.newContext();await route(second);
 try {
  const other=await second.newPage();await login(other,'/#/lessons/lesson-0');
  for(let i=0;i<12;i++)await expect(other.locator('.tb-panel textarea').nth(i)).toHaveValue(drafts[i]);
  await other.reload();await expect(other.locator('.tb-panel textarea').nth(11)).toHaveValue(drafts[11]);
  const saved=await rpc();expect(saved.fields['answers:diary'].value).toBe('Trial unchanged');const record=saved.fields['answers:@vika/lesson/lesson-0'].value.data;
  expect(record.answers['negative:157-5']).toBe('Keep negative draft');
  for(let i=0;i<12;i++)expect(record.answers[`mistake:${String(i+1).padStart(2,'0')}`]).toBe(drafts[i]);
 } finally {await second.close();}
});

test('reordered To Be topics restore legacy reading position and sync new practice by stable keys',async({page,context,browser})=>{
 const old={...initial,step:9,answers:{'reading:0':'  is?  ','negative:157-5':'Old negative','mistake:01':'Old correction','seen:0':true,'seen:1':true}};
 await rpc({}, {id:'before-topic-order',fields:{'answers:@vika/lesson/lesson-0':{version:1,data:old},'answers:diary':'Keep trial'}});
 await route(context);await login(page,'/#/lessons/lesson-0');
 await expect(page.locator('.tb-heading h1')).toHaveText('Mixed Practice');
 await expect(page.getByLabel('Пропуск 1',{exact:true})).toHaveValue('  is?  ');
 await page.getByRole('navigation',{name:'Lesson 0 stages'}).getByRole('button',{name:/Affirmative Sentences/}).click();
 await page.getByLabel('George ... fourteen years old.',{exact:true}).fill('  George is fourteen.\n ');
 await page.getByRole('navigation',{name:'Lesson 0 stages'}).getByRole('button',{name:/Short Answers/}).click();
 await page.getByLabel('Is the boat on the river?',{exact:true}).fill('  Yes, it is.\n ');await sync(page);
 const second=await browser.newContext();await route(second);
 try{
  const other=await second.newPage();await login(other,'/#/lessons/lesson-0');
  await expect(other.locator('.tb-heading h1')).toHaveText('Short Answers');
  await expect(other.getByLabel('Is the boat on the river?',{exact:true})).toHaveValue('  Yes, it is.\n ');
  await other.getByRole('navigation',{name:'Lesson 0 stages'}).getByRole('button',{name:/Mixed Practice/}).click();
  await expect(other.getByLabel('Пропуск 1',{exact:true})).toHaveValue('  is?  ');
  await other.reload();await expect(other.locator('.tb-heading h1')).toHaveText('Mixed Practice');
  const saved=await rpc();const answers=saved.fields['answers:@vika/lesson/lesson-0'].value.data.answers;
  expect(answers['negative:157-5']).toBe('Old negative');expect(answers['mistake:01']).toBe('Old correction');expect(answers['reading:0']).toBe('  is?  ');expect(answers['seen:0']).toBe(true);expect(answers['seen:1']).toBe(true);expect(answers['affirmative:gg3-p4-george-age']).toBe('  George is fourteen.\n ');expect(saved.fields['answers:diary'].value).toBe('Keep trial');
 }finally{await second.close();}
});

test('Lesson 1 stable matching and writing IDs restore after reload and on a second device',async({page,context,browser})=>{
 const retired={version:1,data:{step:0,name:'',scores:{},ratings:{},answers:{'present-simple:v2':{schemaVersion:2,activePage:'places/town-museum/town-museum-where',seen:['places'],responses:{'place-gap-01':'old cinema','town-museum-where':'old museum draft','transport-match-bike':'bike','transport-gap-01':'old bus','transport-write-01':'old journey'}}}}};
 await rpc({}, {id:'retired-places',fields:{'answers:@vika/lesson/lesson-1':retired}});
 await route(context);await login(page,'/#/lessons/lesson-1');
 await page.getByRole('navigation',{name:'Lesson 1 topics'}).getByRole('button',{name:/Means of Transport/}).click();
 await expect(page.locator('.ps2-by-badge')).toHaveText('By …');
 await page.getByRole('button',{name:'Next →',exact:true}).click();
 await page.getByRole('button',{name:'Next transport picture',exact:true}).click();
 const picture=await page.getByRole('button',{name:'Next transport picture',exact:true}).locator('img').getAttribute('alt');
 await page.getByRole('navigation',{name:'Lesson 1 topics'}).getByRole('button',{name:/Affirmative Sentences/}).click();
 await page.getByRole('button',{name:'Next →',exact:true}).click();
 await page.getByRole('button',{name:'Next →',exact:true}).click();
 const draft='  My sentence stays.\n ';await page.locator('.ps2-task textarea').first().fill(draft);await sync(page);
 const second=await browser.newContext();await route(second);
 try{
  const other=await second.newPage();await login(other,'/#/lessons/lesson-1');await expect(other.locator('.ps2-task textarea').first()).toHaveValue(draft);
  await other.getByRole('navigation',{name:'Lesson 1 topics'}).getByRole('button',{name:/Means of Transport/}).click();await other.getByRole('button',{name:'Next →',exact:true}).click();
  await expect(other.getByRole('button',{name:'Next transport picture',exact:true}).locator('img')).toHaveAttribute('alt',picture!);await other.reload();await expect(other.getByRole('button',{name:'Next transport picture',exact:true}).locator('img')).toHaveAttribute('alt',picture!);
  await other.getByRole('navigation',{name:'Lesson 1 topics'}).getByRole('button',{name:/Write your journeys/}).click();
  await other.locator('.ps2-subnav a').filter({hasText:'Write your journeys · 1–4'}).click();
  await other.locator('.ps2-journey-pair textarea').nth(0).fill('How do you usually get to school?');
  await other.locator('.ps2-journey-pair textarea').nth(1).fill('  I usually go by tram.\n ');await sync(other);await sync(page);
  await expect(page.locator('.ps2-journey-pair textarea').nth(0)).toHaveValue('How do you usually get to school?');
  await expect(page.locator('.ps2-journey-pair textarea').nth(1)).toHaveValue('  I usually go by tram.\n ');

  const saved=await rpc();const responses=saved.fields['answers:@vika/lesson/lesson-1'].value.data.answers['present-simple:v2'].responses;
  expect(responses['place-gap-01']).toBe('old cinema');expect(responses['town-museum-where']).toBe('old museum draft');expect(responses['transport-match-bike']).toBe('bike');expect(responses['transport-gap-01']).toBe('old bus');expect(responses['transport-write-01']).toBe('old journey');

 }finally{await second.close();}
});

test('Lesson 0 oral scene and town choices sync without changing written progress or other lessons',async({page,context,browser})=>{
 const lesson={version:1,data:{step:1,name:'Vika',answers:{toBeActiveBlock:'affirmative','affirmative:gg3-p4-george-age':'  Old full sentence.\n '},scores:{},ratings:{}}};
 await rpc({}, {id:'oral-scenes-pupil',fields:{'answers:@vika/lesson/lesson-0':lesson,'answers:diary':'Keep Trial','answers:@vika/lesson/trial-homework/day':'Keep Homework','answers:@vika/lesson/lesson-1':{version:1,data:{step:0,name:'',scores:{},ratings:{},answers:{'present-simple:v2':{schemaVersion:2,activePage:'welcome/everyday-book',seen:['welcome'],responses:{'final-story':'Keep Lesson 1'}}}}}}});
 await route(context);await login(page,'/#/lessons/lesson-0');
 const who=page.getByRole('region',{name:'Who is this?',exact:true});await who.getByRole('button',{name:'Картинка 2',exact:true}).click();
 await page.getByRole('navigation',{name:'Lesson 0 stages'}).getByRole('button').nth(0).click();
 const town=page.getByRole('region',{name:'Hogwarts Magic Town — Look and Say',exact:true});await town.getByRole('button',{name:'Transport',exact:true}).click();await expect(town.getByRole('heading',{name:'car',exact:true})).toBeVisible();
 await page.getByRole('navigation',{name:'Lesson 0 stages'}).getByRole('button').nth(3).click();
 const describe=page.getByRole('region',{name:'Hogwarts Magic Town — Look and Describe',exact:true});await describe.getByRole('button',{name:'Картинка 8',exact:true}).click();await sync(page);
 const second=await browser.newContext();await route(second);
 try{
  const other=await second.newPage();await login(other,'/#/lessons/lesson-0');
  const otherDescribe=other.getByRole('region',{name:'Hogwarts Magic Town — Look and Describe',exact:true});await expect(otherDescribe.getByRole('button',{name:'Картинка 8',exact:true})).toHaveAttribute('aria-pressed','true');
  await other.getByRole('navigation',{name:'Lesson 0 stages'}).getByRole('button').nth(0).click();
  const otherTown=other.getByRole('region',{name:'Hogwarts Magic Town — Look and Say',exact:true});await expect(otherTown.getByRole('heading',{name:'car',exact:true})).toBeVisible();
  await other.getByRole('navigation',{name:'Lesson 0 stages'}).getByRole('button').nth(1).click();await expect(other.getByRole('region',{name:'Who is this?',exact:true}).getByRole('button',{name:'Картинка 2',exact:true})).toHaveAttribute('aria-pressed','true');
  await expect(other.getByLabel('George ... fourteen years old.',{exact:true})).toHaveValue('  Old full sentence.\n ');
  const saved=await rpc();expect(saved.fields['answers:diary'].value).toBe('Keep Trial');expect(saved.fields['answers:@vika/lesson/trial-homework/day'].value).toBe('Keep Homework');
  expect(saved.fields['answers:@vika/lesson/lesson-1'].value).toMatchObject({data:{answers:{'present-simple:v2':{responses:{'final-story':'Keep Lesson 1'}}}}});
 }finally{await second.close();}
});

test('unreachable Supabase does not block lessons or lose locally queued answers after reload',async({page,context})=>{
 await route(context);await login(page,'/#/lessons/lesson-0');
 // Simulate only the API being blocked: same-origin HTML/JS/images remain reachable.
 await context.route('https://supabase.test/**',request=>request.abort('failed'));
 await page.getByRole('navigation',{name:'Lesson 0 stages'}).getByRole('button').nth(3).click();
 const field=page.getByLabel('The hospital is clean.',{exact:true}),draft='  Local pupil draft.\nKeep this original answer.  ';
 await field.fill(draft);await page.reload();await expect(field).toHaveValue(draft);
 await expect.poll(()=>page.evaluate(()=>{
  const journal=JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!);
  return Object.keys(journal.pending).length+Object.keys(localStorage).filter(key=>key.startsWith('hogwarts-outbox:')).length;
 })).toBeGreaterThan(0);
 if(!await page.getByRole('button',{name:'Синхронизировать',exact:true}).isVisible())await page.locator('.cloud-progress > summary').click();
 await page.getByRole('button',{name:'Синхронизировать',exact:true}).click();
 await expect(page.getByRole('status').filter({hasText:/Синхронизация недоступна/})).toBeVisible();
 await page.goto('/#/lessons/lesson-1');await expect(page.getByRole('heading',{name:'The Magic of Everyday Life',exact:true})).toBeVisible();
 await page.goto('/#/lessons/trial');await expect(page.getByRole('heading',{name:'Welcome to Hogwarts!',exact:true})).toBeVisible();
 // The API failure has not been disguised as successful cloud synchronization.
 const stored=await rpc();expect(stored.fields['answers:@vika/lesson/lesson-0']?.value?.data?.answers?.['question:gg3-p5-hospital-clean']).not.toBe(draft);
});

test('Homework 0 gaps sync independently across devices without changing lesson records', async ({page,context,browser})=>{
 const lesson={version:1,data:{step:5,name:'Vika',answers:{'complete:old':'Keep my lesson answer'},scores:{},ratings:{}}};
 await rpc({}, {id:'existing-lesson',fields:{'answers:@vika/lesson/lesson-0':lesson,'answers:@vika/lesson/trial-homework/old':'Keep old homework'}});
 await route(context);await login(page);await page.goto('/#/homework/0');
 await page.getByLabel('Task 1, sentence 1, gap 1',{exact:true}).fill('  IS?  ');
 await page.getByLabel('Task 4, sentence 4, gap 2',{exact:true}).fill("aren't");
 await page.getByLabel('Task 2, sentence 1, translation',{exact:true}).fill('  My bike is clean.  ');
 await page.getByLabel('Task 3, dialogue 1, translation',{exact:true}).fill('Where is Harry?\nHe is at Hogwarts.');
 await page.getByLabel('Task 5, My Hogwarts Profile',{exact:true}).fill('  I am a pupil.\nI am not tired.  ');await sync(page);
 const second=await browser.newContext();await route(second);
 try{
  const other=await second.newPage();await login(other);await other.goto('/#/homework/0');
  await expect(other.getByLabel('Task 1, sentence 1, gap 1',{exact:true})).toHaveValue('  IS?  ');
  await expect(other.getByLabel('Task 4, sentence 4, gap 2',{exact:true})).toHaveValue("aren't");
  await expect(other.getByLabel('Task 2, sentence 1, translation',{exact:true})).toHaveValue('  My bike is clean.  ');
  await expect(other.getByLabel('Task 3, dialogue 1, translation',{exact:true})).toHaveValue('Where is Harry?\nHe is at Hogwarts.');
  await expect(other.getByLabel('Task 5, My Hogwarts Profile',{exact:true})).toHaveValue('  I am a pupil.\nI am not tired.  ');
  await context.setOffline(true);
  await page.getByLabel('Task 1, sentence 10, gap 1',{exact:true}).fill('my offline draft');
  await page.getByLabel('Task 5, My Hogwarts Profile',{exact:true}).fill('  Offline profile\nkept exactly.  ');
  await other.getByLabel('Task 1, sentence 10, gap 2',{exact:true}).fill('my other draft');
  await other.getByLabel('Task 2, sentence 2, translation',{exact:true}).fill('My parents are at the restaurant.');await sync(other);
  await context.setOffline(false);await sync(page);await page.reload();
  await expect(page.getByLabel('Task 1, sentence 10, gap 1',{exact:true})).toHaveValue('my offline draft');
  await expect(page.getByLabel('Task 1, sentence 10, gap 2',{exact:true})).toHaveValue('my other draft');
  await expect(page.getByLabel('Task 5, My Hogwarts Profile',{exact:true})).toHaveValue('  Offline profile\nkept exactly.  ');
  await expect(page.getByLabel('Task 2, sentence 2, translation',{exact:true})).toHaveValue('My parents are at the restaurant.');
  const journal=await page.evaluate(()=>JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!));
  expect(journal.state.answers['@vika/lesson/lesson-0']).toEqual(lesson);
  expect(journal.state.answers['@vika/lesson/trial-homework/old']).toBe('Keep old homework');
 }finally{await second.close();}
});

test('private homework photos upload, sync metadata and open on another device; failed uploads retain files',async({page,context,browser})=>{
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jp9sAAAAASUVORK5CYII=','base64');
 const objects=new Set<string>(); let unavailable=true; let allowDelete=false;
 const storage=async(ctx:BrowserContext)=>ctx.route('https://supabase.test/storage/v1/**',async route=>{
  const req=route.request(),url=new URL(req.url());
  const headers={'access-control-allow-origin':'*','access-control-allow-headers':'*','content-type':'application/json'};
  if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});
  if(unavailable)return route.fulfill({status:404,headers,json:{message:'Bucket not found',statusCode:'404'}});
  if(url.pathname.includes('/object/sign/')){
   const key=url.pathname.split('/object/sign/')[1];
   if(!objects.has(key))return route.fulfill({status:400,headers,json:{message:'Object not found',statusCode:'400'}});
   if(req.method()==='GET')return route.fulfill({headers:{...headers,'content-type':'image/png'},body:png});
   return route.fulfill({headers,json:{signedURL:`/object/sign/${key}?token=test-only`}});
  }
  if(req.method()==='DELETE'){
   const removed=[];
   for(const path of req.postDataJSON().prefixes) if(allowDelete && objects.delete(`homework-photos/${path}`)) removed.push({name:path});
   return route.fulfill({headers,json:removed});
  }
  if(req.method()==='POST'){
   expect(req.headers().authorization).toMatch(/^Bearer /);
   const key=url.pathname.split('/object/')[1];expect(key).toContain(`homework-photos/${user}/homework-0/`);
   objects.add(key);return route.fulfill({headers,json:{Key:key}});
  }
  return route.fulfill({status:404,headers,json:{message:'Not found'}});
 });
 await route(context);await storage(context);await login(page);await page.goto('/#/homework/0');
 await page.getByLabel('Выбрать фотографии домашней работы').setInputFiles({name:'notebook.png',mimeType:'image/png',buffer:png});
 await expect(page.getByRole('alert')).toContainText('Облачная загрузка не завершена');
 await expect(page.locator('.hw0-photo')).toHaveCount(1);
 await page.reload();await expect(page.locator('.hw0-photo')).toHaveCount(1);
 unavailable=false;await page.getByRole('button',{name:'Отправить в облако',exact:true}).click();
 await expect(page.locator('.hw0-photo')).toContainText('Файл загружен.');await sync(page);
 const second=await browser.newContext();await route(second);await storage(second);
 try{
  const other=await second.newPage();await login(other);await other.goto('/#/homework/0');
  await expect(other.locator('.hw0-photo')).toContainText('notebook.png');
  await expect.poll(()=>other.locator('.hw0-photo img').evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBe(1);
  const journal=await other.evaluate(()=>JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!));
  const keys=Object.keys(journal.state.answers).filter(k=>k.startsWith('@vika/lesson/lesson-0-homework/photo/'));
  expect(keys).toHaveLength(1);expect(journal.state.answers[keys[0]].owner).toBe(user);
  expect(JSON.stringify(journal.state.answers[keys[0]])).not.toContain('data:image');
  other.once('dialog',dialog=>dialog.accept());
  await other.getByRole('button',{name:'Удалить фото notebook.png',exact:true}).click();
  await expect(other.getByRole('alert')).toContainText('Удаление не подтверждено');
  await expect(other.locator('.hw0-photo')).toHaveCount(1);
  await other.reload();
  await expect(other.getByRole('button',{name:'Удалить фото notebook.png',exact:true})).toHaveText('Повторить удаление');
  allowDelete=true;other.once('dialog',dialog=>dialog.accept());
  await other.getByRole('button',{name:'Удалить фото notebook.png',exact:true}).click();
  await expect(other.locator('.hw0-photo')).toHaveCount(0);await sync(other);
  await sync(page);await expect(page.locator('.hw0-photo')).toHaveCount(0);
  await page.reload();await expect(page.locator('.hw0-photo')).toHaveCount(0);
  const remaining=await page.evaluate(async()=>new Promise(resolve=>{const r=indexedDB.open('vika-homework-photos',1);r.onsuccess=()=>{const db=r.result,t=db.transaction('photos','readonly'),q=t.objectStore('photos').getAll();t.oncomplete=()=>{resolve(q.result.length);db.close();};};}));
  expect(remaining).toBe(0);

 }finally{await second.close();}
});

test('standalone Question Machine restores drafts while preserving retired Workshop answers',async({page,context,browser})=>{
 await rpc({}, {id:'jobs-page-six-pupil',fields:{'answers:@vika/lesson/lesson-1':{version:1,data:{...initial,answers:{'present-simple:v2':{schemaVersion:2,activePage:'jobs-lab/jobs-groups/gg6-groups-artist',seen:['jobs-lab'],responses:{'affirm-translate-01':'Keep my earlier translation','gg6-groups-artist':'["Work outdoors","Work indoors"]'}}}}}}});
 await route(context);await login(page,'/#/lessons/lesson-1');
 await expect(page.locator('.ps2-heading h1')).toHaveText('The Question Machine');
 const machine=page.locator('.ps2-question-machine').first();await machine.locator('.ps2-chunk-bank button').nth(2).click();await machine.locator('.ps2-chunk-bank button').nth(3).click();await sync(page);
 const second=await browser.newContext();await route(second);
 try{
  const other=await second.newPage();await login(other,'/#/lessons/lesson-1');await expect(other.locator('.ps2-question-machine').first().locator('.ps2-chunk-answer button')).toHaveText(['Where','does']);
  const saved=await rpc();const responses=saved.fields['answers:@vika/lesson/lesson-1'].value.data.answers['present-simple:v2'].responses;expect(responses['affirm-translate-01']).toBe('Keep my earlier translation');expect(responses['gg6-groups-artist']).toBe('["Work outdoors","Work indoors"]');
 }finally{await second.close();}
});

test('Lesson 1 warm-up discoveries sync across devices and replay preserves Trial, Lesson 0 and written answers',async({page,context,browser})=>{
 await rpc({}, {id:'warmup-existing-pupil',fields:{'answers:differencesFound':[0,2],'answers:differencesSceneVersion':2,'answers:@vika/lesson/lesson-0':{version:1,data:{...initial,answers:{'negative:157-5':'Keep Lesson 0'}}},'answers:@vika/lesson/lesson-1':{version:1,data:{...initial,answers:{'present-simple:v2':{schemaVersion:2,activePage:'warmup/warmup-differences/lesson1-warmup-differences:v1',seen:[],responses:{'affirm-translate-01':'Keep my translation'}}}}}}});
 await route(context);await login(page,'/#/lessons/lesson-1');
 const game=page.locator('.ps2-warmup');await game.getByRole('button',{name:'Compare area 1 in picture A',exact:true}).click();await game.getByRole('button',{name:'Compare area 5 in picture B',exact:true}).click();await sync(page);
 const second=await browser.newContext();await route(second);
 try{
  const other=await second.newPage();await login(other,'/#/lessons/lesson-1');const otherGame=other.locator('.ps2-warmup');await expect(otherGame.locator('.difference-counter')).toContainText('2 / 7');
  for(const index of [1,2,3,5,6])await otherGame.locator('.difference-scene').first().getByRole('button').nth(index).click();await sync(other);await sync(page);
  await expect(game.locator('.difference-counter')).toContainText('7 / 7');await game.getByRole('button',{name:'Play Again',exact:true}).click();await sync(page);await sync(other);
  await expect(otherGame.locator('.difference-counter')).toContainText('0 / 7');
  const saved=await rpc();expect(saved.fields['answers:differencesFound'].value).toEqual([0,2]);expect(saved.fields['answers:differencesSceneVersion'].value).toBe(2);expect(saved.fields['answers:@vika/lesson/lesson-0'].value.data.answers['negative:157-5']).toBe('Keep Lesson 0');
  const responses=saved.fields['answers:@vika/lesson/lesson-1'].value.data.answers['present-simple:v2'].responses;expect(responses['affirm-translate-01']).toBe('Keep my translation');expect(JSON.parse(responses['lesson1-warmup-differences:v1'])).toMatchObject({found:[],completedOnce:true});
 }finally{await second.close();}
});

test('Lesson 1 homework syncs assignments and retains archived notebook answers without altering older work',async({page,context,browser})=>{
 test.setTimeout(90000);
 const prefix='@vika/lesson/lesson-1-homework/v1/',agency=prefix+'job-agency';
 const oldHw0='@vika/lesson/lesson-0-homework/written/profile/hogwarts',oldTrial='@vika/lesson/trial-homework/day';
 await rpc({}, {id:'present-simple-homework',fields:{['answers:'+prefix+'written/negatives/morning-tea']:'Keep negative draft',['answers:'+prefix+'written/detective/she-works']:'Keep detective draft',['answers:'+oldHw0]:'Keep Homework 0',['answers:'+oldTrial]:'Keep Trial homework','answers:@vika/lesson/lesson-0':{version:1,data:{...initial,answers:{'mistake:01':'Keep Lesson 0'}}}}});
 await route(context);await login(page,'/#/homework/1');
 await page.getByRole('button',{name:'Select pilot',exact:true}).click();await page.getByRole('button',{name:'Place selected job in description 1',exact:true}).click();
 await page.locator('#hw1-task-4 textarea').first().fill('  My own answer about Anna.\n ');
 await sync(page);
 const second=await browser.newContext();await route(second);
 try{
  const other=await second.newPage();await login(other,'/#/homework/1');await expect(other.locator('[data-slot=paint]')).toContainText('pilot');await expect(other.locator('.hw1-notebook-done')).toHaveCount(0);
  await expect(other.locator('#hw1-task-4 textarea').first()).toHaveValue('  My own answer about Anna.\n ');
  await expect(other.locator('#hw1-task-6 textarea,#hw1-task-7 textarea')).toHaveCount(0);
  await other.reload();await expect(other.locator('#hw1-task-7')).toContainText('WRITE IN YOUR NOTEBOOK');
  await context.setOffline(true);await page.getByRole('button',{name:'Select pilot',exact:true}).click();await page.getByRole('button',{name:'Place selected job in description 2',exact:true}).click();
  await other.getByRole('button',{name:'Select teacher',exact:true}).click();await other.getByRole('button',{name:'Place selected job in description 3',exact:true}).click();await sync(other);
  await context.setOffline(false);await page.getByRole('button',{name:'Синхронизировать',exact:true}).click();await expect(page.getByText(`Поле «answers:${agency}» изменено на другом устройстве.`)).toBeVisible();
  await page.getByRole('button',{name:'Использовать облачную версию',exact:true}).click();await expect(page.locator('[data-slot=paint]')).toContainText('pilot');await expect(page.locator('[data-slot=bus]')).toContainText('teacher');
  const saved=await rpc();expect(saved.fields['answers:'+oldHw0].value).toBe('Keep Homework 0');expect(saved.fields['answers:'+oldTrial].value).toBe('Keep Trial homework');expect(saved.fields['answers:@vika/lesson/lesson-0'].value.data.answers['mistake:01']).toBe('Keep Lesson 0');
  expect(saved.fields['answers:'+prefix+'written/negatives/morning-tea'].value).toBe('Keep negative draft');expect(saved.fields['answers:'+prefix+'written/detective/she-works'].value).toBe('Keep detective draft');
  const placed=Object.values(saved.fields['answers:'+agency].value.placements);expect(new Set(placed).size).toBe(placed.length);
 }finally{await second.close();}
});

test('Mystery House drafts sync across devices, keep old lessons and hide teacher text for the learner',async({page,context,browser})=>{
 test.setTimeout(90000);
 const oldKey='answers:@vika/lesson/lesson-1',newKey='answers:@vika/lesson/lesson-2';
 await rpc({}, {id:'mystery-house-old-data',fields:{[oldKey]:{version:1,data:{...initial,answers:{old:'Keep Lesson 1'}}},'answers:@vika/lesson/lesson-0-homework/written/profile/hogwarts':'Keep homework'}});
 await route(context);await login(page,'/#/lessons/lesson-2');
 await page.getByRole('button',{name:/^Door 1 —/}).click();await page.getByRole('button',{name:'Выбрать Hermione',exact:true}).click();await page.getByRole('button',{name:'Сохранить · Раунд 2',exact:true}).click();await page.getByRole('button',{name:'Выбрать Ron',exact:true}).click();await sync(page);
 const second=await browser.newContext();await route(second);
 try{const other=await second.newPage();await login(other,'/#/lessons/lesson-2');await expect(other.getByRole('button',{name:'Выбрать Ron',exact:true})).toHaveAttribute('aria-pressed','true');await expect(other.locator('.mh-progress')).toHaveText('1 из 12 раундов');await other.reload();await expect(other.getByRole('button',{name:'Выбрать Ron',exact:true})).toHaveAttribute('aria-pressed','true');
  await other.getByRole('button',{name:'Сохранить · К дому',exact:true}).click();await sync(other);await sync(page);await expect(page.locator('.mh-door-done')).toHaveCount(1);
  const saved=await rpc();expect(saved.fields[oldKey].value.data.answers.old).toBe('Keep Lesson 1');expect(saved.fields['answers:@vika/lesson/lesson-0-homework/written/profile/hogwarts'].value).toBe('Keep homework');expect(saved.fields[newKey].value.data.answers['mystery-house/v1/who/tired'].submitted).toBe(true);
 }finally{await second.close();}
 await page.goto('/#/lessons/lesson-2');await page.getByRole('button',{name:'Teacher mode',exact:true}).click();await page.getByRole('button',{name:/^Door 1 —/}).click();await expect(page.locator('.mh-teacher')).toBeVisible();
 if(!await page.getByRole('button',{name:'Выйти',exact:true}).isVisible())await page.locator('.cloud-progress > summary').click();await page.getByRole('button',{name:'Выйти',exact:true}).click();await page.getByLabel('Email',{exact:true}).fill('ddarya.rr@gmail.com');await page.getByLabel('Пароль',{exact:true}).fill('test-only-password');await page.getByRole('button',{name:'Войти',exact:true}).click();await expect(page.getByRole('button',{name:'Выйти',exact:true})).toBeVisible();await expect(page.locator('.mh-teacher')).toHaveCount(0);await expect(page.getByRole('button',{name:'Teacher mode',exact:true})).toHaveCount(0);await page.reload();await expect(page.locator('.mh-teacher')).toHaveCount(0);await expect(page.getByRole('button',{name:'Teacher mode',exact:true})).toHaveCount(0);
});
test('Articles answers restore on a second device without changing Mystery House',async({page,context,browser})=>{
 await route(context);await login(page,'/#/lessons/lesson-2');await page.getByRole('button',{name:/^Door 1 —/}).click();await page.getByRole('button',{name:'Выбрать Hermione',exact:true}).click();await page.getByRole('button',{name:'К дому',exact:true}).click();await page.locator('.ar-sidebar button').nth(1).click();for(let i=0;i<3;i++)await page.getByRole('button',{name:'Понятно · Дальше →',exact:true}).click();await page.getByRole('button',{name:'artist',exact:true}).click();await page.getByRole('button',{name:'an',exact:true}).click();await sync(page);const second=await browser.newContext();await route(second);try{const other=await second.newPage();await login(other,'/#/lessons/lesson-2');await expect(other.getByRole('button',{name:'an artist',exact:true})).toBeVisible();await other.locator('.ar-sidebar button').first().click();await other.getByRole('button',{name:/^Door 1 —/}).click();await expect(other.getByRole('button',{name:'Выбрать Hermione',exact:true})).toHaveAttribute('aria-pressed','true');}finally{await second.close();}
});
test('Golden Key quest restores guardian drafts on another device and retains all investigation fields',async({page,context,browser})=>{
 const prefix='golden-key/v1/',answers:any={'articles/v1/page':11,[prefix+'phase']:5,[prefix+'guardian-index']:0,[prefix+'match/hospital']:'doctor',[prefix+'question/hospital']:['t2','t3','t1','t0'],[prefix+'interview/hospital']:true,[prefix+'letter/hospital']:true,[prefix+'exclude/hospital']:true,[prefix+'lock/0']:'an'};
 await rpc({}, {id:'golden-key-cloud',fields:{'answers:@vika/lesson/lesson-2':{version:1,data:{...initial,answers}},'answers:@vika/lesson/lesson-0-homework/written/profile/hogwarts':'Keep homework'}});await route(context);await login(page,'/#/lessons/lesson-2');await page.locator('#guardian-answer').fill('  My own free answer.\n ');await page.getByRole('button',{name:'Next Question',exact:true}).click();await page.locator('#guardian-answer').fill('  Another ungraded answer.\n ');await sync(page);const second=await browser.newContext();await route(second);try{const other=await second.newPage();await login(other,'/#/lessons/lesson-2');await expect(other.locator('#guardian-answer')).toHaveValue('  Another ungraded answer.\n ');await other.getByRole('button',{name:'Previous Question',exact:true}).click();await expect(other.locator('#guardian-answer')).toHaveValue('  My own free answer.\n ');await other.reload();await expect(other.locator('#guardian-answer')).toHaveValue('  My own free answer.\n ');await sync(other);const saved=await rpc();const actual=saved.fields['answers:@vika/lesson/lesson-2'].value.data.answers;for(const key of ['match/hospital','question/hospital','interview/hospital','letter/hospital','exclude/hospital','lock/0'])expect(actual[prefix+key]).toEqual(answers[prefix+key]);expect(saved.fields['answers:@vika/lesson/lesson-0-homework/written/profile/hogwarts'].value).toBe('Keep homework');}finally{await second.close();}
});
