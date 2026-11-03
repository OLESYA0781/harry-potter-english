begin;
-- Additive private Storage configuration; no progress/user changes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('homework-photos', 'homework-photos', false, 8388608,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
do $$ begin
  if not exists (select 1 from storage.buckets where id='homework-photos'
    and public=false and file_size_limit=8388608
    and allowed_mime_types=array['image/jpeg','image/png','image/webp']) then
    raise exception 'Existing homework-photos bucket has different settings; review manually.';
  end if;
end $$;
create policy homework_photos_read on storage.objects for select to authenticated
using (bucket_id='homework-photos'
  and split_part(name,'/',1)=(select auth.uid())::text
  and split_part(name,'/',2)='homework-0'
  and exists(select 1 from public.lesson_students where user_id=(select auth.uid())));
create policy homework_photos_insert on storage.objects for insert to authenticated
with check (bucket_id='homework-photos'
  and split_part(name,'/',1)=(select auth.uid())::text
  and split_part(name,'/',2)='homework-0'
  and exists(select 1 from public.lesson_students where user_id=(select auth.uid())));
-- Immutable unique objects: no update/delete policy and no public URLs.
commit;
