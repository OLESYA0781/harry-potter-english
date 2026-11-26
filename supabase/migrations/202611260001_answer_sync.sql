begin;

-- One explicitly assigned learner per teacher account. Membership is managed
-- by the project owner; client requests cannot supply or switch the learner UUID.
create table public.lesson_teachers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  learner_id uuid not null references public.lesson_students(user_id) on delete cascade,
  check (user_id <> learner_id)
);
alter table public.lesson_teachers enable row level security;
revoke all on public.lesson_teachers from public, anon, authenticated;

create function public.lesson_progress_owner()
returns uuid language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select user_id from public.lesson_students where user_id = auth.uid()),
    (select learner_id from public.lesson_teachers where user_id = auth.uid())
  );
$$;
revoke all on function public.lesson_progress_owner() from public, anon;
grant execute on function public.lesson_progress_owner() to authenticated;

create policy teacher_progress on public.lesson_progress for select to authenticated
  using (user_id = (select public.lesson_progress_owner()));

-- JSON Pointer escaping keeps legacy task IDs intact, including IDs with '/'.
create function public.lesson_field_segment(part text)
returns text language sql immutable strict set search_path = ''
as $$ select replace(replace(part, '~', '~0'), '/', '~1') $$;

create function public.lesson_answer_fields(old_key text, old_value jsonb)
returns table(key text, value jsonb)
language plpgsql immutable set search_path = ''
as $$
declare
  lesson text := substring(old_key from '^answers:@vika/lesson/([a-z0-9][a-z0-9-]*)$');
  data jsonb := old_value -> 'data';
  group_name text;
  item record;
  prefix text;
  field_key text;
begin
  if old_key ~ '^answers:(actionMatch|preference|bag[0-9]+)$' and jsonb_typeof(old_value) = 'object' then
    return query select 'answers:@sync/trial-match/' || split_part(old_key, ':', 2) || '/' || public.lesson_field_segment(e.key), e.value
      from jsonb_each(old_value) e;
    return;
  end if;
  if lesson is null or (old_value -> 'version') is distinct from '1'::jsonb
    or jsonb_typeof(data -> 'name') is distinct from 'string'
    or coalesce(data ->> 'step', '') !~ '^[0-9]+$'
    or jsonb_typeof(data -> 'answers') is distinct from 'object'
    or jsonb_typeof(data -> 'scores') is distinct from 'object'
    or jsonb_typeof(data -> 'ratings') is distinct from 'object' then
    return query select old_key, old_value;
    return;
  end if;

  prefix := 'answers:@sync/' || lesson || '/';
  return query values (prefix || 'name', data -> 'name'), (prefix || 'step', data -> 'step');
  foreach group_name in array array['answers', 'scores', 'ratings'] loop
    for item in select * from jsonb_each(data -> group_name) loop
      field_key := prefix || group_name || '/' || public.lesson_field_segment(item.key);
      key := field_key;
      value := item.value;
      if group_name = 'answers' and item.key = 'present-simple:v2'
         and (value -> 'schemaVersion') = '2'::jsonb
         and jsonb_typeof(value -> 'activePage') = 'string'
         and jsonb_typeof(value -> 'seen') = 'array'
         and jsonb_typeof(value -> 'responses') = 'object' then
        -- Preserve malformed/unknown records as opaque values for the UI guard.
        if not exists (select 1 from jsonb_array_elements(value -> 'seen') t where jsonb_typeof(t) <> 'string')
           and not exists (select 1 from jsonb_each(value -> 'responses') t where jsonb_typeof(t.value) <> 'string') then
          return query select key || '/activePage', value -> 'activePage';
          return query select key || '/seen/' || public.lesson_field_segment(t), 'true'::jsonb
            from jsonb_array_elements_text(value -> 'seen') t;
          return query select field_key || '/responses/' || public.lesson_field_segment(e.key), e.value
            from jsonb_each(value -> 'responses') e;
          continue;
        end if;
      end if;
      return next;
    end loop;
  end loop;
end;
$$;
revoke all on function public.lesson_answer_fields(text, jsonb) from public, anon, authenticated;
revoke all on function public.lesson_field_segment(text) from public, anon, authenticated;

-- Preserve the exact pre-migration document, including archived and unknown data.
-- Old clients retain their outbox and must reload before writing the new format.
revoke execute on function public.sync_lesson(jsonb, jsonb) from authenticated;
create table public.lesson_progress_legacy (
  user_id uuid primary key references public.lesson_progress(user_id) on delete cascade,
  fields jsonb not null
);
alter table public.lesson_progress_legacy enable row level security;
revoke all on public.lesson_progress_legacy from public, anon, authenticated;
-- Block concurrent writes using the old RPC during conversion.
lock table public.lesson_progress in share row exclusive mode;
insert into public.lesson_progress_legacy select user_id, fields from public.lesson_progress;
update public.lesson_progress p set fields = (
  select coalesce(jsonb_object_agg(leaf.key, (old.value || jsonb_build_object(
    'value', leaf.value, 'updated_at', p.updated_at))), '{}'::jsonb)
  from jsonb_each(p.fields) old
  cross join lateral public.lesson_answer_fields(old.key, old.value -> 'value') leaf
);
-- Projects with Realtime disabled still refresh by polling, focus and reconnect.
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime' and not puballtables)
     and not exists (select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'lesson_progress') then
    alter publication supabase_realtime add table public.lesson_progress (user_id, updated_at);
  end if;
