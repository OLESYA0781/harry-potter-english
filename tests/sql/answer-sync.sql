-- This fixture is installed before the answer migration to exercise conversion
-- of a populated database, including archived values and an existing tombstone.
insert into auth.users values
  ('00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000004');
insert into public.lesson_students values
  ('00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000004');
insert into public.lesson_progress (user_id, fields, imports, updated_at) values
('00000000-0000-0000-0000-000000000001', '{
  "answers:@vika/lesson/lesson-1": {
    "revision":7,"mutation":"legacy","value":{"version":1,"data":{
      "step":0,"name":"","answers":{"present-simple:v2":{"schemaVersion":2,"activePage":"page",
      "seen":["topic"],"responses":{"one/~":"original","two":"other original"}}},"scores":{},"ratings":{}
    }}
  },
  "answers:cleared":{"revision":4,"mutation":"clear","value":null},
  "answers:@vika/lesson/lesson-2":{"revision":3,"mutation":"future","value":{"version":99,"data":{"unknown":true}}}
}', '{"previous-import":2}', '2026-01-01T00:00:00Z'),
('00000000-0000-0000-0000-000000000004', '{}', '{}', '2026-01-01T00:00:00Z');
