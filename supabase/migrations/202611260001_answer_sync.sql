begin;

create table public.lesson_teachers (
  teacher_id uuid primary key references auth.users(id) on delete cascade,
  student_id uuid not null references public.lesson_students(user_id) on delete cascade,
  check (teacher_id <> student_id)
);
alter table public.lesson_teachers enable row level security;
revoke all on public.lesson_teachers from public, anon, authenticated;
grant select on public.lesson_teachers to authenticated;
create policy own_assignment on public.lesson_teachers for select to authenticated
  using (teacher_id = (select auth.uid()));
create policy assigned_progress on public.lesson_progress for select to authenticated
  using (exists (
    select 1 from public.lesson_teachers t
    where t.teacher_id = (select auth.uid()) and t.student_id = lesson_progress.user_id
  ));

-- Supabase Storage exists in production. The local SQL-only fixture can omit it.
do $$
begin
  if to_regclass('storage.objects') is not null then
    create policy assigned_teacher_reads_homework_photos on storage.objects for select to authenticated
      using (bucket_id = 'homework-photos' and split_part(name, '/', 2) = 'homework-0'
        and exists (select 1 from public.lesson_teachers t where t.teacher_id = (select auth.uid())
          and t.student_id::text = split_part(name, '/', 1)));
  end if;
end;
$$;

-- Keep original snapshots and imports intact. Once upgraded, an old tab must
-- reload before it can submit edits to the new canonical representation.
alter table public.lesson_progress add column field_sync boolean not null default false;
alter function public.sync_lesson(jsonb, jsonb) rename to sync_lesson_legacy;
revoke all on function public.sync_lesson_legacy(jsonb, jsonb) from public, anon, authenticated;

