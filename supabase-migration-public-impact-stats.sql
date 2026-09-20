-- Migration: public impact stats for the homepage
-- Run once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.
--
-- Context: the homepage shows "Volunteer Hours Logged", but volunteer_hours is
-- not readable by anonymous visitors -- so the stat always rendered 0 for
-- logged-out users, which is nearly everyone looking at the site.
--
-- The obvious fix (an RLS policy letting anon read verified hours) would also
-- expose every individual row: member_id, date, and description. That is the
-- same class of leak we just closed on profiles. Instead this exposes only the
-- aggregate: a SECURITY DEFINER function reads the table with RLS bypassed and
-- returns two numbers. Callers can never reach the underlying rows.

create or replace function public.public_impact_stats()
returns table (verified_hours numeric, project_count bigint)
language sql
security definer
set search_path = public
stable
as $$
  select
    coalesce(
      (select sum(hours) from public.volunteer_hours where verified = true),
      0
    )::numeric as verified_hours,
    (select count(*) from public.projects)::bigint as project_count;
$$;

-- Aggregates only -- safe for anonymous visitors.
revoke all on function public.public_impact_stats() from public;
grant execute on function public.public_impact_stats() to anon, authenticated;

-- Check: should return one row with the real totals.
select * from public.public_impact_stats();
