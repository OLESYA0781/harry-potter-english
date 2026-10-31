import { test, expect } from '@playwright/test';
import type { Page, BrowserContext } from '@playwright/test';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
const user = '00000000-0000-0000-0000-000000000001';
const authKey = 'hogwarts-auth:https://supabase.test';
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
  await page.getByText('Облачное сохранение · Войти', { exact: true }).click();
  await page.getByLabel('Email', { exact: true }).fill('learner@example.test');
  await page.getByLabel('Пароль', { exact: true }).fill('test-only-password');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Выйти', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!).migrated)).toBe(true);
}
async function sync(page: Page) {
  if (!await page.getByRole('button', { name: 'Синхронизировать', exact: true }).isVisible()) await page.getByText(/Облачное сохранение ·/).first().click();
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
  await page.getByText(/Облачное сохранение ·/).first().click();
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
  await page.getByText('Облачное сохранение · Войти', { exact: true }).click();
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
  await page.getByText('Уроки', { exact: true }).click();
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
  await page.getByText('Уроки', { exact: true }).click();
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
  await page.getByText('Облачное сохранение · Войти', { exact: true }).click();
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
  if (!await page.getByRole('button', { name: 'Выйти', exact: true }).isVisible()) await page.getByText(/Облачное сохранение ·/).first().click();
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

test('homework sync preserves exact drafts across devices and independent offline edits', async ({ page, context, browser }) => {
  await rpc({}, {id:'old-trial',fields:{'answers:diary':'Existing lesson answer', 'ratings:reading':2}});
  await route(context); await login(page);
  await page.getByRole('tab',{name:'Homework',exact:true}).click();
  await page.getByLabel('Переведи «обычно» на английский.').fill('usualy');
  await page.getByRole('button',{name:"2. Найди и исправь ошибки"}).click();
  const draft = '  Hermione usualy drink tea!!\nI is unsure.  ';
  await page.locator('.hw-field textarea').first().fill(draft); await sync(page);
  const second = await browser.newContext(); await route(second);
  try {
    const other = await second.newPage(); await login(other);
    await other.getByRole('tab',{name:'Homework',exact:true}).click();
    await expect(other.getByLabel('Переведи «обычно» на английский.')).toHaveValue('usualy');
    await other.getByRole('button',{name:"2. Найди и исправь ошибки"}).click();
    await expect(other.locator('.hw-field textarea').first()).toHaveValue(draft);
    await context.setOffline(true);
    await page.locator('.hw-field textarea').nth(1).fill('  Ron is sit.\n ');
    await other.getByRole('button',{name:'4. A Day at Hogwarts'}).click();
    await other.getByLabel('My magical day').fill('I has owl.');
    await sync(other);
    await context.setOffline(false); await sync(page);
    await page.reload(); await page.getByRole('tab',{name:'Homework',exact:true}).click();
    await page.getByRole('button',{name:"2. Найди и исправь ошибки"}).click();
    await expect(page.locator('.hw-field textarea').first()).toHaveValue(draft);
    await expect(page.locator('.hw-field textarea').nth(1)).toHaveValue('  Ron is sit.\n ');
    await page.getByRole('button',{name:'4. A Day at Hogwarts'}).click();
    await expect(page.getByLabel('My magical day')).toHaveValue('I has owl.');
    await expect(page.getByLabel('Mark as completed')).toHaveCount(0);
    const journal = await page.evaluate(()=>JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!));
    expect(journal.state.answers.diary).toBe('Existing lesson answer');
    expect(journal.state.ratings.reading).toBe(2);
  } finally { await second.close(); }
});

