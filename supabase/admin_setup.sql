-- 1) Create the admin user first: Dashboard → Authentication → Users → Add user (email + password, "Auto confirm user").
-- 2) Run this file. Replace the email if needed.
insert into public.admins (user_id)
select id from auth.users where email = 'sarahjaballh@gmail.com'
on conflict do nothing;

-- Expected: one row with is_admin = true. No row = the user does not exist with this exact email.
select u.email, u.email_confirmed_at is not null as confirmed, a.user_id is not null as is_admin
from auth.users u left join public.admins a on a.user_id = u.id
where u.email = 'sarahjaballh@gmail.com';
