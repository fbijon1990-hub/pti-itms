-- =====================================================================
-- Public evaluation forms: let participants submit feedback via a shared
-- link with no login, WITHOUT exposing any other data.
-- Run this in Supabase SQL Editor after 0001 (and 0002 if used).
-- =====================================================================

-- Optional respondent name (blank = anonymous).
alter table evaluations add column if not exists respondent_name text;

-- Public form submissions carry no participant_id; make it optional.
alter table evaluations alter column participant_id drop not null;

-- ---------------------------------------------------------------------
-- Expose ONLY id + title of a single training to anonymous visitors,
-- via a security-definer function. The trainings table itself stays
-- private (no blanket anon read).
-- ---------------------------------------------------------------------
create or replace function public.get_training_public(tid text)
returns table (id text, title text)
language sql
security definer
set search_path = public
as $$
  select id, title from trainings where id = tid;
$$;

grant execute on function public.get_training_public(text) to anon;

-- ---------------------------------------------------------------------
-- Allow the anonymous role to INSERT evaluations only. It cannot read,
-- update or delete them, and cannot touch any other table.
-- ---------------------------------------------------------------------
grant insert on evaluations to anon;

drop policy if exists "anon_insert_eval" on evaluations;
create policy "anon_insert_eval"
  on evaluations
  for insert
  to anon
  with check (true);