test('Lesson 1 restores on a second device, preserves Trial/Homework and resolves offline conflicts',async({page,context,browser})=>{
  await rpc({}, {id:'existing-lesson-pupil',fields:{'answers:diary':'Keep old lesson', 'ratings:reading':2, 'answers:@vika/lesson/trial-homework/day':'Old homework draft'}});
  await route(context);await login(page,'/#/lessons/lesson-1');
  await page.getByRole('navigation',{name:'Lesson 1 stages'}).getByRole('button').nth(1).click();
  await page.getByRole('button',{name:'Next slide →',exact:true}).click();
  const note='  I is Vika.\nMy original notes!  ';
  await page.getByLabel('Мои заметки по грамматике').fill(note);await sync(page);
  const second=await browser.newContext();await route(second);
  try {
    const other=await second.newPage();await login(other,'/#/lessons/lesson-1');
    await expect(other.getByRole('heading',{name:'Signal Words',exact:true})).toBeVisible();
    await expect(other.getByLabel('Мои заметки по грамматике')).toHaveValue(note);
    await context.setOffline(true);await page.getByLabel('Мои заметки по грамматике').fill('Offline notes');
    await other.getByLabel('Мои заметки по грамматике').fill('Other device notes');await sync(other);
    await context.setOffline(false);await page.getByRole('button',{name:'Синхронизировать',exact:true}).click();
    await expect(page.getByText(/Поле «answers:@vika\/lesson\/lesson-1» изменено/)).toBeVisible();
    await expect(page.getByLabel('Мои заметки по грамматике')).toHaveValue('Offline notes');
    await page.getByRole('button',{name:'Использовать облачную версию',exact:true}).click();
    await expect(page.getByLabel('Мои заметки по грамматике')).toHaveValue('Other device notes');
    await page.reload();await expect(page.getByLabel('Мои заметки по грамматике')).toHaveValue('Other device notes');
    const saved=await rpc();expect(saved.fields['answers:diary'].value).toBe('Keep old lesson');expect(saved.fields['ratings:reading'].value).toBe(2);expect(saved.fields['answers:@vika/lesson/trial-homework/day'].value).toBe('Old homework draft');
  } finally {await second.close();}
});

test('Lesson 0 exact answers restore across devices; offline conflict preserves other lessons',async({page,context,browser})=>{
 await rpc({}, {id:'before-expanded-to-be',fields:{'answers:diary':'Keep trial','answers:@vika/lesson/trial-homework/day':'Keep homework','answers:@vika/lesson/lesson-1':{version:1,data:{...initial,answers:{grammarNotes:'Keep Lesson1'}}}}});
 await route(context);await login(page,'/#/lessons/lesson-0');
 await page.getByRole('navigation',{name:'Lesson 0 stages'}).getByRole('button').nth(11).click();
 const original='  am?\n ';
 await page.getByLabel('Утверждение 1',{exact:true}).fill(original);await sync(page);
 const second=await browser.newContext();await route(second);
 try{
  const other=await second.newPage();await login(other,'/#/lessons/lesson-0');await expect(other.getByLabel('Утверждение 1',{exact:true})).toHaveValue(original);
  await context.setOffline(true);await page.getByLabel('Утверждение 1',{exact:true}).fill('Offline answer');await other.getByLabel('Утверждение 1',{exact:true}).fill('Other device answer');await sync(other);
  await context.setOffline(false);await page.getByRole('button',{name:'Синхронизировать',exact:true}).click();await expect(page.getByText(/Поле «answers:@vika\/lesson\/lesson-0» изменено/)).toBeVisible();
  await expect(page.getByLabel('Утверждение 1',{exact:true})).toHaveValue('Offline answer');await page.getByRole('button',{name:'Использовать облачную версию',exact:true}).click();await expect(page.getByLabel('Утверждение 1',{exact:true})).toHaveValue('Other device answer');await page.reload();await expect(page.getByLabel('Утверждение 1',{exact:true})).toHaveValue('Other device answer');
  const saved=await rpc();expect(saved.fields['answers:diary'].value).toBe('Keep trial');expect(saved.fields['answers:@vika/lesson/trial-homework/day'].value).toBe('Keep homework');expect(saved.fields['answers:@vika/lesson/lesson-1'].value.data.answers.grammarNotes).toBe('Keep Lesson1');
 }finally{await second.close();}
});
