import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const learner = '00000000-0000-0000-0000-000000000001';
const teacher = '00000000-0000-0000-0000-000000000002';
const other = '00000000-0000-0000-0000-000000000003';
const db = new PGlite();
const migrate = async name => db.exec(await readFile('supabase/migrations/' + name + '.sql', 'utf8'));
const who = user => db.query("select set_config('request.jwt.claim.sub', $1, false)", [user]);
const rpc = async (changes = {}, legacy = null, name = 'sync_lesson_v2') =>
  (await db.query(`select public.${name}($1::jsonb, $2::jsonb) as result`, [
    JSON.stringify(changes), legacy ? JSON.stringify(legacy) : null,
  ])).rows[0].result;
try {
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      'select nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid';
    grant usage on schema auth, public to anon, authenticated;
    create publication supabase_realtime;
    insert into auth.users values ('${learner}'), ('${teacher}'), ('${other}');`);
  await migrate('202610260001_lesson_sync');
  await db.exec(`insert into public.lesson_students values ('${learner}'), ('${other}'); set role authenticated;`);
  await who(learner);
  const lesson = 'answers:@vika/lesson/lesson-1';
  const response = 'answers:@sync/lesson-1/responses/old~1id~0';
  const draft = 'answers:@sync/lesson-1/answers/task~1draft';
  const grammar = 'answers:@grammar/grammarB1/0';
  const oldLesson = { version: 1, data: { name: '', step: 3, ratings: { a: 2 }, scores: {}, answers: {
    'task/draft': 'draft',
    'present-simple:v2': { schemaVersion: 2, activePage: 'first', seen: ['first'], responses: { 'old/id~': 'original' } },
  } } };
  const grammarData = { index: 2, finished: false, entries: Array.from({ length: 10 }, () => ({ value: 'retained' })) };
  await rpc({}, { id: 'old-import', fields: { [lesson]: oldLesson, 'answers:grammarB1': grammarData } }, 'sync_lesson');
  await db.exec('reset role');
  const oldTime = (await db.query('select updated_at::text from public.lesson_progress')).rows[0].updated_at;
  await migrate('202611260001_answer_sync');
  await db.exec(`insert into public.lesson_teachers values ('${teacher}', '${learner}'); set role authenticated;`);
  let result = await rpc();
  assert.equal(result.fields[response].value, 'original');
  assert.equal(result.fields[draft].value, 'draft');
  assert.equal(result.fields[grammar].value.value, 'retained');
  assert.equal(result.fields['answers:@sync/lesson-1/ratings/a'].value, 2);
  assert.equal(result.fields[response].revision, 1);
  assert.equal(result.fields[response].mutation, 'old-import');
  assert.equal(Date.parse(result.fields[response].updated_at), Date.parse(oldTime));
  const clear = { [response]: { value: null, mutation: 'clear', base: 1 } };
  result = await rpc(clear);
  const recorded = result.fields[response];
  assert.equal(recorded.revision, 2);
  assert.equal(recorded.value, null);
  assert.ok(Date.parse(recorded.updated_at) >= Date.parse(oldTime));
  assert.deepEqual((await rpc(clear)).fields[response], recorded);
  assert.deepEqual((await rpc({ [response]: { value: 'stale', mutation: 'stale', base: 1 } })).fields[response], recorded);
  assert.deepEqual((await rpc({}, { id: 'stale-import', fields: { [lesson]: oldLesson } })).fields[response], recorded);
  assert.equal((await rpc({ [draft]: { value: 'different answer', mutation: 'new', base: 1 } })).fields[draft].value, 'different answer');
  await assert.rejects(rpc({}, null, 'sync_lesson'), { code: '42501' });
  await who(other);
  await rpc({ 'answers:private': { value: 'other learner', mutation: 'other', base: 0 } });
  await who(teacher);
  const view = await rpc();
  assert.equal(view.read_only, true);
  assert.equal(view.user_id, learner);
  assert.equal(view.fields[draft].value, 'different answer');
  assert.equal(view.fields['answers:private'], undefined);
  assert.deepEqual((await db.query('select user_id from public.lesson_progress')).rows, [{ user_id: learner }]);
  await assert.rejects(rpc(clear), { code: '42501' });
  await assert.rejects(db.exec("update public.lesson_progress set fields = '{}'"), { code: '42501' });
  await db.exec('reset role; set role anon');
  await who('');
  await assert.rejects(rpc(), { code: '42501' });
  const published = await db.query("select tablename from pg_publication_tables where pubname = 'supabase_realtime'");
  assert.deepEqual(published.rows, [{ tablename: 'lesson_progress' }]);
  console.log('Answer migration, preserved revisions, compare-and-swap, tombstones, teacher RLS and Realtime publication passed.');
} finally {
  await db.close();
}
