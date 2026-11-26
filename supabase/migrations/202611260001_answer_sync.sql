begin;

-- One explicitly authorized teacher can be assigned to an existing learner.
create table public.lesson_teachers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  learner_id uuid not null references public.lesson_students(user_id) on delete cascade,
  check (user_id <> learner_id)
);
alter table public.lesson_teachers enable row level security;
revoke all on public.lesson_teachers from public, anon, authenticated;

create function public.lesson_teacher_target() returns uuid
language sql stable security definer set search_path = ''
as $$
  select learner_id from public.lesson_teachers where user_id = (select auth.uid());
$$;
revoke all on function public.lesson_teacher_target() from public, anon;
grant execute on function public.lesson_teacher_target() to authenticated;
-- Realtime uses the same row-level authorization as the sync RPC.
create policy assigned_teacher_progress on public.lesson_progress for select to authenticated
  using (user_id = (select public.lesson_teacher_target()));

-- Shared wire paths use JSON Pointer escaping for arbitrary existing answer IDs.
create function public.split_lesson_field(k text, value jsonb) returns jsonb
language plpgsql immutable set search_path = ''
as $$
declare
  base text;
  result jsonb;
  data jsonb := value -> 'data';
  group_name text;
  answer_id text;
  answer jsonb;
  task_id text;
  response jsonb;
  seen_index bigint;
begin
  if k in ('answers:grammarA2', 'answers:grammarB1') and jsonb_typeof(value -> 'entries') = 'array' then
    if jsonb_array_length(value -> 'entries') = 10 then
      base := 'answers:@grammar/' || split_part(k, ':', 2) || '/';
      select jsonb_object_agg(base || (ordinality - 1), entry) into result
      from jsonb_array_elements(value -> 'entries') with ordinality as entries(entry, ordinality);
      return result || jsonb_build_object(base || 'record', value - 'entries');
    end if;
  end if;
  if k !~ '^answers:@vika/lesson/[a-z0-9-]+$' or value -> 'version' is distinct from '1'::jsonb
    or jsonb_typeof(data -> 'answers') is distinct from 'object'
    or jsonb_typeof(data -> 'scores') is distinct from 'object'
    or jsonb_typeof(data -> 'ratings') is distinct from 'object' then
    return jsonb_build_object(k, value);
  end if;
  base := 'answers:@sync/' || substr(k, length('answers:@vika/lesson/') + 1) || '/';
  result := jsonb_build_object(
    base || 'record', value || jsonb_build_object('data', data - array['answers','scores','ratings','name','step']),
    base || 'name', data -> 'name', base || 'step', data -> 'step');
  foreach group_name in array array['answers','scores','ratings'] loop
    for answer_id, answer in select * from jsonb_each(data -> group_name) loop
      if group_name = 'answers' and answer_id = 'present-simple:v2'
        and answer -> 'schemaVersion' = '2'::jsonb and jsonb_typeof(answer -> 'responses') = 'object' then
        for task_id, response in select * from jsonb_each(answer -> 'responses') loop
          result := result || jsonb_build_object(base || 'responses/' || replace(replace(task_id, '~', '~0'), '/', '~1'), response);
        end loop;
        answer := answer || '{"responses":{}}'::jsonb;
        if jsonb_typeof(answer -> 'seen') = 'array' then
          if (select count(distinct topic) from jsonb_array_elements(answer -> 'seen') seen(topic)
              where jsonb_typeof(topic) = 'string') = jsonb_array_length(answer -> 'seen') then
            for task_id, seen_index in select topic #>> '{}', ordinality - 1
              from jsonb_array_elements(answer -> 'seen') with ordinality seen(topic, ordinality)
            loop
              result := result || jsonb_build_object(base || 'seen/' || replace(replace(task_id, '~', '~0'), '/', '~1'), seen_index);
            end loop;
            answer := answer || '{"seen":[]}'::jsonb;
          end if;
        end if;
      end if;
      result := result || jsonb_build_object(base || group_name || '/' || replace(replace(answer_id, '~', '~0'), '/', '~1'), answer);
    end loop;
  end loop;
  return result;
end;
$$;
revoke all on function public.split_lesson_field(text, jsonb) from public, anon, authenticated;

-- Inherit the old revision, mutation and last known server time. Older queues
-- can still compare against the snapshot their changes were made from.
update public.lesson_progress p
set fields = coalesce((
  select jsonb_object_agg(part.key, (field.value - 'value') ||
      jsonb_build_object('value', part.value, 'updated_at', p.updated_at))
  from jsonb_each(p.fields) field
  cross join lateral jsonb_each(public.split_lesson_field(field.key, field.value -> 'value')) part
), '{}'::jsonb);

create function public.sync_lesson_v2(p_changes jsonb default '{}'::jsonb, p_import jsonb default null)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  learner uuid := auth.uid();
  teacher_target uuid := public.lesson_teacher_target();
  doc public.lesson_progress%rowtype;
  k text;
  item jsonb;
  previous jsonb;
  revision bigint;
  migration_id text;
  skipped integer := 0;
  legacy_key text;
  legacy_value jsonb;
  accepted_at timestamptz;
