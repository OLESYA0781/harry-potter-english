-- Run against a disposable PostgreSQL database after the migration.
-- The runner provisions auth.users, auth.uid() and roles for isolated testing.
begin;
insert into auth.users(id) values ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002');
insert into public.lesson_students(user_id) values ('00000000-0000-0000-0000-000000000001');
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
do $$
declare r jsonb;
begin
  r := public.sync_lesson('{}', '{"id":"first-import","fields":{"name":"Alice","answers:old":true}}');
  if r #>> '{fields,name,value}' <> 'Alice' then raise exception 'Import failed'; end if;
  r := public.sync_lesson('{"name":{"base":1,"value":"New","mutation":"edit-1"}}', null);
  if r #>> '{fields,name,revision}' <> '2' then raise exception 'Update failed'; end if;
  -- Repeating a request after a lost HTTP response is idempotent.
  r := public.sync_lesson('{"name":{"base":1,"value":"New","mutation":"edit-1"}}', null);
  if r #>> '{fields,name,revision}' <> '2' then raise exception 'Retry applied twice'; end if;
  -- Concurrent stale changes cannot overwrite a newer value.
  r := public.sync_lesson('{"name":{"base":1,"value":"Stale","mutation":"offline-device"}}', null);
  if r #>> '{fields,name,value}' <> 'New' then raise exception 'Stale write won'; end if;
  -- Different devices can edit unrelated fields without losing either value.
  r := public.sync_lesson('{"ratings:speech":{"base":0,"value":2,"mutation":"rating"}}', null);
  if r #>> '{fields,name,value}' <> 'New' or r #>> '{fields,ratings:speech,value}' <> '2' then raise exception 'Independent edit lost'; end if;
  -- A second browser's legacy snapshot only fills gaps, never replaces cloud.
  r := public.sync_lesson('{}', '{"id":"second-import","fields":{"name":"Very old","answers:new":7}}');
  if r #>> '{fields,name,value}' <> 'New' or r #>> '{fields,answers:new,value}' <> '7' or r ->> 'import_skipped' <> '1' then raise exception 'Unsafe second import'; end if;
  -- One-time import marker protects even fields subsequently deleted/reset.
  r := public.sync_lesson('{"answers:new":{"base":1,"value":null,"mutation":"reset"}}', null);
  r := public.sync_lesson('{}', '{"id":"second-import","fields":{"name":"Old again","answers:new":7,"answers:extra":9}}');
  if r #> '{fields,answers:new,value}' <> 'null'::jsonb or r -> 'fields' ? 'answers:extra' then raise exception 'Import replay resurrected data'; end if;
  r := public.sync_lesson('{}', '{"id":"third-import","fields":{"answers:new":99}}');
  if r #> '{fields,answers:new,value}' <> 'null'::jsonb then raise exception 'Tombstone overwritten'; end if;
  -- Authenticated clients cannot bypass compare-and-swap using table writes.
  begin
    update public.lesson_progress set fields = '{}';
    raise exception 'Direct table write unexpectedly allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
-- Fixture another learner's row as the administrator to test read isolation.
insert into public.lesson_progress(user_id, fields) values ('00000000-0000-0000-0000-000000000002', '{}');
set local role authenticated;
do $$ begin
  if (select count(*) from public.lesson_progress) <> 1 then raise exception 'RLS exposed another learner'; end if;
end $$;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
do $$ begin
  if exists(select 1 from public.lesson_progress) then raise exception 'Non-allowlisted user can read progress'; end if;
  begin
    perform public.sync_lesson('{}', null);
    raise exception 'Non-allowlisted user can sync';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$ begin
  begin
    perform public.sync_lesson('{}', null);
    raise exception 'Anonymous RPC unexpectedly allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform * from public.lesson_progress;
    raise exception 'Anonymous read unexpectedly allowed';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
