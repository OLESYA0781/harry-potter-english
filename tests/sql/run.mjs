import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
const db = new PGlite();
await db.exec(`
create role anon; create role authenticated;
create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as
  'select nullif(current_setting(''request.jwt.claim.sub'', true), '''')::uuid';
grant usage on schema auth, public to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
`);
await db.exec(await readFile('supabase/migrations/202610260001_lesson_sync.sql', 'utf8'));
await db.exec(await readFile('tests/sql/sync.sql', 'utf8'));
console.log('SQL migration and integration checks passed: import, CAS, retries, tombstones, direct-write denial, RLS, unauthorized and anonymous access.');
await db.close();
