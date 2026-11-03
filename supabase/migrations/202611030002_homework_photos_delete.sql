begin;
-- Allow only an authorized learner to delete photos in their own homework folder.
create policy homework_photos_delete on storage.objects
for delete to authenticated
using (
  bucket_id = 'homework-photos'
  and split_part(name, '/', 1) = (select auth.uid())::text
  and split_part(name, '/', 2) = 'homework-0'
  and exists (
    select 1 from public.lesson_students
    where user_id = (select auth.uid())
  )
);
commit;