end $$;

create function public.sync_lesson_answers(p_changes jsonb default '{}'::jsonb, p_import jsonb default null, p_learner uuid default null)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  learner uuid := public.lesson_progress_owner();
  doc public.lesson_progress%rowtype;
  legacy jsonb;
  k text;
  item jsonb;
  previous jsonb;
  revision bigint;
  migration_id text;
  skipped integer := 0;
begin
  if learner is null or (p_learner is not null and learner <> p_learner)
    or (p_learner is null and (p_changes <> '{}'::jsonb or p_import is not null)) then
    raise insufficient_privilege using message = 'Learner is not authorized';
  end if;
  if jsonb_typeof(p_changes) is distinct from 'object' or octet_length(p_changes::text) > 2000000 then
    raise exception 'Invalid changes';
  end if;
  if p_changes = '{}'::jsonb and (p_import is null or p_import = 'null'::jsonb) then
    select * into doc from public.lesson_progress where user_id = learner;
    return jsonb_build_object('user_id', learner, 'actor_id', auth.uid(),
      'fields', coalesce(doc.fields, '{}'::jsonb), 'import_skipped', 0);
  end if;
  insert into public.lesson_progress(user_id) values (learner) on conflict do nothing;
  -- Serialize concurrent devices before inspecting any revisions.
  select * into strict doc from public.lesson_progress where user_id = learner for update;
  if p_import is not null and p_import <> 'null'::jsonb then
    migration_id := p_import ->> 'id';
    if migration_id is null or length(migration_id) > 100 or jsonb_typeof(p_import -> 'fields') is distinct from 'object'
       or octet_length(p_import::text) > 2000000 then
      raise exception 'Invalid import';
    end if;
    if not (doc.imports ? migration_id) then
      select fields into legacy from public.lesson_progress_legacy where user_id = learner;
      for k, item in
        select leaf.key, leaf.value from jsonb_each(p_import -> 'fields') old
        cross join lateral public.lesson_answer_fields(old.key, old.value) leaf
      loop
        if k not in ('name', 'step') and k !~ '^(answers|scores|ratings):.+' then
          raise exception 'Invalid field';
        end if;
        -- Legacy data has no timestamps: never replace ANY existing cloud field,
        -- including deletion tombstones. Keep the original snapshot on the client.
        -- Absence in an old whole-lesson snapshot may represent a deletion.
        -- An unversioned copy must not refill those gaps. It remains in the local backup.
        if not (doc.fields ? k) and not coalesce(
          (k like 'answers:@sync/trial-match/%' and legacy ? ('answers:' || split_part(k, '/', 3)))
          or (k like 'answers:@sync/%' and legacy ? ('answers:@vika/lesson/' || split_part(k, '/', 2))),
          false
        ) then
          doc.fields := jsonb_set(doc.fields, array[k], jsonb_build_object('value', item, 'revision', 1, 'mutation', migration_id, 'updated_at', clock_timestamp()));
        else
          skipped := skipped + 1;
        end if;
      end loop;
      doc.imports := jsonb_set(doc.imports, array[migration_id], to_jsonb(skipped));
    else
      skipped := (doc.imports ->> migration_id)::integer;
    end if;
  end if;
  for k, item in select * from jsonb_each(p_changes) loop
    if (k not in ('name', 'step') and k !~ '^(answers|scores|ratings):.+') or
       jsonb_typeof(item) is distinct from 'object' or not (item ? 'value') or
       jsonb_typeof(item -> 'base') is distinct from 'number' or
       (item ->> 'base') !~ '^[0-9]+$' or
       jsonb_typeof(item -> 'mutation') is distinct from 'string' or
       coalesce(item ->> 'mutation', '') = '' or length(item ->> 'mutation') > 100 then
      raise exception 'Invalid change';
    end if;
    -- Opaque legacy fields are archived during conversion; new clients send paths.
    if (k ~ '^answers:@vika/lesson/[a-z0-9-]+$' or k ~ '^answers:(actionMatch|preference|bag[0-9]+)$')
       and exists (select 1 from public.lesson_answer_fields(k, item -> 'value') leaf where leaf.key <> k) then
      raise exception 'Expected individual answer fields';
    end if;
    previous := doc.fields -> k;
    revision := coalesce((previous ->> 'revision')::bigint, 0);
    -- Same mutation means a retry after a lost response: acknowledge, do not apply twice.
    if previous ->> 'mutation' = item ->> 'mutation' then continue; end if;
    if revision = (item ->> 'base')::bigint then
      doc.fields := jsonb_set(doc.fields, array[k], jsonb_build_object(
        'value', item -> 'value', 'revision', revision + 1, 'mutation', item ->> 'mutation', 'updated_at', clock_timestamp()));
    end if;
    -- Stale changes are left unacknowledged. Client retains both versions for resolution.
  end loop;
  update public.lesson_progress set fields = doc.fields, imports = doc.imports,
    updated_at = case when fields is distinct from doc.fields then clock_timestamp() else updated_at end
    where user_id = learner and (fields is distinct from doc.fields or imports is distinct from doc.imports);
  return jsonb_build_object('user_id', learner, 'actor_id', auth.uid(), 'fields', doc.fields, 'import_skipped', skipped);
end;
$$;
revoke all on function public.sync_lesson_answers(jsonb, jsonb, uuid) from public, anon;
grant execute on function public.sync_lesson_answers(jsonb, jsonb, uuid) to authenticated;
commit;
