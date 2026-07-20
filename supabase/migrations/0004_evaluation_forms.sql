-- =====================================================================
-- Custom evaluation forms (Google-Forms style, no login for respondents)
-- Run in Supabase SQL Editor after 0001. Supersedes 0003's public path
-- (0003 is harmless if already run).
-- =====================================================================

create table if not exists evaluation_forms (
  id          uuid primary key default gen_random_uuid(),
  training_id text references trainings(id) on delete cascade,
  title       text not null,
  description text,
  is_open     boolean default true,
  created_at  timestamptz default now()
);

create table if not exists evaluation_questions (
  id       uuid primary key default gen_random_uuid(),
  form_id  uuid references evaluation_forms(id) on delete cascade,
  prompt   text not null,
  type     text not null default 'rating',   -- rating | text | paragraph | choice
  options  jsonb default '[]'::jsonb,         -- for 'choice'
  required boolean default true,
  sort     integer default 0
);

create table if not exists evaluation_responses (
  id             uuid primary key default gen_random_uuid(),
  form_id        uuid references evaluation_forms(id) on delete cascade,
  respondent_name text,
  submitted_at   timestamptz default now()
);

create table if not exists evaluation_answers (
  id          uuid primary key default gen_random_uuid(),
  response_id uuid references evaluation_responses(id) on delete cascade,
  question_id uuid references evaluation_questions(id) on delete cascade,
  rating      integer,
  answer_text text
);

create index if not exists idx_eq_form on evaluation_questions(form_id);
create index if not exists idx_er_form on evaluation_responses(form_id);
create index if not exists idx_ea_response on evaluation_answers(response_id);
create index if not exists idx_ea_question on evaluation_answers(question_id);

-- RLS: signed-in staff have full access; the public has none (they use the
-- two security-definer functions below instead).
do $$
declare t text;
begin
  for t in select unnest(array[
    'evaluation_forms','evaluation_questions','evaluation_responses','evaluation_answers'])
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "auth_all" on %I;', t);
    execute format('create policy "auth_all" on %I for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- Public read: return one open form with its questions, as JSON. Nothing
-- else in the database is exposed.
-- ---------------------------------------------------------------------
create or replace function public.get_public_form(fid uuid)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', ef.id,
    'title', ef.title,
    'description', ef.description,
    'is_open', ef.is_open,
    'training_title', t.title,
    'questions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', q.id, 'prompt', q.prompt, 'type', q.type,
        'options', q.options, 'required', q.required
      ) order by q.sort, q.id)
      from evaluation_questions q where q.form_id = ef.id
    ), '[]'::jsonb)
  )
  from evaluation_forms ef
  left join trainings t on t.id = ef.training_id
  where ef.id = fid;
$$;

grant execute on function public.get_public_form(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------
-- Public write: record one response and its answers in a single call.
-- Rejects submissions to a closed or missing form.
-- ---------------------------------------------------------------------
create or replace function public.submit_public_response(fid uuid, rname text, answers jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rid uuid;
  a jsonb;
  open_flag boolean;
begin
  select ef.is_open into open_flag from evaluation_forms ef where ef.id = fid;
  if open_flag is null then
    raise exception 'Form not found';
  end if;
  if open_flag = false then
    raise exception 'Form is closed';
  end if;

  insert into evaluation_responses (form_id, respondent_name)
  values (fid, nullif(trim(coalesce(rname, '')), ''))
  returning id into rid;

  for a in select * from jsonb_array_elements(answers)
  loop
    insert into evaluation_answers (response_id, question_id, rating, answer_text)
    values (
      rid,
      (a->>'question_id')::uuid,
      nullif(a->>'rating', '')::int,
      nullif(trim(coalesce(a->>'answer_text', '')), '')
    );
  end loop;
end;
$$;

grant execute on function public.submit_public_response(uuid, text, jsonb) to anon, authenticated;
