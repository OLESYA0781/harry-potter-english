import { test, expect } from '@playwright/test';
import type { Page, BrowserContext } from '@playwright/test';
import { PGlite } from '@electric-sql/pglite';
import { joinFields } from '../../src/progressFields';
import type { Fields } from '../../src/progress';
import { readFile } from 'node:fs/promises';
const user = '00000000-0000-0000-0000-000000000001';
const teacher = '00000000-0000-0000-0000-000000000002';
const teacherEmail = 'assigned-teacher@example.test';
const authKey = `hogwarts-auth:${process.env.TEST_SUPABASE_URL || 'https://supabase.test'}`;
let db: PGlite;
let lostReply = false;
let mutationGate: Promise<void> | undefined;
let refreshes = 0;
let calls = 0;
let tail = Promise.resolve();
const initial = { step: 0, name: '', answers: {}, scores: {}, ratings: {} };
async function serverRpc(changes: object, migration: object | null, actor: string, owner: string | null, legacy = false) {
  const run = async () => {
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [actor]);
    const payload = [JSON.stringify(changes), migration ? JSON.stringify(migration) : null];
    const result = legacy
      ? await db.query<{ result: any }>('select public.sync_lesson($1::jsonb, $2::jsonb) as result', payload)
      : await db.query<{ result: any }>('select public.sync_lesson_answers($1::jsonb, $2::jsonb, $3::uuid, $4::uuid) as result', [...payload, owner, actor]);
    return result.rows[0].result;
  };
  const result = tail.then(run); tail = result.then(() => {}, () => {}); return result;
}
async function rpc(changes: object = {}, migration: object | null = null) {
  const result = await serverRpc(changes, migration, user, user, !!migration);
  const fields: Fields = result.fields;
  // Existing assertions inspect the app's reconstructed lesson snapshots.
  const view = joinFields(Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value])));
  for (const [key, value] of Object.entries(view)) {
    if (!(key in fields)) fields[key] = { ...fields[key + '/~sync/record'], value };
  }
  return result;
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
      const id = body.email === teacherEmail || body.refresh_token === 'teacher-refresh' ? teacher : user;
      const expires = Math.floor(Date.now() / 1000) + 3600;
      const token = [Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'), Buffer.from(JSON.stringify({ sub: id, exp: expires, role: 'authenticated' })).toString('base64url'), 'test-signature'].join('.');
      return route.fulfill({ headers, json: { access_token: token, refresh_token: id === teacher ? 'teacher-refresh' : 'test-refresh', token_type: 'bearer', expires_in: 3600, expires_at: expires, user: { id, email: body.email || (id === teacher ? teacherEmail : 'learner@example.test'), aud: 'authenticated', created_at: '2026-01-01' } } });
    }
    if (path.pathname.includes('/logout')) return route.fulfill({ status: 204, headers });
    if (path.pathname.includes('/user')) return route.fulfill({ headers, json: { id: user, email: 'learner@example.test' } });
    if (path.pathname.endsWith('/rpc/sync_lesson_answers')) {
      calls++;
      const body = request.postDataJSON();
      const token = request.headers().authorization.split('.')[1];
      const claim = JSON.parse(Buffer.from(token, 'base64url').toString());
      expect(body.p_actor).toBe(claim.sub);
      const result = await serverRpc(body.p_changes, body.p_import, claim.sub, body.p_owner);
      if (Object.keys(body.p_changes).length) {
        const gate = mutationGate;
        mutationGate = undefined;
        if (gate) await gate;
        if (lostReply) { lostReply = false; return route.abort('failed'); }
      }
      return route.fulfill({ headers, json: result });
    }
    throw new Error(`Unexpected Supabase endpoint ${path.pathname}`);
  });
}
async function login(page: Page, location = '/#/lessons/trial', email = 'learner@example.test') {
  await page.goto(location);
  await page.locator('.cloud-progress > summary').click();
  await page.getByLabel('Email', { exact: true }).fill(email);
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
  lostReply = false; mutationGate = undefined; refreshes = 0; calls = 0; tail = Promise.resolve();
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as 'select nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid';
    grant usage on schema auth, public to anon, authenticated;`);
  await db.exec(await readFile('supabase/migrations/202610260001_lesson_sync.sql', 'utf8'));
  await db.exec(await readFile('supabase/migrations/202611260001_answer_sync.sql', 'utf8'));
  await db.exec(`insert into auth.users values ('${user}'), ('${teacher}');
    insert into public.lesson_students values ('${user}');
    insert into public.lesson_teachers values ('${teacher}', '${user}');
    set role authenticated; select set_config('request.jwt.claim.sub', '${user}', false);`);
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

test('offline edits survive immediate reload; stale same-field changes sync automatically', async ({ page, context, browser }) => {
  await route(context); await login(page);
  await page.locator('.nav-item').nth(1).click(); await sync(page);
  const second = await browser.newContext(); await route(second);
  const other = await second.newPage(); await login(other);
  await context.setOffline(true);
  await page.getByPlaceholder('Your name', { exact: true }).fill('Offline name');
  await page.reload().catch(() => {});
  // Offline navigation is unavailable without a service worker; restoring network
  // loads the app and the durable queue, then reconciles it automatically.
  await other.getByPlaceholder('Your name', { exact: true }).fill('Other device name'); await sync(other);
  await context.setOffline(false); await page.goto('/#/lessons/trial');
  await page.locator('.cloud-progress > summary').click();
  await expect(page.getByText('Есть конфликт', { exact: true })).toHaveCount(0);
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

test('same lesson edited offline converges automatically after reconnect', async ({ page, context, browser }) => {
  const home = '/tests/fixtures/platform.html#/lessons/word-quest';
  await route(context); await login(page, home);
  await page.getByLabel('Ответ нового урока').fill('Original'); await sync(page);
  const second = await browser.newContext(); await route(second);
  const other = await second.newPage(); await login(other, home);
  await context.setOffline(true);
  await page.getByLabel('Ответ нового урока').fill('Offline lesson answer');
  await page.getByRole('button', { name: 'Проверить новый урок' }).click();
  await other.getByLabel('Ответ нового урока').fill('New remote answer'); await sync(other);
  await context.setOffline(false);
  await expect(page.getByRole('button', { name: 'Использовать облачную версию', exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Ответ нового урока')).toHaveValue('New remote answer');
  await expect.poll(async () => {
    const saved = await rpc();
    return saved.fields['answers:@vika/lesson/word-quest'].value.data;
  }).toMatchObject({ answers: { draft: 'New remote answer' }, ratings: { teacher: 2 } });
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
  await context.setOffline(false);
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
  await context.setOffline(false);
  await expect(page.getByLabel('The café is open.',{exact:true})).toHaveValue('Other device answer');await page.reload();await expect(page.getByLabel('The café is open.',{exact:true})).toHaveValue('Other device answer');
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

test('Lesson 1 stable matching and transferred writing IDs restore on a second device',async({page,context,browser})=>{
 test.setTimeout(60000);
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
  await other.goto('/#/lessons/lesson-2');
  await other.locator('.ar-sidebar button').nth(10).click();
  await other.locator('.ps2-journey-pair textarea').nth(0).fill('How do you usually get to school?');
  await other.locator('.ps2-journey-pair textarea').nth(1).fill('  I usually go by tram.\n ');await sync(other);await sync(page);
  await page.goto('/#/lessons/lesson-2');
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
 await page.goto('/#/lessons/lesson-1');await expect(page.getByRole('heading',{name:'Warm-up — Back to Hogwarts!',exact:true})).toBeVisible();
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
  const reviewContext = await browser.newContext();
  try {
    await route(reviewContext);
    await storage(reviewContext);
    const review = await reviewContext.newPage();
    await login(review, '/#/homework/0', teacherEmail);
    await expect(review.locator('.hw0-photo')).toContainText('notebook.png');
    await expect(review.locator('.hw0-photo img')).toBeVisible();
    await expect(review.getByRole('button', { name: 'Удалить фото notebook.png' })).toHaveCount(0);
  } finally { await reviewContext.close(); }
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
 await route(context);await login(page,'/#/lessons/lesson-2');
 await page.locator('.ar-sidebar button').nth(9).click();
 await expect(page.locator('.ps2-heading h1')).toHaveText('The Question Machine');
 const machine=page.locator('.ps2-question-machine').first();await machine.locator('.ps2-chunk-bank button').nth(2).click();await machine.locator('.ps2-chunk-bank button').nth(3).click();await sync(page);
 const second=await browser.newContext();await route(second);
 try{
  const other=await second.newPage();await login(other,'/#/lessons/lesson-2');await expect(other.locator('.ps2-question-machine').first().locator('.ps2-chunk-answer button')).toHaveText(['Where','does']);
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
  await context.setOffline(false);
  await expect(page.locator('[data-slot=houses]')).toContainText('pilot');
  await expect(page.locator('[data-slot=bus]')).toContainText('teacher');
  await expect(other.locator('[data-slot=houses]')).toContainText('pilot', { timeout: 10000 });
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
 const prefix='golden-key/v1/',answers:any={'golden-key-reset/2026-11-14-request-1':true,'articles/v1/page':11,[prefix+'phase']:5,[prefix+'guardian-index']:0,[prefix+'match/hospital']:'doctor',[prefix+'question/hospital']:['t2','t3','t1','t0'],[prefix+'interview/hospital']:true,[prefix+'letter/hospital']:true,[prefix+'exclude/hospital']:true,[prefix+'lock/0']:'an'};
 await rpc({}, {id:'golden-key-cloud',fields:{'answers:@vika/lesson/lesson-2':{version:1,data:{...initial,answers}},'answers:@vika/lesson/lesson-0-homework/written/profile/hogwarts':'Keep homework'}});await route(context);await login(page,'/#/lessons/lesson-2');await page.locator('#guardian-answer').fill('  My own free answer.\n ');await page.getByRole('button',{name:'Next Question',exact:true}).click();await page.locator('#guardian-answer').fill('  Another ungraded answer.\n ');await sync(page);const second=await browser.newContext();await route(second);try{const other=await second.newPage();await login(other,'/#/lessons/lesson-2');await expect(other.locator('#guardian-answer')).toHaveValue('  Another ungraded answer.\n ');await other.getByRole('button',{name:'Previous Question',exact:true}).click();await expect(other.locator('#guardian-answer')).toHaveValue('  My own free answer.\n ');await other.reload();await expect(other.locator('#guardian-answer')).toHaveValue('  My own free answer.\n ');await sync(other);const saved=await rpc();const actual=saved.fields['answers:@vika/lesson/lesson-2'].value.data.answers;for(const key of ['match/hospital','question/hospital','interview/hospital','letter/hospital','exclude/hospital','lock/0'])expect(actual[prefix+key]).toEqual(answers[prefix+key]);expect(saved.fields['answers:@vika/lesson/lesson-0-homework/written/profile/hogwarts'].value).toBe('Keep homework');}finally{await second.close();}
});
test('requested Golden Key reset syncs once and preserves replay on a second device',async({page,context,browser})=>{const key='answers:@vika/lesson/lesson-2',prefix='golden-key/v1/';await rpc({}, {id:'quest-reset-request',fields:{[key]:{version:1,data:{...initial,answers:{'articles/v1/page':11,'articles/v1/missing/0':'an',[prefix+'phase']:5,[prefix+'completed-v2']:true,[prefix+'guardian-v2/0']:'Keep old answer in archive'}}},'answers:@vika/lesson/lesson-0-homework/written/profile/hogwarts':'Keep homework'}});await route(context);await login(page,'/#/lessons/lesson-2');await expect(page.locator('.gk-people-bank .gk-token')).toHaveCount(6);await sync(page);await page.getByRole('button',{name:'Житель doctor',exact:true}).click();await page.getByRole('button',{name:'Здание Hospital',exact:true}).click({position:{x:10,y:10}});await sync(page);const second=await browser.newContext();await route(second);try{const other=await second.newPage();await login(other,'/#/lessons/lesson-2');await expect(other.locator('.gk-inhabited')).toHaveCount(1);await other.reload();await expect(other.locator('.gk-inhabited')).toHaveCount(1);const saved=await rpc(),answers=saved.fields[key].value.data.answers;expect(answers['golden-key-reset/2026-11-14-request-1']).toBe(true);expect(answers['golden-key-archive/2026-11-14-request-1'][prefix+'guardian-v2/0']).toBe('Keep old answer in archive');expect(answers['articles/v1/missing/0']).toBe('an');expect(saved.fields['answers:@vika/lesson/lesson-0-homework/written/profile/hogwarts'].value).toBe('Keep homework');}finally{await second.close();}});

test('Homework Lesson 2 hides keys for Vika after signing in and reloading', async ({ page, context }) => {
  await route(context);
  await page.goto('/#/homework/2');
  await page.locator('.cloud-progress > summary').click();
  await page.getByLabel('Email', { exact: true }).fill('ddarya.rr@gmail.com');
  await page.getByLabel('Пароль', { exact: true }).fill('test-only-password');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Выйти', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Teacher mode', exact: true })).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole('button', { name: 'Teacher mode', exact: true })).toHaveCount(0);
  await expect(page.getByRole('complementary', { name: 'Teacher’s Mode' })).toHaveCount(0);
});

test('Homework Lesson 3 syncs answers and independent notebook marks for the learner', async ({ page, context, browser }) => {
  const location = '/#/homework/3';
  const learner = 'ddarya.rr@gmail.com';
  const changed = [
    ['Sentence 14, article 1', 'an'],
    ['Sentence 14, article 2', 'a'],
    ['Ralph', 'B'],
    ['Ralph — Job', 'digital designer'],
    ['Statement 6, True or False', 'False'],
  ];
  await route(context);
  await login(page, location, learner);
  await expect(page.getByRole('button', { name: 'Teacher mode', exact: true })).toHaveCount(0);
  for (const [name, value] of changed) {
    await page.getByRole('combobox', { name, exact: true }).selectOption(value);
  }
  const marks = page.getByRole('checkbox', { name: 'Done in my notebook' });
  await marks.nth(0).check();
  await marks.nth(3).check();
  await sync(page);

  const second = await browser.newContext();
  await route(second);
  try {
    const other = await second.newPage();
    await login(other, location, learner);
    for (const [name, value] of changed) {
      await expect(other.getByRole('combobox', { name, exact: true })).toHaveValue(value);
    }
    const otherMarks = other.getByRole('checkbox', { name: 'Done in my notebook' });
    await expect(otherMarks).toHaveCount(4);
    await expect(otherMarks.nth(0)).toBeChecked();
    await expect(otherMarks.nth(1)).not.toBeChecked();
    await expect(otherMarks.nth(2)).not.toBeChecked();
    await expect(otherMarks.nth(3)).toBeChecked();
    await expect(other.getByRole('complementary', { name: 'Teacher’s Mode' })).toHaveCount(0);
    await other.getByRole('combobox', { name: 'Ralph — Job' }).selectOption('');
    await sync(other);
    await sync(page);
    await expect(page.getByRole('combobox', { name: 'Ralph — Job' })).toHaveValue('');
  } finally {
    await second.close();
  }
});

test('Lesson 3 saves an interview and plaque through Supabase and hides teacher controls for Vika', async ({ page, context }) => {
  await route(context);
  await login(page, '/#/lessons/lesson-3');
  await page.getByRole('button', { name: 'Teacher mode', exact: true }).click();
  await page.getByRole('button', { name: 'Emma', exact: true }).click();
  await page.getByRole('button', { name: 'Interview completed' }).click();
  await page.getByRole('button', { name: 'House 4', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm placement' }).click();
  await page.getByRole('button', { name: 'Confirm article challenge' }).click();
  await sync(page);
  expect((await rpc()).fields['answers:@vika/lesson/lesson-3'].value.data.answers['mixed-village/v1'].interviewed.Emma)
    .toEqual({ house: 4, placed: true, articles: true });

  await page.evaluate(() => localStorage.clear());
  await page.reload();
  if (!await page.getByRole('button', { name: 'Войти', exact: true }).isVisible()) {
    await page.locator('.cloud-progress > summary').click();
  }
  await page.getByLabel('Email', { exact: true }).fill('ddarya.rr@gmail.com');
  await page.getByLabel('Пароль', { exact: true }).fill('test-only-password');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  await expect(page.getByRole('button', { name: 'House 4, Emma' })).toBeVisible();
  await expect(page.getByText('Emma is home!')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Teacher mode', exact: true })).toHaveCount(0);
  await expect(page.getByText('Where do you work?', { exact: true })).toHaveCount(0);
});

test('Lesson 3 bag writing keeps the village record and restores the draft through Supabase', async ({ page, context }) => {
  await route(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, '/#/lessons/lesson-3');
  await page.getByRole('button', { name: 'Emma', exact: true }).click();
  await page.getByLabel('Choose Lesson 3 section').selectOption('9');
  await page.getByLabel('Твоё объявление').fill('A small notebook. Please PM me!');
  await sync(page);
  const saved = (await rpc()).fields['answers:@vika/lesson/lesson-3'].value.data.answers;
  expect(saved['mixed-village/v1'].active).toBe('Emma');
  expect(saved['bag-lesson/v1/post/text']).toBe('A small notebook. Please PM me!');
  await page.evaluate(key => {
    const session = localStorage.getItem(key)!;
    localStorage.clear();
    localStorage.setItem(key, session);
  }, authKey);
  await page.reload();
  await expect(page.getByLabel('Твоё объявление')).toHaveValue('A small notebook. Please PM me!');
});

test('independent phone and desktop edits in one lesson recover online and show in assigned Teacher Mode', async ({ page, context, browser }) => {
  test.setTimeout(120000);
  const location = '/#/lessons/lesson-3';
  const section = 'answers:@vika/lesson/lesson-3/~sync/answers/bag-lesson/v1/section';
  await rpc({}, { id: 'lesson-3-old-save', fields: {
    'answers:@vika/lesson/lesson-3': { version: 1, data: { ...initial, answers: {
      'bag-lesson/v1/section': 8, 'bag-lesson/v1/my-bag/0': 'old item',
    } } },
  } });
  await route(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page, location, 'ddarya.rr@gmail.com');
  const desktop = await browser.newContext();
  const teacherContext = await browser.newContext();
  await route(desktop);
  await route(teacherContext);
  await teacherContext.addInitScript(({ owner, state }) => {
    if (!localStorage.getItem('hogwarts-cloud-v1')) localStorage.setItem('hogwarts-cloud-v1', JSON.stringify({
      version: 1, owner, state, cloud: {}, pending: {}, migration: null, backup: null, migrated: true,
    }));
  }, { owner: teacher, state: { ...initial, name: 'Teacher local draft' } });
  await desktop.addInitScript(old => {
    if (!localStorage.getItem('hogwarts-cloud-v1')) localStorage.setItem('hogwarts-english-v1', JSON.stringify(old));
  }, { version: 3, data: { ...initial, answers: { '@vika/lesson/lesson-3': {
    version: 1, data: { ...initial, answers: {
      'bag-lesson/v1/section': 8, 'bag-lesson/v1/my-bag/0': 'stale cache', 'bag-lesson/v1/my-bag/4': 'stale missing answer',
    } },
  } } } });
  try {
    const other = await desktop.newPage();
    const review = await teacherContext.newPage();
    await login(other, location, 'ddarya.rr@gmail.com');
    await login(review, location, teacherEmail);
    await expect(review.getByRole('textbox', { name: 'Предмет 1', exact: true })).toHaveValue('old item', { timeout: 15000 });
    await review.getByRole('button', { name: 'Teacher mode', exact: true }).click();
    await expect(review.locator('.bag-progress')).toBeVisible();
    expect(await review.evaluate(() => JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!).previousOwnerJournal.state.name))
      .toBe('Teacher local draft');
    const item = (target: Page, n: number) => target.getByRole('textbox', { name: `Предмет ${n}`, exact: true });
    const indicator = (target: Page) => target.locator('.cloud-entry-copy [role=status]');
    await expect(item(other, 1)).toHaveValue('old item');
    await expect(item(other, 5)).toHaveValue('');
    await item(page, 1).fill('phone draft');
    await expect(indicator(page)).toHaveText('Saved');
    await expect(item(other, 1)).toHaveValue('phone draft', { timeout: 15000 });
    await item(other, 2).fill('desktop draft');
    await expect(item(page, 2)).toHaveValue('desktop draft', { timeout: 15000 });

    await context.setOffline(true);
    await expect(indicator(page)).toHaveText('Offline');
    await Promise.all([
      item(page, 3).fill('offline item'),
      item(other, 4).fill('online item'),
    ]);
    await item(page, 1).fill('older conflicting phone draft');
    await item(page, 5).fill('another offline item');
    await item(other, 1).fill('updated desktop item');
    await expect(indicator(other)).toHaveText('Saved');
    await expect(indicator(page)).toHaveText('Offline');
    await context.setOffline(false);
    await expect(indicator(page)).toHaveText('Saved', { timeout: 15000 });
    for (const target of [page, other, review]) {
      await target.bringToFront();
      await Promise.all([
        expect(item(target, 1)).toHaveValue('updated desktop item', { timeout: 15000 }),
        expect(item(target, 3)).toHaveValue('offline item', { timeout: 15000 }),
        expect(item(target, 4)).toHaveValue('online item', { timeout: 15000 }),
        expect(item(target, 5)).toHaveValue('another offline item', { timeout: 15000 }),
      ]);
    }
    await item(other, 2).fill('ready');
    await other.getByRole('button', { name: 'Отметить список как готовый' }).click();
    await expect(review.getByRole('button', { name: 'Список готов', exact: true })).toBeVisible({ timeout: 15000 });
    await item(other, 2).fill('');
    await expect(indicator(other)).toHaveText('Saved');
    await expect(item(review, 2)).toHaveValue('', { timeout: 15000 });
    await review.reload();
    await expect(item(review, 2)).toHaveValue('');
    await expect(item(review, 3)).toHaveValue('offline item');
    const cloud = await serverRpc({}, null, user, user);
    expect(cloud.fields[section].value).toBe(8);
    for (const [id, value] of Object.entries({ 0: 'updated desktop item', 1: '', 2: 'offline item', 3: 'online item', 4: 'another offline item' })) {
      expect(cloud.fields[`answers:@vika/lesson/lesson-3/~sync/answers/bag-lesson/v1/my-bag/${id}`].value).toBe(value);
    }
    expect(cloud.fields['answers:@vika/lesson/lesson-3']).toBeUndefined();
  } finally {
    await desktop.close();
    await teacherContext.close();
  }
});

test('Lesson 3 listening selection syncs and each round retains its own response', async ({ page, context, browser }) => {
  const location = '/#/lessons/lesson-3';
  const namespace = 'answers:@vika/lesson/lesson-3/~sync/answers/bag-lesson/v1/';
  await route(context);
  await login(page, location);
  await page.getByRole('navigation', { name: 'Lesson 3 sections' }).getByRole('button', { name: /^3 / }).click();
  const listening = (target: Page) => target.getByRole('heading', { name: 'C. Listen and Find' }).locator('..');
  // Round one: the correct image is the third of the sorted choices.
  await listening(page).getByRole('button', { name: 'Картинка 3', exact: true }).click();
  await sync(page);
  const second = await browser.newContext();
  await route(second);
  try {
    const other = await second.newPage();
    await login(other, location);
    await expect(listening(other).getByRole('button', { name: 'Картинка 3', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await listening(other).getByRole('button', { name: 'Следующее слово' }).click();
    await listening(other).getByRole('button', { name: 'Картинка 1', exact: true }).click();
    await sync(other);
    await expect(listening(page)).toContainText('Слово 2 из', { timeout: 15000 });
    await expect(listening(page).getByRole('button', { name: 'Картинка 1', exact: true })).toHaveAttribute('aria-pressed', 'true');
    const saved = await serverRpc({}, null, user, user);
    expect(saved.fields[namespace + 'listen/choice/0'].value).toBe(8);
    expect(saved.fields[namespace + 'listen/choice/1'].value).toBe(1);
  } finally { await second.close(); }
});

test('opening a memory round on another device preserves the saved choice', async ({ page, context, browser }) => {
  const location = '/#/lessons/lesson-3';
  const section = 'answers:@vika/lesson/lesson-3';
  const choice = 'bag-lesson/v1/missing/choice/0';
  await rpc({}, { id: 'memory-round', fields: {
    [section]: { version: 1, data: { ...initial, answers: { 'bag-lesson/v1/section': 2 } } },
  } });
  const memory = (target: Page) => target.getByRole('heading', { name: 'D. What’s Missing?' }).locator('..');
  const show = (target: Page) => memory(target).getByRole('button', { name: 'Показать предметы' }).click();
  await route(context);
  await login(page, location);
  await show(page);
  const firstChoice = memory(page).locator('.bag-row button').first();
  const choiceName = await firstChoice.textContent({ timeout: 10000 });
  expect(choiceName).toBeTruthy();
  await firstChoice.click();
  await sync(page);

  const second = await browser.newContext();
  await route(second);
  try {
    const other = await second.newPage();
    await login(other, location);
    await show(other);
    await expect(memory(other).getByRole('button', { name: choiceName ?? '', exact: true }))
      .toHaveAttribute('aria-pressed', 'true', { timeout: 10000 });
    const saved = await serverRpc({}, null, user, user);
    expect(saved.fields[section + '/~sync/answers/' + choice].value).toBe(0);
  } finally { await second.close(); }
});

test('Realtime invalidates an open page before its polling timer can run', async ({ page, context }) => {
  await route(context);
  await page.clock.install();
  let notify: (() => void) | undefined;
  await page.routeWebSocket('wss://supabase.test/realtime/v1/websocket*', socket => {
    socket.onMessage(raw => {
      const [join, ref, topic, event, payload] = JSON.parse(String(raw));
      if (event === 'phx_join') {
        expect(payload.config.postgres_changes).toEqual([{ event: 'UPDATE', schema: 'public', table: 'lesson_progress', filter: `user_id=eq.${user}` }]);
        socket.send(JSON.stringify([join, ref, topic, 'phx_reply', {
          status: 'ok', response: { postgres_changes: [{ ...payload.config.postgres_changes[0], id: 7 }] },
        }]));
        notify = () => socket.send(JSON.stringify([join, null, topic, 'postgres_changes', {
          ids: [7], data: { schema: 'public', table: 'lesson_progress', type: 'UPDATE',
            commit_timestamp: new Date().toISOString(), columns: [{ name: 'user_id', type: 'uuid' }],
            record: { user_id: user }, old_record: {}, errors: null },
        }]));
      }
    });
  });
  await rpc({}, { id: 'existing-realtime', fields: { name: 'Before Realtime', step: 1 } });
  await login(page);
  await expect.poll(() => !!notify).toBe(true);
  await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now()) + 100));
  await page.clock.runFor(650);
  const input = page.getByPlaceholder('Your name', { exact: true });
  await expect(input).toHaveValue('Before Realtime');
  await serverRpc({ name: { base: 1, value: 'From Realtime', mutation: 'push' } }, null, user, user);
  notify!();
  await expect(input).toHaveValue('From Realtime', { timeout: 3500 });
});

test('a lost save response is retried automatically without losing a newer edit made in flight', async ({ page, context }) => {
  await route(context);
  await login(page);
  await page.locator('.nav-item').nth(1).click();
  await sync(page);
  const input = page.getByPlaceholder('Your name', { exact: true });
  const status = page.locator('.cloud-entry-copy [role=status]');
  let release!: () => void;
  mutationGate = new Promise(resolve => { release = resolve; });
  lostReply = true;
  try {
    await input.fill('First edit in flight');
    await expect.poll(() => mutationGate === undefined).toBe(true);
    await expect(status).toHaveText('Saving...');
    await input.fill('Newer edit in flight');
    await expect(status).toHaveText('Saving...');
  } finally { release(); }
  await expect(status).toHaveText('Saved', { timeout: 15000 });
  await expect(input).toHaveValue('Newer edit in flight');
  const saved = await serverRpc({}, null, user, user);
  expect(saved.fields.name).toMatchObject({ value: 'Newer edit in flight', revision: 3 });
});

test('Lesson 4 keeps independent questions, replies, notes and final drafts through offline reload and two devices', async ({ page, context, browser }) => {
  const location = '/#/lessons/lesson-4';
  const base = 'answers:@vika/lesson/lesson-4/~sync/answers/lost-bag/v1/';
  await rpc({}, { id: 'before-lost-bag', fields: {
    'answers:@vika/lesson/lesson-3': { version: 1, data: { ...initial, answers: { previousLessonDraft: 'Keep previous work' } } },
    'answers:previousHomework': 'Keep previous homework',
  } });
  await route(context); await login(page, location);
  await page.getByRole('button', { name: 'Flat 1 — Alice', exact: true }).click();
  const aBag = page.getByRole('textbox', { name: 'Alice, bag: your question', exact: true });
  await aBag.fill('Do you have a bag?');
  await page.locator('#lb-dialog .lb-question').nth(4).getByRole('button', { name: 'Ask', exact: true }).click();
  await page.getByRole('textbox', { name: 'Alice, Bag colour', exact: true }).fill('black');
  await page.getByRole('textbox', { name: 'Who is the owner of the bag?', exact: true }).fill('My first idea.');
  await sync(page);
  const second = await browser.newContext(); await route(second);
  try {
    const other = await second.newPage(); await login(other, location);
    await expect(other.getByRole('textbox', { name: 'Alice, bag: your question', exact: true })).toHaveValue('Do you have a bag?');
    await expect(other.locator('#lb-dialog .lb-question').nth(4).locator('.lb-reply')).toContainText('Yes, I have a bag.');
    await expect(other.getByRole('textbox', { name: 'Alice, Bag colour', exact: true })).toHaveValue('black');
    await expect(other.getByRole('textbox', { name: 'Alice, Umbrella colour', exact: true })).toHaveValue('');

    await context.setOffline(true);
    await page.getByRole('textbox', { name: 'Alice, age: your question', exact: true }).fill('How old are you?');
    await page.locator('#lb-dialog .lb-question').nth(1).getByRole('button', { name: 'Ask', exact: true }).click();
    await page.getByRole('textbox', { name: 'Alice, Umbrella colour', exact: true }).fill('red');
    await page.getByRole('textbox', { name: 'Write 4–6 sentences about the owner of the bag.', exact: true }).fill('  My offline description.\nKeep every line.  ');
    const durable = await page.evaluate(() => JSON.parse(localStorage.getItem('hogwarts-cloud-v1')!));
    expect(Object.keys(durable.pending)).toContain(base + 'question/alice/age');
    expect(Object.keys(durable.pending)).not.toContain('answers:@vika/lesson/lesson-4');
    expect(Object.keys(durable.pending).every(key => key.startsWith(base))).toBe(true);

    await other.getByRole('textbox', { name: 'Alice, keys: your question', exact: true }).fill('How many keys do you have?');
    await other.locator('#lb-dialog .lb-question').nth(9).getByRole('button', { name: 'Ask', exact: true }).click();
    await other.getByRole('textbox', { name: 'Alice, Glasses', exact: true }).fill('yes');
    await other.getByRole('textbox', { name: 'What does this person do?', exact: true }).fill('My independent answer.');
    await sync(other);
    await page.reload().catch(() => {}); // No service worker: the durable queue survives the failed offline navigation.
    await context.setOffline(false); await page.goto(location); await sync(page); await sync(other);
    for (const device of [page, other]) {
      await expect(device.getByRole('textbox', { name: 'Alice, age: your question', exact: true })).toHaveValue('How old are you?');
      await expect(device.getByRole('textbox', { name: 'Alice, keys: your question', exact: true })).toHaveValue('How many keys do you have?');
      await expect(device.locator('#lb-dialog .lb-question').nth(1).locator('.lb-reply')).toContainText("I'm twenty-four years old.");
      await expect(device.locator('#lb-dialog .lb-question').nth(9).locator('.lb-reply')).toContainText('I have two keys.');
      await expect(device.getByRole('textbox', { name: 'Alice, Umbrella colour', exact: true })).toHaveValue('red');
      await expect(device.getByRole('textbox', { name: 'Alice, Glasses', exact: true })).toHaveValue('yes');
      await expect(device.getByRole('textbox', { name: 'What does this person do?', exact: true })).toHaveValue('My independent answer.');
      await expect(device.getByRole('textbox', { name: 'Write 4–6 sentences about the owner of the bag.', exact: true })).toHaveValue('  My offline description.\nKeep every line.  ');
    }
    await other.reload();
    await expect(other.getByRole('heading', { name: 'Alice', exact: true })).toBeVisible();
    const saved = await serverRpc({}, null, user, user);
    expect(saved.fields[base + 'question/alice/age'].value).toBe('How old are you?');
    expect(saved.fields[base + 'question/alice/keys'].value).toBe('How many keys do you have?');
    expect(saved.fields[base + 'reply/alice/age'].value).toBe(true);
    expect(saved.fields[base + 'note/alice/umbrella-colour'].value).toBe('red');
    expect(saved.fields[base + 'note/alice/glasses'].value).toBe('yes');
    expect(saved.fields[base + 'question/alice/age'].revision).toBeGreaterThan(0);
    expect(saved.fields['answers:@vika/lesson/lesson-4']).toBeUndefined();
    const rebuilt = joinFields(Object.fromEntries(Object.entries(saved.fields as Fields).map(([id, field]) => [id, field.value]))) as Record<string, any>;
    expect(rebuilt['answers:@vika/lesson/lesson-3'].data.answers.previousLessonDraft).toBe('Keep previous work');
    expect(rebuilt['answers:previousHomework']).toBe('Keep previous homework');
    expect((await db.query('select user_id from public.lesson_progress')).rows).toEqual([{ user_id: user }]);
  } finally { await context.setOffline(false); await second.close(); }
});