create function public.sync_lesson(p_changes jsonb default '{}'::jsonb, p_import jsonb default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  if exists (select 1 from public.lesson_progress where user_id = auth.uid() and field_sync) then
    raise exception using errcode = '55000', message = 'Reload the lesson to use answer-level sync';
  end if;
  return public.sync_lesson_legacy(p_changes, p_import);
end;
$$;
revoke all on function public.sync_lesson(jsonb, jsonb) from public, anon;
grant execute on function public.sync_lesson(jsonb, jsonb) to authenticated;

-- Mirrors the client codec. Leave unrecognized records opaque and preserve
-- metadata so the app can continue to detect unsupported saved formats.
create function public.lesson_split_field(k text, v jsonb)
returns table (field_key text, field_value jsonb)
language plpgsql immutable set search_path = '' as $$
declare
  d jsonb := v -> 'data';
  prefix text := k || '/~sync/';
  g text;
  id text;
  answer jsonb;
begin
  if k !~ '^answers:@vika/lesson/[a-z0-9][a-z0-9-]*$'
    or v -> 'version' is distinct from '1'::jsonb
    or jsonb_typeof(d -> 'name') is distinct from 'string'
    or jsonb_typeof(d -> 'step') is distinct from 'number'
    or d ->> 'step' !~ '^[0-9]+$'
    or jsonb_typeof(d -> 'answers') is distinct from 'object'
    or jsonb_typeof(d -> 'scores') is distinct from 'object'
    or jsonb_typeof(d -> 'ratings') is distinct from 'object' then
    return query select k, v;
    return;
  end if;
  return query values
    (prefix || 'record', jsonb_set(v, '{data}', d - array['name','step','answers','scores','ratings'])),
    (prefix || 'name', d -> 'name'),
    (prefix || 'step', d -> 'step');
  foreach g in array array['answers','scores','ratings'] loop
    for id, answer in select * from jsonb_each(d -> g) loop
      if g = 'answers' and id = 'present-simple:v2'
        and answer -> 'schemaVersion' = '2'::jsonb
        and jsonb_typeof(answer -> 'activePage') = 'string'
        and jsonb_typeof(answer -> 'seen') = 'array'
        and jsonb_typeof(answer -> 'responses') = 'object' then
        if not exists (select from jsonb_array_elements(answer -> 'seen') x where jsonb_typeof(x) <> 'string')
          and not exists (select from jsonb_each(answer -> 'responses') x where jsonb_typeof(x.value) <> 'string') then
          return query values (prefix || 'course/record', answer - array['activePage','seen','responses']),
                              (prefix || 'course/page', answer -> 'activePage');
          return query select prefix || 'course/seen/' || x, 'true'::jsonb from jsonb_array_elements_text(answer -> 'seen') x;
          return query select prefix || 'course/response/' || x.key, x.value from jsonb_each(answer -> 'responses') x;
          continue;
        end if;
      end if;
      return query select prefix || g || '/' || id, answer;
    end loop;
  end loop;
end;
$$;
revoke all on function public.lesson_split_field(text, jsonb) from public, anon, authenticated;

create function public.sync_lesson_answers(
  p_changes jsonb default '{}'::jsonb, p_import jsonb default null, p_owner uuid default null,
  p_actor uuid default null
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid();
  learner uuid;
  doc public.lesson_progress%rowtype;
  k text;
  item jsonb;
  previous jsonb;
  revision bigint;
  migration_id text;
  skipped integer := 0;
  archived_key text;
  recorded_at timestamptz;
begin
  if actor is null or actor is distinct from p_actor then
    raise insufficient_privilege using message = 'Session has changed';
  end if;
  select student_id into learner from public.lesson_teachers where teacher_id = actor;
  if learner is null then
    select user_id into learner from public.lesson_students where user_id = actor;
  end if;
  if learner is null or (p_owner is not null and learner <> p_owner)
    or (p_owner is null and (p_changes <> '{}'::jsonb or coalesce(p_import, 'null'::jsonb) <> 'null'::jsonb)) then
    raise insufficient_privilege using message = 'Progress is not authorized';
  end if;
  if jsonb_typeof(p_changes) is distinct from 'object' or octet_length(p_changes::text) > 2000000 then
    raise exception 'Invalid changes';
  end if;
  -- Serialize cutover with the old RPC. Answer CAS runs under the row lock.
  perform pg_advisory_xact_lock(hashtextextended(learner::text, 0));
  insert into public.lesson_progress(user_id) values (learner) on conflict do nothing;
  select * into strict doc from public.lesson_progress where user_id = learner for update;
  recorded_at := clock_timestamp();
  if not doc.field_sync then
    doc.fields := doc.fields || coalesce((
      select jsonb_object_agg(s.field_key, jsonb_set(f.value, '{value}', s.field_value))
      from jsonb_each(doc.fields) f
      cross join lateral public.lesson_split_field(f.key, f.value -> 'value') s
      where s.field_key <> f.key
    ), '{}'::jsonb);
  end if;

  if coalesce(p_import, 'null'::jsonb) <> 'null'::jsonb then
    migration_id := p_import ->> 'id';
    if coalesce(length(migration_id), 0) not between 1 and 100
       or jsonb_typeof(p_import -> 'fields') is distinct from 'object' or octet_length(p_import::text) > 2000000 then
      raise exception 'Invalid import';
    end if;
    if doc.imports ? migration_id then
      skipped := (doc.imports ->> migration_id)::integer;
    else
      for k, item in select * from jsonb_each(p_import -> 'fields') loop
        if k not in ('name', 'step') and k !~ '^(answers|scores|ratings):.+' then
          raise exception 'Invalid field';
        end if;
        archived_key := substring(k from '^(answers:@vika/lesson/[a-z0-9][a-z0-9-]*)/~sync/');
        -- A legacy whole-lesson snapshot has no history for missing answers.
        -- Preserve that server snapshot's absence as well as its values.
        if doc.fields ? k or doc.fields ? archived_key
           or (k ~ '^answers:@vika/lesson/[a-z0-9][a-z0-9-]*$' and doc.fields ? (k || '/~sync/record')) then
          skipped := skipped + 1;
        else
          doc.fields := jsonb_set(doc.fields, array[k], jsonb_build_object(
            'value', item, 'revision', 1, 'mutation', migration_id, 'updated_at', recorded_at));
        end if;
      end loop;
      doc.imports := jsonb_set(doc.imports, array[migration_id], to_jsonb(skipped));
    end if;
  end if;

  for k, item in select * from jsonb_each(p_changes) loop
    if (k not in ('name', 'step') and k !~ '^(answers|scores|ratings):.+')
      or jsonb_typeof(item) is distinct from 'object' or not (item ? 'value')
      or jsonb_typeof(item -> 'base') is distinct from 'number'
      or coalesce(length(item ->> 'mutation'), 0) not between 1 and 100 then
      raise exception 'Invalid change';
    end if;
    previous := doc.fields -> k;
    revision := coalesce((previous ->> 'revision')::bigint, 0);
    if previous ->> 'mutation' = item ->> 'mutation' then continue; end if;
    -- Valid whole-lesson snapshots are archival only after cutover.
    if k ~ '^answers:@vika/lesson/[a-z0-9][a-z0-9-]*$' then
      raise exception 'Whole-lesson changes are not supported';
    end if;
    archived_key := substring(k from '^(answers:@vika/lesson/[a-z0-9][a-z0-9-]*)/~sync/');
    if item ? 'legacyRevision' and revision = 0
       and coalesce((doc.fields -> archived_key ->> 'revision')::bigint, 0) <> (item ->> 'legacyRevision')::bigint then
      -- A previously missing field is ambiguous if the whole lesson changed
      -- before cutover. Record a tombstone so the client sees a revision conflict.
      doc.fields := jsonb_set(doc.fields, array[k], jsonb_build_object(
        'value', null, 'revision', 1, 'mutation', 'legacy-conflict', 'updated_at', recorded_at));
    elsif revision = (item ->> 'base')::bigint then
      doc.fields := jsonb_set(doc.fields, array[k], jsonb_build_object(
        'value', item -> 'value', 'revision', revision + 1, 'mutation', item ->> 'mutation', 'updated_at', recorded_at));
    end if;
  end loop;

  -- Polls that only read do not emit Realtime events.
  update public.lesson_progress set fields = doc.fields, imports = doc.imports, field_sync = true,
    updated_at = case when fields is distinct from doc.fields then recorded_at else updated_at end
    where user_id = learner and (not field_sync or fields is distinct from doc.fields or imports is distinct from doc.imports);
  return jsonb_build_object('user_id', learner, 'fields', doc.fields - coalesce((
    select array_agg(f.key) from jsonb_each(doc.fields) f where doc.fields ? (f.key || '/~sync/record')
  ), array[]::text[]), 'import_skipped', skipped);
end;
$$;
revoke all on function public.sync_lesson_answers(jsonb, jsonb, uuid, uuid) from public, anon;
grant execute on function public.sync_lesson_answers(jsonb, jsonb, uuid, uuid) to authenticated;

do $$
begin
  if exists (select from pg_publication where pubname = 'supabase_realtime' and not puballtables)
     and not exists (select from pg_publication_tables where pubname = 'supabase_realtime'
       and schemaname = 'public' and tablename = 'lesson_progress') then
    alter publication supabase_realtime add table public.lesson_progress;
  end if;
end;
$$;

commit;
