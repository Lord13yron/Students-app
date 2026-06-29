-- Hosting Tracker — Phase 2: RLS, membership helper, create/join RPCs
-- Run this in the Supabase dashboard → SQL Editor, ONCE, AFTER schema.sql.
-- It is safe to re-run: functions use `create or replace`, policies are dropped first.

-- ---------------------------------------------------------------------------
-- 1. Membership helper — defeats the RLS infinite-recursion trap.
--    SECURITY DEFINER runs as the function owner with RLS bypassed, so calling
--    it from inside the household_members policy does NOT recurse.
-- ---------------------------------------------------------------------------
create or replace function is_household_member(h_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from household_members
    where household_id = h_id and user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. created_by defaults — audit stamp filled in automatically, so the app
--    never has to send it. Does not gate who can edit.
-- ---------------------------------------------------------------------------
alter table income_entries alter column created_by set default auth.uid();
alter table expenses       alter column created_by set default auth.uid();

-- ---------------------------------------------------------------------------
-- 3. Enable Row-Level Security on all six tables.
-- ---------------------------------------------------------------------------
alter table households        enable row level security;
alter table household_members enable row level security;
alter table students          enable row level security;
alter table stays             enable row level security;
alter table income_entries    enable row level security;
alter table expenses          enable row level security;

-- ---------------------------------------------------------------------------
-- 4. Policies. Members of a household have full read/write on its data;
--    everyone else sees nothing. Writes to households/household_members happen
--    only through the SECURITY DEFINER RPCs below, so those tables get no
--    write policies here.
-- ---------------------------------------------------------------------------

-- households: members can read their own row (to display/share the invite code).
drop policy if exists households_select on households;
create policy households_select on households
  for select using (is_household_member(id));

-- household_members: members can see who else is in their household.
drop policy if exists household_members_select on household_members;
create policy household_members_select on household_members
  for select using (is_household_member(household_id));

-- students: full CRUD within your household.
drop policy if exists students_all on students;
create policy students_all on students
  for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));

-- stays: no household_id of their own — reach it through students.
drop policy if exists stays_all on stays;
create policy stays_all on stays
  for all
  using (student_id in (select id from students where is_household_member(household_id)))
  with check (student_id in (select id from students where is_household_member(household_id)));

-- income_entries: full CRUD within your household.
drop policy if exists income_entries_all on income_entries;
create policy income_entries_all on income_entries
  for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));

-- expenses: full CRUD within your household.
drop policy if exists expenses_all on expenses;
create policy expenses_all on expenses
  for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));

-- ---------------------------------------------------------------------------
-- 5. Create / join RPCs. The app calls one of these right after signup.
--    Both are SECURITY DEFINER so they can write the membership row past RLS,
--    and both enforce one-household-per-user.
-- ---------------------------------------------------------------------------

-- create_household: start a fresh household and join it as the first member.
create or replace function create_household(p_name text)
returns households
language plpgsql
security definer
set search_path = public
as $$
declare
  h households;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if exists (select 1 from household_members where user_id = auth.uid()) then
    raise exception 'already in a household';
  end if;

  insert into households (name) values (p_name) returning * into h;
  insert into household_members (household_id, user_id) values (h.id, auth.uid());
  return h;
end;
$$;

-- join_household: join an existing household via its invite code.
create or replace function join_household(p_invite_code text)
returns households
language plpgsql
security definer
set search_path = public
as $$
declare
  h households;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if exists (select 1 from household_members where user_id = auth.uid()) then
    raise exception 'already in a household';
  end if;

  select * into h from households where invite_code = upper(trim(p_invite_code));
  if h.id is null then
    raise exception 'invalid invite code';
  end if;

  insert into household_members (household_id, user_id) values (h.id, auth.uid());
  return h;
end;
$$;

grant execute on function create_household(text) to authenticated;
grant execute on function join_household(text)   to authenticated;
