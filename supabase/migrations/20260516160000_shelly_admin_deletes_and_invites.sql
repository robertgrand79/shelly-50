-- 1) Admin deletes: photos, video messages, and the underlying storage objects.

drop policy if exists "Admins can delete shelly_photos" on public.shelly_photos;
create policy "Admins can delete shelly_photos" on public.shelly_photos
  for delete to authenticated using (public.is_shelly_admin());

drop policy if exists "Admins can delete shelly_video_messages" on public.shelly_video_messages;
create policy "Admins can delete shelly_video_messages" on public.shelly_video_messages
  for delete to authenticated using (public.is_shelly_admin());

grant delete on public.shelly_photos to authenticated;
grant delete on public.shelly_video_messages to authenticated;

drop policy if exists "Admins can delete shelly photos storage" on storage.objects;
create policy "Admins can delete shelly photos storage" on storage.objects
  for delete to authenticated
  using (bucket_id = 'shelly-photos' and public.is_shelly_admin());

drop policy if exists "Admins can delete shelly videos storage" on storage.objects;
create policy "Admins can delete shelly videos storage" on storage.objects
  for delete to authenticated
  using (bucket_id = 'shelly-videos' and public.is_shelly_admin());

-- 2) Invite list — admin-managed recipients for bulk RSVP + update emails.

create table if not exists public.shelly_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  notes text,
  added_at timestamptz not null default now()
);

create unique index if not exists shelly_invites_email_uniq
  on public.shelly_invites (lower(email));
create index if not exists shelly_invites_added_at_idx
  on public.shelly_invites (added_at desc);

alter table public.shelly_invites enable row level security;

drop policy if exists "Admins can read shelly_invites" on public.shelly_invites;
create policy "Admins can read shelly_invites" on public.shelly_invites
  for select to authenticated using (public.is_shelly_admin());

drop policy if exists "Admins can insert shelly_invites" on public.shelly_invites;
create policy "Admins can insert shelly_invites" on public.shelly_invites
  for insert to authenticated with check (public.is_shelly_admin());

drop policy if exists "Admins can update shelly_invites" on public.shelly_invites;
create policy "Admins can update shelly_invites" on public.shelly_invites
  for update to authenticated using (public.is_shelly_admin()) with check (public.is_shelly_admin());

drop policy if exists "Admins can delete shelly_invites" on public.shelly_invites;
create policy "Admins can delete shelly_invites" on public.shelly_invites
  for delete to authenticated using (public.is_shelly_admin());

grant select, insert, update, delete on public.shelly_invites to authenticated;

-- 3) Tiny log of broadcasts so admins can see what's been sent.
create table if not exists public.shelly_broadcasts (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  body_html text not null,
  recipient_count int not null default 0,
  success_count int not null default 0,
  failure_count int not null default 0,
  sent_by_email text,
  sent_at timestamptz not null default now()
);

alter table public.shelly_broadcasts enable row level security;

drop policy if exists "Admins can read shelly_broadcasts" on public.shelly_broadcasts;
create policy "Admins can read shelly_broadcasts" on public.shelly_broadcasts
  for select to authenticated using (public.is_shelly_admin());

drop policy if exists "Admins can insert shelly_broadcasts" on public.shelly_broadcasts;
create policy "Admins can insert shelly_broadcasts" on public.shelly_broadcasts
  for insert to authenticated with check (public.is_shelly_admin());

grant select, insert on public.shelly_broadcasts to authenticated;
