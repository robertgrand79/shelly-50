-- Shelly's Golden Glam 50th — RSVP, video messages, and photo memories
-- Standalone tables for a public, unauthenticated party site at /shelly.
-- No tenant/org coupling: this is a one-off guest-facing event page.

create table if not exists public.shelly_rsvps (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  party_size integer not null default 1 check (party_size between 0 and 30),
  not_attending boolean not null default false,
  -- attendance maps event_id (e.g. "tue_welcome_dinner") -> boolean
  attendance jsonb not null default '{}'::jsonb,
  dietary_notes text,
  message text,
  created_at timestamptz not null default now()
);

create table if not exists public.shelly_video_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  caption text,
  created_at timestamptz not null default now()
);

create table if not exists public.shelly_photos (
  id uuid primary key default gen_random_uuid(),
  uploader_name text,
  uploader_email text,
  storage_path text not null,
  caption text,
  photo_year integer check (photo_year is null or (photo_year between 1900 and 2100)),
  created_at timestamptz not null default now()
);

create index if not exists idx_shelly_rsvps_created_at on public.shelly_rsvps (created_at desc);
create index if not exists idx_shelly_videos_created_at on public.shelly_video_messages (created_at desc);
create index if not exists idx_shelly_photos_created_at on public.shelly_photos (created_at desc);

alter table public.shelly_rsvps enable row level security;
alter table public.shelly_video_messages enable row level security;
alter table public.shelly_photos enable row level security;

-- Anyone with the link can submit. No reads are exposed publicly — Robert/Shelly
-- view submissions through the Supabase dashboard.
drop policy if exists "Public can submit shelly_rsvps" on public.shelly_rsvps;
create policy "Public can submit shelly_rsvps" on public.shelly_rsvps
  for insert to anon, authenticated with check (true);

drop policy if exists "Public can submit shelly_video_messages" on public.shelly_video_messages;
create policy "Public can submit shelly_video_messages" on public.shelly_video_messages
  for insert to anon, authenticated with check (true);

drop policy if exists "Public can submit shelly_photos" on public.shelly_photos;
create policy "Public can submit shelly_photos" on public.shelly_photos
  for insert to anon, authenticated with check (true);

-- Storage buckets for guest-uploaded videos and photos.
insert into storage.buckets (id, name, public)
  values ('shelly-videos', 'shelly-videos', true)
  on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
  values ('shelly-photos', 'shelly-photos', true)
  on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can upload shelly videos" on storage.objects;
create policy "Public can upload shelly videos" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'shelly-videos');

drop policy if exists "Public can read shelly videos" on storage.objects;
create policy "Public can read shelly videos" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'shelly-videos');

drop policy if exists "Public can upload shelly photos" on storage.objects;
create policy "Public can upload shelly photos" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'shelly-photos');

drop policy if exists "Public can read shelly photos" on storage.objects;
create policy "Public can read shelly photos" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'shelly-photos');
