-- Email notifications: AFTER INSERT triggers on each guest table call the
-- notify-shelly-event edge function, which sends a formatted email to every
-- address in shelly_admins via Resend.

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_shelly_event()
returns trigger
language plpgsql
security definer
set search_path = public, net
as $$
begin
  perform net.http_post(
    url := 'https://gszvfbojvglgpjnodtgw.supabase.co/functions/v1/notify-shelly-event',
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'record', to_jsonb(NEW)
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    timeout_milliseconds := 5000
  );
  return NEW;
exception when others then
  raise notice 'notify_shelly_event failed: %', sqlerrm;
  return NEW;
end;
$$;

drop trigger if exists trg_notify_shelly_rsvp on public.shelly_rsvps;
create trigger trg_notify_shelly_rsvp
  after insert on public.shelly_rsvps
  for each row execute function public.notify_shelly_event();

drop trigger if exists trg_notify_shelly_video on public.shelly_video_messages;
create trigger trg_notify_shelly_video
  after insert on public.shelly_video_messages
  for each row execute function public.notify_shelly_event();

drop trigger if exists trg_notify_shelly_photo on public.shelly_photos;
create trigger trg_notify_shelly_photo
  after insert on public.shelly_photos
  for each row execute function public.notify_shelly_event();