begin
  if teacher_target is not null then
    if p_changes is distinct from '{}'::jsonb or (p_import is not null and p_import <> 'null'::jsonb) then
      raise insufficient_privilege using message = 'Teacher access is read only';
    end if;
    select * into doc from public.lesson_progress where user_id = teacher_target;
    return jsonb_build_object('user_id', teacher_target, 'read_only', true,
      'fields', coalesce(doc.fields, '{}'::jsonb), 'import_skipped', 0);
  end if;
  if learner is null or not exists (select 1 from public.lesson_students where user_id = learner) then
    raise insufficient_privilege using message = 'Learner is not authorized';
  end if;
  if jsonb_typeof(p_changes) is distinct from 'object' or octet_length(p_changes::text) > 2000000 then
    raise exception 'Invalid changes';
  end if;
  if p_changes = '{}'::jsonb and (p_import is null or p_import = 'null'::jsonb) then
    select * into doc from public.lesson_progress where user_id = learner;
    return jsonb_build_object('user_id', learner, 'fields', coalesce(doc.fields, '{}'::jsonb), 'import_skipped', 0);
  end if;
  insert into public.lesson_progress(user_id) values (learner) on conflict do nothing;
  -- Serialize concurrent devices before inspecting any revisions.
  select * into strict doc from public.lesson_progress where user_id = learner for update;
  accepted_at := clock_timestamp();
  if p_import is not null and p_import <> 'null'::jsonb then
    migration_id := p_import ->> 'id';
    if migration_id is null or length(migration_id) > 100 or jsonb_typeof(p_import -> 'fields') is distinct from 'object'
       or octet_length(p_import::text) > 2000000 then
      raise exception 'Invalid import';
    end if;
    if not (doc.imports ? migration_id) then
      for legacy_key, legacy_value in select * from jsonb_each(p_import -> 'fields') loop
        for k, item in select * from jsonb_each(public.split_lesson_field(legacy_key, legacy_value)) loop
          if k not in ('name', 'step') and k !~ '^(answers|scores|ratings):.+' then
            raise exception 'Invalid field';
          end if;
          -- Legacy data has no timestamps: never replace ANY existing cloud field,
          -- including deletion tombstones. Keep the original snapshot on the client.
          if not (doc.fields ? k) and not (
            (k like 'answers:@sync/%' and doc.fields ? ('answers:@vika/lesson/' || split_part(k, '/', 2))) or
            (k like 'answers:@grammar/%' and doc.fields ? ('answers:' || split_part(k, '/', 2)))
          ) then
            doc.fields := jsonb_set(doc.fields, array[k], jsonb_build_object('value', item, 'revision', 1, 'mutation', migration_id, 'updated_at', accepted_at));
          else
            skipped := skipped + 1;
          end if;
        end loop;
      end loop;
      doc.imports := jsonb_set(doc.imports, array[migration_id], to_jsonb(skipped));
    else
      skipped := (doc.imports ->> migration_id)::integer;
    end if;
  end if;
  for k, item in select * from jsonb_each(p_changes) loop
    if (k not in ('name', 'step') and k !~ '^(answers|scores|ratings):.+') or
       k ~ '^answers:@vika/lesson/[a-z0-9-]+$' or
       (k in ('answers:grammarA2', 'answers:grammarB1') and
        public.split_lesson_field(k, item -> 'value') <> jsonb_build_object(k, item -> 'value')) or
       jsonb_typeof(item) is distinct from 'object' or not (item ? 'value') or
       jsonb_typeof(item -> 'base') is distinct from 'number' or
       coalesce(item ->> 'mutation', '') = '' or length(item ->> 'mutation') > 100 then
      raise exception 'Invalid change';
    end if;
    previous := doc.fields -> k;
    revision := coalesce((previous ->> 'revision')::bigint, 0);
    -- Same mutation means a retry after a lost response: acknowledge, do not apply twice.
    if previous ->> 'mutation' = item ->> 'mutation' then continue; end if;
    if revision = (item ->> 'base')::bigint then
      doc.fields := jsonb_set(doc.fields, array[k], jsonb_build_object(
        'value', item -> 'value', 'revision', revision + 1, 'mutation', item ->> 'mutation', 'updated_at', accepted_at));
    end if;
    -- Stale changes are left unacknowledged. The client reconciles against this response.
  end loop;
  update public.lesson_progress set fields = doc.fields, imports = doc.imports,
    updated_at = case when fields is distinct from doc.fields then accepted_at else updated_at end
    where user_id = learner and (fields is distinct from doc.fields or imports is distinct from doc.imports);
  return jsonb_build_object('user_id', learner, 'fields', doc.fields, 'import_skipped', skipped);
end;
$$;
revoke all on function public.sync_lesson_v2(jsonb, jsonb) from public, anon;
grant execute on function public.sync_lesson_v2(jsonb, jsonb) to authenticated;

-- Old clients must reload instead of submitting a whole-lesson snapshot.
revoke execute on function public.sync_lesson(jsonb, jsonb) from authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') and not exists (
    select 1 from pg_publication_tables where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'lesson_progress'
  ) then
    alter publication supabase_realtime add table public.lesson_progress;
  end if;
end;
$$;
commit;
