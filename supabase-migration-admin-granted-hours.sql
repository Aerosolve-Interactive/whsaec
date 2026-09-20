-- Migration: Admin-granted volunteer hours
-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once (uses "if not exists" / "drop policy if exists" everywhere).
--
-- Context: members earn hours by clocking in and out, so the elapsed time is
-- derived from server timestamps and cannot be typed in. This migration adds the
-- one legitimate exception: an admin granting hours directly (an offsite event,
-- a make-up session, a member whose phone died mid-session). Those entries are
-- tagged so a college auditing a member's record can always tell which hours
-- came from a real clock session and which an admin granted by hand.

-- 1. Tag every entry with where it came from, and remember which admin granted it.
alter table public.volunteer_hours
  add column if not exists entry_type text not null default 'clocked',
  add column if not exists granted_by uuid references public.profiles(id);

-- Everything that already exists came from a clock-in/clock-out session.
update public.volunteer_hours
  set entry_type = 'clocked'
  where entry_type is null;

-- Constrain the allowed values, but only once (re-running must not error).
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'volunteer_hours_entry_type_check'
  ) then
    alter table public.volunteer_hours
      add constraint volunteer_hours_entry_type_check
      check (entry_type in ('clocked', 'admin_grant'));
  end if;
end $$;

-- 2. Let admins/officers write an hours row on behalf of another member.
--    This backs both the new "Grant Hours" form and the existing
--    "Clock Out Now" button for members who forgot to clock out.
drop policy if exists "admins can insert hours for members" on public.volunteer_hours;
create policy "admins can insert hours for members"
  on public.volunteer_hours for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'officer')
    )
  );

-- 3. Admins/officers need to read every member's profile to populate the
--    member picker on the Grant Hours form.
drop policy if exists "admins can view all profiles" on public.profiles;
create policy "admins can view all profiles"
  on public.profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'officer')
    )
  );

-- 4. Index the audit columns so "show me every admin-granted entry" stays fast
--    once the hours table grows.
create index if not exists volunteer_hours_entry_type_idx
  on public.volunteer_hours (entry_type);
create index if not exists volunteer_hours_granted_by_idx
  on public.volunteer_hours (granted_by);
