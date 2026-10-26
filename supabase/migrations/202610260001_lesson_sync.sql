begin;
-- Only explicitly provisioned learners may use this application.
create table public.lesson_students (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.lesson_students enable row level security;
revoke all on public.lesson_students from public, anon, authenticated;
grant select on public.lesson_students to authenticated;
create policy own_membership on public.lesson_students for select to authenticated
  using (user_id = (select auth.uid()));

create table public.lesson_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  fields jsonb not null default '{}'::jsonb check (jsonb_typeof(fields) = 'object'),
  imports jsonb not null default '{}'::jsonb check (jsonb_typeof(imports) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.lesson_progress enable row level security;
revoke all on public.lesson_progress from public, anon, authenticated;
grant select on public.lesson_progress to authenticated;
create policy own_progress on public.lesson_progress for select to authenticated
  using (user_id = (select auth.uid()) and exists (
    select 1 from public.lesson_students s where s.user_id = (select auth.uid())
  ));
-- No direct insert/update/delete: all writes must perform revision checks in RPC.
create function public.sync_lesson(p_changes jsonb default '{}'::jsonb, p_import jsonb default null)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  learner uuid := auth.uid();
  doc public.lesson_progress%rowtype;
  k text;
  item jsonb;
  previous jsonb;
  revision bigint;
  migration_id text;
  skipped integer := 0;
begin
  if learner is null or not exists (select 1 from public.lesson_students where user_id = learner) then
    raise insufficient_privilege using message = 'Learner is not authorized';
  end if;
  if jsonb_typeof(p_changes) is distinct from 'object' or octet_length(p_changes::text) > 2000000 then
    raise exception 'Invalid changes';
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
      for k, item in select * from jsonb_each(p_import -> 'fields') loop
        if k not in ('name', 'step') and k !~ '^(answers|scores|ratings):.+' then
          raise exception 'Invalid field';
        end if;
        -- Legacy data has no timestamps: never replace ANY existing cloud field,
        -- including deletion tombstones. Keep the original snapshot on the client.
        if not (doc.fields ? k) then
          doc.fields := jsonb_set(doc.fields, array[k], jsonb_build_object('value', item, 'revision', 1, 'mutation', migration_id));
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
       coalesce(item ->> 'mutation', '') = '' or length(item ->> 'mutation') > 100 then
      raise exception 'Invalid change';
    end if;
    previous := doc.fields -> k;
    revision := coalesce((previous ->> 'revision')::bigint, 0);
    -- Same mutation means a retry after a lost response: acknowledge, do not apply twice.
    if previous ->> 'mutation' = item ->> 'mutation' then continue; end if;
    if revision = (item ->> 'base')::bigint then
      doc.fields := jsonb_set(doc.fields, array[k], jsonb_build_object(
        'value', item -> 'value', 'revision', revision + 1, 'mutation', item ->> 'mutation'));
    end if;
    -- Stale changes are left unacknowledged. Client retains both versions for resolution.
  end loop;
  update public.lesson_progress set fields = doc.fields, imports = doc.imports,
    updated_at = case when fields is distinct from doc.fields then now() else updated_at end
    where user_id = learner;
  return jsonb_build_object('user_id', learner, 'fields', doc.fields, 'import_skipped', skipped);
end;
$$;
revoke all on function public.sync_lesson(jsonb, jsonb) from public, anon;
grant execute on function public.sync_lesson(jsonb, jsonb) to authenticated;
commit;
