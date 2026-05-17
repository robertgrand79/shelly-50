-- Fix: the `.upsert(rows, { onConflict: "email" })` call in the admin
-- Invites tab needs a real UNIQUE constraint on the email column, not
-- just a functional index on lower(email). Swap to a plain UNIQUE plus
-- a BEFORE INSERT/UPDATE trigger that normalizes the email to lowercase
-- so case-insensitive dedup still works.

drop index if exists shelly_invites_email_uniq;

create or replace function public.shelly_invites_lower_email()
returns trigger
language plpgsql
as $$
begin
  if new.email is not null then
    new.email := lower(trim(new.email));
  end if;
  return new;
end;
$$;

drop trigger if exists shelly_invites_lower_email_trg on public.shelly_invites;
create trigger shelly_invites_lower_email_trg
  before insert or update of email on public.shelly_invites
  for each row execute function public.shelly_invites_lower_email();

update public.shelly_invites set email = lower(trim(email));

alter table public.shelly_invites
  drop constraint if exists shelly_invites_email_key;

alter table public.shelly_invites
  add constraint shelly_invites_email_key unique (email);
