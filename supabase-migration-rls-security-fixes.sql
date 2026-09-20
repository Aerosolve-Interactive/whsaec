-- Migration: close public exposure of member profiles, de-recurse admin policies
-- Run once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.
--
-- Two problems found while debugging Google sign-in:
--
-- 1. A policy named "profiles_select_all" existed on public.profiles with
--    qual = true -- no condition at all. Because permissive policies are ORed
--    together, it overrode every other policy on the table and let ANY caller
--    read every row. The anon key is NEXT_PUBLIC_ and ships inside the client
--    JS bundle, so this meant anyone who opened devtools could dump every
--    member's name and email. For a high-school program that is minors' PII.
--
-- 2. "Admins update any profile" checked staff status with an inline
--    "exists (select 1 from profiles ...)" subquery. On profiles, that shape
--    re-triggers the policy being evaluated and Postgres aborts with
--    "42P17 infinite recursion detected in policy for relation profiles".
--    The SELECT policy had the same bug and had already taken down every
--    profile read in the portal.
--
-- public.is_staff() (defined in supabase-migration-admin-granted-hours.sql) is
-- SECURITY DEFINER, so it reads the role with RLS bypassed and cannot recurse.

-- Defined here too so this file can be applied standalone.
create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'officer')
  );
$$;

revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;

-- 1. Remove the unconditional read policy. This is the actual leak.
drop policy if exists "profiles_select_all" on public.profiles;

-- 2. Re-point the admin SELECT policy at is_staff() so it cannot recurse.
drop policy if exists "admins can view all profiles" on public.profiles;
create policy "admins can view all profiles"
  on public.profiles for select
  using (id = auth.uid() or public.is_staff());

-- 3. Same treatment for the admin UPDATE policy.
drop policy if exists "Admins update any profile" on public.profiles;
create policy "Admins update any profile"
  on public.profiles for update
  using (public.is_staff())
  with check (public.is_staff());

-- After this:
--   anonymous visitors        -> can read no profiles at all
--   signed-in members         -> own profile, plus whatever
--                                "Profiles are viewable by authenticated users"
--                                still allows
--   admins / officers         -> read and update everyone, via is_staff()
--
-- Verify by querying /rest/v1/profiles with the anon key and no user session:
-- it must return [] rather than rows.
