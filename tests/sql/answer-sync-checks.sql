begin;
insert into public.lesson_teachers values ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001');
do $$ begin
  if not exists (
    select 1 from public.lesson_progress p join public.lesson_progress_legacy l using (user_id)
      where l.fields ? 'answers:@vika/lesson/lesson-1' and p.imports ->> 'previous-import' = '2'
  ) then raise exception 'Original document or import markers lost'; end if;
  if not exists (select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'lesson_progress'
    and attnames = array['user_id', 'updated_at']::name[])
    then raise exception 'Realtime publication missing or exposes more than change metadata'; end if;
end $$;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
do $$
declare
  learner uuid := auth.uid();
  first text := 'answers:@sync/lesson-1/answers/present-simple:v2/responses/one~1~0';
  second text := 'answers:@sync/lesson-1/answers/present-simple:v2/responses/two';
  change jsonb := jsonb_build_object(first, '{"base":7,"value":null,"mutation":"new-clear"}'::jsonb);
  r jsonb;
  server_time timestamptz;
begin
  r := public.sync_lesson_answers();
  if r -> 'fields' -> first ->> 'value' is distinct from 'original'
    or r #>> '{fields,answers:@vika/lesson/lesson-2,value,version}' is distinct from '99'
    or r #> '{fields,answers:cleared,value}' is distinct from 'null'::jsonb
    then raise exception 'Migration lost expected state'; end if;
  r := public.sync_lesson_answers(change, null, learner);
  server_time := (r -> 'fields' -> first ->> 'updated_at')::timestamptz;
  if server_time is null or server_time <= '2026-01-01T00:00:00Z'
    or r -> 'fields' -> first ->> 'revision' is distinct from '8'
    then raise exception 'CAS / database clock failed'; end if;
  r := public.sync_lesson_answers(change, null, learner);
  if (r -> 'fields' -> first ->> 'updated_at')::timestamptz is distinct from server_time
    or r -> 'fields' -> first ->> 'revision' is distinct from '8'
    then raise exception 'Retry applied twice'; end if;
  r := public.sync_lesson_answers(jsonb_build_object(
    first, '{"base":7,"value":"stale","mutation":"stale"}'::jsonb,
    second, '{"base":7,"value":"independent","mutation":"independent"}'::jsonb),
    '{"id":"old-browser","fields":{"answers:cleared":"stale","answers:@sync/lesson-1/answers/removed":"do not restore"}}', learner);
  if r -> 'fields' -> first -> 'value' is distinct from 'null'::jsonb
    or r -> 'fields' -> second ->> 'value' is distinct from 'independent'
    or r #> '{fields,answers:cleared,value}' is distinct from 'null'::jsonb
    or (r -> 'fields') ? 'answers:@sync/lesson-1/answers/removed'
    then raise exception 'Stale cache or independent writer failed'; end if;
  begin
    perform public.sync_lesson('{}',null);
    raise exception 'Old client can still write aggregates';
  exception when insufficient_privilege then null; end;
  begin
    update public.lesson_progress set fields = '{}';
    raise exception 'Direct progress write allowed';
  exception when insufficient_privilege then null; end;
  begin
    perform fields from public.lesson_progress_legacy;
    raise exception 'Browser can read migration archive';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
do $$ declare r jsonb := public.sync_lesson_answers(); begin
  if (select count(*) from public.lesson_progress) <> 1 or
    r ->> 'actor_id' is distinct from auth.uid()::text or
    r ->> 'user_id' is distinct from '00000000-0000-0000-0000-000000000001'
    then raise exception 'Teacher mapping or read isolation failed'; end if;
  begin
    perform public.sync_lesson_answers('{"name":{"base":0,"value":"Wrong target","mutation":"test"}}', null,
      '00000000-0000-0000-0000-000000000004');
    raise exception 'Teacher can redirect a mutation to an unassigned learner';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
do $$ begin
  if exists(select 1 from public.lesson_progress) then raise exception 'Nonmember can read records'; end if;
  begin
    perform public.sync_lesson_answers();
    raise exception 'Nonmember can use RPC';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$ begin
  begin
    perform public.sync_lesson_answers();
    raise exception 'Anon can use RPC';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
