-- Admin allowlist + RLS that grants authenticated admins full read access.
-- Anon keeps insert-only + the limited public read columns set up earlier.

create table if not exists public.shelly_admins (
  email text primary key,
  added_at timestamptz not null default now()
);

insert into public.shelly_admins (email) values
  ('robert@grandrei.com'),
  ('shellykanegrand@gmail.com')
  on conflict (email) do nothing;

alter table public.shelly_admins enable row level security;
drop policy if exists "Admins can read shelly_admins" on public.shelly_admins;
create policy "Admins can read shelly_admins" on public.shelly_admins
  for select to authenticated using (
    lower((auth.jwt() ->> 'email')) in (select lower(email) from public.shelly_admins)
  );

create or replace function public.is_shelly_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.shelly_admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_shelly_admin() to anon, authenticated;

-- Public reads on photos/videos: anon keeps limited columns, admins get all.
drop policy if exists "Public can read shelly_photos" on public.shelly_photos;
create policy "Anon can read shelly_photos (limited cols)" on public.shelly_photos
  for select to anon using (true);
create policy "Admins can read all shelly_photos" on public.shelly_photos
  for select to authenticated using (public.is_shelly_admin());

drop policy if exists "Public can read shelly_video_messages" on public.shelly_video_messages;
create policy "Anon can read shelly_video_messages (limited cols)" on public.shelly_video_messages
  for select to anon using (true);
create policy "Admins can read all shelly_video_messages" on public.shelly_video_messages
  for select to authenticated using (public.is_shelly_admin());

drop policy if exists "Admins can read shelly_rsvps" on public.shelly_rsvps;
create policy "Admins can read shelly_rsvps" on public.shelly_rsvps
  for select to authenticated using (public.is_shelly_admin());

grant select on public.shelly_rsvps to authenticated;
grant select on public.shelly_photos to authenticated;
grant select on public.shelly_video_messages to authenticated;
