-- Optional self-check of the admin write path through RLS. Run AFTER admin_setup.sql.
-- Everything is rolled back: no data is changed.
begin;
select set_config('request.jwt.claims',
  json_build_object('sub', (select id from auth.users where email = 'sarahjaballh@gmail.com'), 'role', 'authenticated')::text, true);
set local role authenticated;
do $$
declare n int;
begin
  if not public.is_admin() then raise exception 'is_admin() = false: run admin_setup.sql first'; end if;
  update public.experiences set period = period where id = 'ledex';
  get diagnostics n = row_count; if n <> 1 then raise exception 'admin cannot update experiences'; end if;
  insert into public.skills (id, name, visible) values ('rls-check', '{"en":"x"}', false);
  select count(*) into n from public.skills where id = 'rls-check'; if n <> 1 then raise exception 'admin cannot read hidden rows'; end if;
  delete from public.skills where id = 'rls-check';
  get diagnostics n = row_count; if n <> 1 then raise exception 'admin cannot delete'; end if;
  insert into public.content_drafts (entity, entity_id, data) values ('section', 'rls-check', '{}');
  perform count(*) from public.contact_messages;
end $$;
select 'All admin checks passed' as result;
rollback;
