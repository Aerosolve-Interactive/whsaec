-- Migration: protect the role column, and make "officer" a real lesser role
-- Run once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.
--
-- Two things here.
--
-- 1. PRIVILEGE ESCALATION. profiles has UPDATE policies "Users update own
--    profile" and "profiles_update_own", both "using (auth.uid() = id)". RLS is
--    row-level, not column-level, so permission to update your own row includes
--    permission to update your own role column. Any member could set themselves
--    to admin, which would hand them the whole member table, hour verification,
--    and the ability to demote everyone else. Nothing in the schema prevented
--    it. The trigger below does.
--
-- 2. OFFICER WAS NOT ACTUALLY A LESSER ROLE. Every check in the app was
--    ['admin','officer'], so "officer" granted exactly what "admin" did --
--    including deleting members and changing roles. That left no way to give
--    someone partial responsibility (outreach, projects) without also handing
--    them the ability to delete the founder's account.
--
-- After this:
--   is_staff()  -- admin + officer -- view members, grant/verify hours, projects
--   is_admin()  -- admin only      -- change roles, delete members

-- Admin-only check. Mirrors is_staff(); SECURITY DEFINER for the same reason:
-- reading profiles from inside a profiles policy would otherwise recurse.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Guard the role column itself. This is what stops self-promotion, and what
-- makes "officer" meaningfully narrower than "admin".
create or replace function public.protect_role_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then

    -- Server-side callers (SQL editor, service-role key, scheduled jobs) have
    -- no auth.uid(). Let those through so roles stay fixable administratively
    -- even if every admin account is locked out.
    if auth.uid() is null then
      return new;
    end if;

    if not public.is_admin() then
      raise exception 'Only an admin can change a member role.'
        using errcode = 'insufficient_privilege';
    end if;

    -- An admin changing their own role -- including promoting themselves --
    -- is the same self-approval problem as verifying your own hours.
    if old.id = auth.uid() then
      raise exception 'You cannot change your own role. Ask another admin.'
        using errcode = 'insufficient_privilege';
    end if;

  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row
  execute function public.protect_role_column();

-- Deleting a member is admin-only. There was no DELETE policy at all before,
-- which means the Delete button on /admin/members silently did nothing.
drop policy if exists "admins can delete profiles" on public.profiles;
create policy "admins can delete profiles"
  on public.profiles for delete
  using (public.is_admin());

-- What each role can now do:
--
--   member            own profile only; cannot change own role
--   officer           view all members, grant + verify hours, manage projects
--                     CANNOT change roles, CANNOT delete members
--   admin             all of the above, plus roles and deletion
--                     CANNOT change their own role
