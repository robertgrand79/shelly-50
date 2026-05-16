-- Allow anon to read photos/videos for the public /collage page,
-- but keep uploader email addresses private via column-level grants.

revoke select on public.shelly_photos from anon, authenticated;
revoke select on public.shelly_video_messages from anon, authenticated;

grant select (id, uploader_name, storage_path, caption, photo_year, created_at)
  on public.shelly_photos to anon, authenticated;

grant select (id, full_name, storage_path, mime_type, caption, created_at)
  on public.shelly_video_messages to anon, authenticated;

drop policy if exists "Public can read shelly_photos" on public.shelly_photos;
create policy "Public can read shelly_photos" on public.shelly_photos
  for select to anon, authenticated using (true);

drop policy if exists "Public can read shelly_video_messages" on public.shelly_video_messages;
create policy "Public can read shelly_video_messages" on public.shelly_video_messages
  for select to anon, authenticated using (true);
