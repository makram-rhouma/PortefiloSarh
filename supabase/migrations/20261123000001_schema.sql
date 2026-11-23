-- Portfolio schema, admin roles, RLS and storage for Sarah Jaballah's portfolio.
-- Idempotent: safe to re-run. Destroys nothing.

-- ── Admin role system ───────────────────────────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select to authenticated using (user_id = auth.uid() or public.is_admin());
-- no insert/update/delete policies: admins are granted only from the SQL editor (see README)

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;

-- ── Content tables ──────────────────────────────────────────────────
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.portfolio_sections (
  key text primary key,
  content jsonb not null default '{}',          -- multilingual published content
  visible boolean not null default true,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

-- Unpublished edits from the admin (save draft → preview → publish). Admin-only.
create table if not exists public.content_drafts (
  entity text not null check (entity in ('section', 'settings')),
  entity_id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (entity, entity_id)
);

create table if not exists public.experiences (
  id text primary key default gen_random_uuid()::text,
  role jsonb not null default '{}', company jsonb not null default '{}', location jsonb not null default '{}',
  period text not null default '', bullets jsonb not null default '{"en":[],"fr":[],"ar":[],"es":[]}',
  sort_order int not null default 0, visible boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.education (
  id text primary key default gen_random_uuid()::text,
  title jsonb not null default '{}', institution jsonb not null default '{}', period text not null default '',
  kind text not null default 'degree' check (kind in ('degree', 'certification')),
  sort_order int not null default 0, visible boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id text primary key default gen_random_uuid()::text,
  name jsonb not null default '{}', category text not null default 'care' check (category in ('care', 'operations', 'office')),
  sort_order int not null default 0, visible boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.languages (
  id text primary key default gen_random_uuid()::text,
  name jsonb not null default '{}', level jsonb not null default '{}',
  sort_order int not null default 0, visible boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.social_links (
  id text primary key default gen_random_uuid()::text,
  platform text not null, url text not null check (url ~ '^(https://|mailto:|tel:)'), label jsonb not null default '{}',
  sort_order int not null default 0, visible boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

-- Files uploaded to the portfolio-media bucket
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  kind text not null check (kind in ('image', 'video')),
  mime text not null, size_bytes bigint not null check (size_bytes <= 52428800),
  created_at timestamptz not null default now()
);

create table if not exists public.portfolio_items (
  id text primary key default gen_random_uuid()::text,
  media_id uuid references public.media_assets (id) on delete set null,
  kind text not null check (kind in ('image', 'video')),
  src text not null, poster text, thumb text,
  title jsonb not null default '{}', description jsonb not null default '{}', caption jsonb not null default '{}',
  category text not null check (category in ('dance', 'zumba', 'events', 'fitness', 'professional')),
  sort_order int not null default 0, featured boolean not null default false, visible boolean not null default true,
  is_illustration boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and char_length(email) <= 200),
  message text not null check (char_length(message) between 10 and 4000),
  lang text, created_at timestamptz not null default now()
);

-- updated_at triggers
do $$ declare t text; begin
  foreach t in array array['site_settings','portfolio_sections','content_drafts','experiences','education','skills','languages','social_links','portfolio_items'] loop
    execute format('drop trigger if exists touch on public.%I', t);
    execute format('create trigger touch before update on public.%I for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- ── Row Level Security ─────────────────────────────────────────────
do $$ declare t text; begin
  -- public read of published (visible) rows, admin-only writes
  foreach t in array array['experiences','education','skills','languages','social_links','portfolio_items','portfolio_sections'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "public read published" on public.%I', t);
    execute format('create policy "public read published" on public.%I for select to anon, authenticated using (visible or public.is_admin())', t);
    execute format('drop policy if exists "admin write" on public.%I', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

alter table public.site_settings enable row level security;
drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "admin write" on public.site_settings;
create policy "admin write" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table public.content_drafts enable row level security;
drop policy if exists "admin only" on public.content_drafts;
create policy "admin only" on public.content_drafts for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table public.media_assets enable row level security;
drop policy if exists "public read" on public.media_assets;
create policy "public read" on public.media_assets for select to anon, authenticated using (true);
drop policy if exists "admin write" on public.media_assets;
create policy "admin write" on public.media_assets for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table public.contact_messages enable row level security;
drop policy if exists "anyone can send" on public.contact_messages;
create policy "anyone can send" on public.contact_messages for insert to anon, authenticated with check (true);
drop policy if exists "admin read" on public.contact_messages;
create policy "admin read" on public.contact_messages for select to authenticated using (public.is_admin());
drop policy if exists "admin delete" on public.contact_messages;
create policy "admin delete" on public.contact_messages for delete to authenticated using (public.is_admin());

-- ── Storage bucket ─────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio-media', 'portfolio-media', true, 52428800,
        array['image/jpeg','image/png','image/webp','image/avif','image/gif','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "portfolio-media admin insert" on storage.objects;
create policy "portfolio-media admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio-media' and public.is_admin());
drop policy if exists "portfolio-media admin update" on storage.objects;
create policy "portfolio-media admin update" on storage.objects for update to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin()) with check (bucket_id = 'portfolio-media' and public.is_admin());
drop policy if exists "portfolio-media admin delete" on storage.objects;
create policy "portfolio-media admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin());
drop policy if exists "portfolio-media admin list" on storage.objects;
create policy "portfolio-media admin list" on storage.objects for select to authenticated
  using (bucket_id = 'portfolio-media' and public.is_admin());

-- Storage files with no media_assets row (admin cleans them from the media library)
create or replace function public.orphan_media() returns setof text
language sql stable security definer set search_path = '' as $$
  select o.name from storage.objects o
  where o.bucket_id = 'portfolio-media' and public.is_admin()
    and not exists (select 1 from public.media_assets m where m.storage_path = o.name);
$$;
revoke all on function public.orphan_media() from public;
grant execute on function public.orphan_media() to authenticated;
