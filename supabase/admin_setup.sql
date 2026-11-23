-- 1) Create the admin user first: Dashboard → Authentication → Users → Add user (email + password, "Auto confirm").
-- 2) Then run this whole file in the SQL Editor. Replace the email if needed.

insert into public.admins (user_id)
select id from auth.users where email = 'sarahjaballh@gmail.com'
on conflict do nothing;

-- 3) Self-check of the admin write path (runs as that user through RLS, then rolls everything back).
begin;
select set_config('request.jwt.claims',
  json_build_object('sub', (select id from auth.users where email = 'sarahjaballh@gmail.com'), 'role', 'authenticated')::text, true);
set local role authenticated;

select 'is_admin' as check, public.is_admin()::text as result
union all select 'update experience', (with u as (update public.experiences set period = period where id = 'ledex' returning 1) select count(*)::text from u)
union all select 'insert skill', (with i as (insert into public.skills (id, name, visible) values ('rls-check', '{"en":"x"}', false) returning 1) select count(*)::text from i)
union all select 'read hidden skill', (select count(*)::text from public.skills where id = 'rls-check')
union all select 'delete skill', (with d as (delete from public.skills where id = 'rls-check' returning 1) select count(*)::text from d)
union all select 'read messages', (select count(*)::text from public.contact_messages)
union all select 'save draft', (with i as (insert into public.content_drafts (entity, entity_id, data) values ('section', 'rls-check', '{}') returning 1) select count(*)::text from i);
rollback;
-- Expected: is_admin = true and every count = 1 (read messages = number of messages).
