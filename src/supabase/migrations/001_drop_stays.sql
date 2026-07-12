-- 001: Fold stay dates into students; drop the stays table.
-- Stays were never one-to-many in practice, so arrival/departure live on the
-- student row. is_active (not the dates) is the source of truth for whether a
-- student is currently hosted — it drives shared-expense splitting.

alter table students
  add column arrival_date   date,
  add column departure_date date,
  add column is_active      boolean not null default true;

-- drop the now-unused stays table (also removes its RLS policy)
drop table if exists stays;
