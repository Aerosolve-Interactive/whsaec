-- Migration: populate profile names for OAuth (Google) sign-ins
-- Run once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
-- Safe to run more than once.
--
-- Context: the email/password signup form passes full_name through
-- options.data, so the profile row gets a name. Google sign-in skips that form
-- entirely, so profiles.full_name ends up null -- which is why the portal
-- renders "Welcome back," with no name and falls back to the "Member" avatar.
--
-- Google's metadata key varies (full_name, name, or given_name + family_name
-- depending on the provider and scopes), so every step below coalesces across
-- all of them and finally falls back to the email prefix, guaranteeing a
-- non-null display name.

-- 1. Create a profile for any auth user that doesn't have one yet.
--    Covers Google users who signed in before this migration existed.
insert into public.profiles (id, email, full_name, role)
select
  u.id,
  u.email,
  nullif(trim(coalesce(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    nullif(trim(concat_ws(' ',
      u.raw_user_meta_data->>'given_name',
      u.raw_user_meta_data->>'family_name')), ''),
    split_part(u.email, '@', 1)
  )), ''),
  'member'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 2. Backfill names onto profiles that exist but have a blank name.
update public.profiles p
set full_name = nullif(trim(coalesce(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      nullif(trim(concat_ws(' ',
        u.raw_user_meta_data->>'given_name',
        u.raw_user_meta_data->>'family_name')), ''),
      split_part(u.email, '@', 1)
    )), '')
from auth.users u
where u.id = p.id
  and (p.full_name is null or trim(p.full_name) = '');

-- 3. Make every future signup -- email/password or Google -- get a name.
--    Replaces the existing handle_new_user if one is already defined.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      nullif(trim(concat_ws(' ',
        new.raw_user_meta_data->>'given_name',
        new.raw_user_meta_data->>'family_name')), ''),
      split_part(new.email, '@', 1)
    )), ''),
    'member'
  )
  on conflict (id) do update
    set email     = excluded.email,
        -- never overwrite a name the member already has
        full_name = coalesce(nullif(trim(profiles.full_name), ''), excluded.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Confirm the result -- every row should now have a full_name.
select id, email, full_name, role
from public.profiles
order by full_name;
