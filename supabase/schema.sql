-- Hosting Tracker — Phase 1 schema
-- Run this in the Supabase dashboard → SQL Editor (one block).
-- RLS is intentionally NOT enabled here; that is Phase 2.

-- 1.1 households (invite_code added now for Phase 2)
create table households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  created_at  timestamptz not null default now()
);

-- 1.2 household_members
create table household_members (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),
  unique (household_id, user_id)
);

-- 1.3 students
create table students (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name         text not null,
  notes        text,
  created_at   timestamptz not null default now()
);

-- 1.4 stays
create table stays (
  id             uuid primary key default gen_random_uuid(),
  student_id     uuid not null references students(id) on delete restrict,
  arrival_date   date not null,
  departure_date date,
  created_at     timestamptz not null default now()
);

-- 1.5 income_entries
create table income_entries (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  student_id   uuid not null references students(id) on delete restrict,
  date         date not null,
  amount       numeric(12,2) not null,
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now()
);

-- 1.6 expenses
create table expenses (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  student_id   uuid references students(id) on delete restrict,
  amount       numeric(12,2) not null,
  date         date not null,
  type         text not null check (type in ('direct','shared','excluded')),
  category     text,
  note         text,
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  -- direct expenses belong to one student; shared/excluded do not
  constraint expenses_direct_student check (
    (type = 'direct' and student_id is not null) or
    (type in ('shared','excluded') and student_id is null)
  )
);
