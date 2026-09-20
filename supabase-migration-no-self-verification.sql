-- Migration: an hour entry can never be verified by the member it belongs to
-- Run once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.
--
-- Context: the clock in/out flow exists so elapsed time comes from server
-- timestamps and cannot be typed in. The admin "Grant Hours" form is the one
-- deliberate exception -- but as first written it also marked the entry
-- verified in the same action. When the granting admin IS the recipient, that
-- means hours created and approved by the same person, with no independent
-- confirmation. That is precisely the pattern that makes an hour log
-- indefensible when a college or advisor asks who signed off.
--
-- The UI now routes self-grants to "pending" instead, but a UI check only
-- protects people who use the UI. Anyone holding an admin session could call
-- the API directly. This trigger is the actual guarantee.

create or replace function public.prevent_self_verification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.verified = true
     and new.verified_by is not null
     and new.verified_by = new.member_id then
    raise exception
      'An hour entry cannot be verified by the member it belongs to. Another admin or officer must verify it.'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists volunteer_hours_no_self_verify on public.volunteer_hours;
create trigger volunteer_hours_no_self_verify
  before insert or update on public.volunteer_hours
  for each row
  execute function public.prevent_self_verification();

-- What still works:
--   member clocks out            -> verified = false, verified_by = null  -> ok
--   admin grants to someone else -> verified_by <> member_id              -> ok
--   admin grants to themselves   -> lands pending, verified_by = null     -> ok
--   admin verifies someone else  -> verified_by <> member_id              -> ok
--   admin verifies own entry     -> verified_by = member_id               -> REJECTED
--
-- Note this deliberately applies to clocked entries too, not just grants:
-- self-approval is the problem regardless of where the hours came from.
