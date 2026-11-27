begin;
insert into auth.users values
 ('00000000-0000-0000-0000-000000000001'),
 ('00000000-0000-0000-0000-000000000002'),
 ('00000000-0000-0000-0000-000000000003'),
 ('00000000-0000-0000-0000-000000000004');
insert into public.lesson_students values
 ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000004');
insert into public.lesson_teachers values ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001');
insert into public.lesson_progress(user_id) values ('00000000-0000-0000-0000-000000000004');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
do $$
declare
  learner uuid := auth.uid();
  k text := 'answers:@vika/lesson/lesson-1';
  prefix text := k || '/~sync/';
  a text := prefix || 'course/response/a';
  b text := prefix || 'course/response/b';
  r jsonb;
  changes jsonb;
begin
  perform public.sync_lesson('{}', jsonb_build_object('id', 'legacy', 'fields', jsonb_build_object(k,
    '{"version":1,"data":{"name":"","step":4,"ratings":{},"scores":{},"answers":{
      "present-simple:v2":{"schemaVersion":2,"activePage":"page/1","seen":["page/1"],"responses":{"a":"original","b":"original"}}
    }}}'::jsonb)));
  r := public.sync_lesson_answers('{}', null, null, learner);
  if r #>> array['fields', a, 'value'] is distinct from 'original'
     or r #>> array['fields', a, 'revision'] is distinct from '1'
     or r -> 'fields' ? k then raise exception 'Legacy snapshot not split'; end if;
  if not (select fields ? k from public.lesson_progress where user_id = learner) then
    raise exception 'Legacy snapshot was removed';
  end if;
  changes := jsonb_build_object(a, '{"value":"device A","base":1,"mutation":"a"}'::jsonb);
  r := public.sync_lesson_answers(changes, null, learner, learner);
  if r #>> array['fields', a, 'revision'] is distinct from '2'
     or r #>> array['fields', a, 'updated_at'] is null then raise exception 'Server revision/time missing'; end if;
  if r is distinct from public.sync_lesson_answers(changes, null, learner, learner) then
    raise exception 'Retry advanced the revision or timestamp';
  end if;
  r := public.sync_lesson_answers(jsonb_build_object(
    a, '{"value":"stale overwrite","base":1,"mutation":"stale"}'::jsonb,
    b, '{"value":null,"base":1,"mutation":"b"}'::jsonb), null, learner, learner);
  if r #>> array['fields', a, 'value'] is distinct from 'device A'
     or r #> array['fields', b, 'value'] is distinct from 'null'::jsonb then
    raise exception 'Independent update or stale-write guard failed';
  end if;
  r := public.sync_lesson_answers('{}', jsonb_build_object('id', 'stale-local', 'fields',
    jsonb_build_object(b, 'stale', prefix || 'course/response/deleted-before-upgrade', 'old')), learner, learner);
  if r #> array['fields', b, 'value'] is distinct from 'null'::jsonb
     or r -> 'fields' ? (prefix || 'course/response/deleted-before-upgrade') then
    raise exception 'Legacy import revived a cleared answer';
  end if;
  begin
    perform public.sync_lesson('{}', null);
    raise exception 'Old client wrote after cutover';
  exception when object_not_in_prerequisite_state then null; end;
  begin
    perform public.sync_lesson_legacy('{}', null);
    raise exception 'Internal legacy RPC can be called directly';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
do $$
declare
  learner uuid := '00000000-0000-0000-0000-000000000001';
  other uuid := '00000000-0000-0000-0000-000000000004';
  r jsonb;
begin
  r := public.sync_lesson_answers('{}', null, null, auth.uid());
  if (r ->> 'user_id')::uuid is distinct from learner or (select count(*) from public.lesson_progress) <> 1 then
    raise exception 'Teacher can only open the assigned learner';
  end if;
  r := public.sync_lesson_answers('{"ratings:reading":{"value":2,"base":0,"mutation":"teacher"}}', null, learner, auth.uid());
  if r #>> array['fields', 'ratings:reading', 'value'] is distinct from '2' then raise exception 'Teacher review failed'; end if;
  begin
    perform public.sync_lesson_answers('{}', null, other, auth.uid());
    raise exception 'Teacher opened an unrelated learner';
  exception when insufficient_privilege then null; end;
  begin
    perform public.sync_lesson_answers('{}', null, learner, learner);
    raise exception 'Auth actor could be spoofed';
  exception when insufficient_privilege then null; end;
  begin
    update public.lesson_progress set fields = '{}';
    raise exception 'Direct update allowed';
  exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
do $$ begin
  if exists(select 1 from public.lesson_progress) then raise exception 'Unassigned user bypassed RLS'; end if;
  begin
    perform public.sync_lesson_answers('{}', null, null, auth.uid());
    raise exception 'Unassigned user used RPC';
  exception when insufficient_privilege then null; end;
end $$;

set local role anon;
do $$ begin
  begin
    perform public.sync_lesson_answers('{}', null, null, auth.uid());
    raise exception 'Anonymous role used RPC';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
