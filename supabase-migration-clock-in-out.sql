-- Migration: Clock In / Clock Out for volunteer hours
-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once (uses "if not exists" everywhere).

-- 1. Add audit columns to the existing volunteer_hours table so a
--    verified entry remembers the actual clock-in/clock-out timestamps,
--    not just the date and the computed hours.
alter table public.volunteer_hours
  add column if not exists clock_in_time timestamptz,
  add column if not exists clock_out_time timestamptz;

-- 2. New table: holds at most one row per member -- the session they are
--    currently clocked into. A row here means "still clocked in". It gets
--    deleted the moment they (or an admin) clock them out, at which point
--    a normal row is written into volunteer_hours as usual (pending
--    verification, same as before).
create table if not exists public.active_clock_sessions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null unique references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id),
  session_type text,
  clock_in_time timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.active_clock_sessions enable row level security;

-- Members can see, create, and end their own active session.
drop policy if exists "members can view own active session" on public.active_clock_sessions;
create policy "members can view own active session"
  on public.active_clock_sessions for select
  using (member_id = auth.uid());

drop policy if exists "members can start own active session" on public.active_clock_sessions;
create policy "members can start own active session"
  on public.active_clock_sessions for insert
  with check (member_id = auth.uid());

drop policy if exists "members can end own active session" on public.active_clock_sessions;
create policy "members can end own active session"
  on public.active_clock_sessions for delete
  using (member_id = auth.uid());

-- Admins/officers can see everyone's active session and force-close one
-- (used by the "Clock Out Now" button on the admin Hours page, for
-- members who forgot to clock out themselves).
drop policy if exists "admins can view all active sessions" on public.active_clock_sessions;
create policy "admins can view all active sessions"
  on public.active_clock_sessions for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'officer')
    )
  );

drop policy if exists "admins can force close active sessions" on public.active_clock_sessions;
create policy "admins can force close active sessions"
  on public.active_clock_sessions for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role in ('admin', 'officer')
    )
  );
