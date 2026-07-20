-- =====================================================================
-- PTI Institutional Training Management System - schema
-- Parliamentary Training Institute, Parliament of Ghana
-- Run this in Supabase: SQL Editor -> paste -> Run
-- =====================================================================

-- ---------- Institution settings (single row, id = 'default') ----------
create table if not exists institution (
  id            text primary key default 'default',
  name          text not null default 'Parliamentary Training Institute',
  parent        text default 'Parliament of Ghana',
  location      text default 'Parliament House, Accra',
  signatory1    text default 'Director, PTI',
  signatory2    text default 'Clerk to Parliament',
  cert_prefix   text default 'PTI',
  pass_mark     integer default 12,
  attendance_min integer default 70,
  next_cert     integer default 1,
  updated_at    timestamptz default now()
);

-- ---------- Competency framework ----------
create table if not exists competencies (
  id    text primary key default gen_random_uuid()::text,
  name  text not null,
  area  text
);

-- ---------- Facilitators ----------
create table if not exists facilitators (
  id        text primary key default gen_random_uuid()::text,
  name      text not null,
  title     text,
  email     text,
  phone     text,
  rate      numeric default 0,          -- daily honorarium rate (GHS)
  pay_mode  text,
  pay_ref   text,
  tax       numeric default 7.5,        -- withholding tax %
  created_at timestamptz default now()
);

create table if not exists facilitator_competencies (
  facilitator_id text references facilitators(id) on delete cascade,
  competency_id  text references competencies(id) on delete cascade,
  primary key (facilitator_id, competency_id)
);

-- ---------- Participants ----------
create table if not exists participants (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  gender      text,
  institution text default 'Parliament of Ghana',
  dept        text,
  position    text,
  email       text,
  phone       text,
  created_at  timestamptz default now()
);

-- ---------- Budgets ----------
create table if not exists budgets (
  id    text primary key default gen_random_uuid()::text,
  title text
);

create table if not exists budget_lines (
  id        text primary key default gen_random_uuid()::text,
  budget_id text references budgets(id) on delete cascade,
  item      text not null,
  budget    numeric default 0,
  actual    numeric default 0,
  sort      integer default 0
);

-- ---------- Trainings ----------
create table if not exists trainings (
  id         text primary key default gen_random_uuid()::text,
  title      text not null,
  category   text,
  mode       text default 'In-person',   -- In-person | Virtual | Hybrid
  venue      text,
  start_date date,
  end_date   date,
  status     text default 'Planned',      -- Planned | Open | Completed | Cancelled
  capacity   integer default 20,
  budget_id  text references budgets(id) on delete set null,
  days       integer default 1,
  objectives text,
  created_at timestamptz default now()
);

create table if not exists training_sessions (
  id           text primary key default gen_random_uuid()::text,
  training_id  text references trainings(id) on delete cascade,
  session_date date not null
);

create table if not exists training_facilitators (
  training_id    text references trainings(id) on delete cascade,
  facilitator_id text references facilitators(id) on delete cascade,
  primary key (training_id, facilitator_id)
);

create table if not exists training_competencies (
  training_id   text references trainings(id) on delete cascade,
  competency_id text references competencies(id) on delete cascade,
  primary key (training_id, competency_id)
);

-- ---------- Cohorts ----------
create table if not exists cohorts (
  id          text primary key default gen_random_uuid()::text,
  training_id text references trainings(id) on delete cascade,
  name        text not null,
  capacity    integer default 12
);

create table if not exists cohort_members (
  cohort_id      text references cohorts(id) on delete cascade,
  participant_id text references participants(id) on delete cascade,
  primary key (cohort_id, participant_id)
);

-- ---------- Nominations ----------
create table if not exists nominations (
  id             text primary key default gen_random_uuid()::text,
  participant_id text references participants(id) on delete cascade,
  training_id    text references trainings(id) on delete cascade,
  nominated_by   text,
  justification  text,
  status         text default 'Pending',   -- Pending | Approved | Waitlisted | Rejected
  cohort_id      text references cohorts(id) on delete set null,
  nominated_on   date default current_date
);

-- ---------- Attendance ----------
create table if not exists attendance (
  id             text primary key default gen_random_uuid()::text,
  training_id    text references trainings(id) on delete cascade,
  participant_id text references participants(id) on delete cascade,
  session_date   date not null,
  checked_at     text,
  method         text default 'QR',        -- QR | Manual
  unique (training_id, participant_id, session_date)
);

-- ---------- Assessments ----------
create table if not exists assessments (
  id          text primary key default gen_random_uuid()::text,
  training_id text references trainings(id) on delete cascade,
  type        text not null,               -- Pre | Post
  title       text,
  max_score   integer default 20,
  threshold   integer default 12
);

create table if not exists assessment_scores (
  id             text primary key default gen_random_uuid()::text,
  assessment_id  text references assessments(id) on delete cascade,
  participant_id text references participants(id) on delete cascade,
  score          numeric default 0,
  unique (assessment_id, participant_id)
);

-- ---------- Evaluations ----------
create table if not exists evaluations (
  id             text primary key default gen_random_uuid()::text,
  training_id    text references trainings(id) on delete cascade,
  participant_id text references participants(id) on delete cascade,
  content        integer,
  facilitation   integer,
  materials       integer,
  logistics      integer,
  overall        integer,
  comment        text
);

-- ---------- Honoraria ----------
create table if not exists honoraria (
  id             text primary key default gen_random_uuid()::text,
  training_id    text references trainings(id) on delete cascade,
  facilitator_id text references facilitators(id) on delete cascade,
  days           numeric default 0,
  rate           numeric default 0,
  gross          numeric default 0,
  status         text default 'Pending'    -- Pending | Paid
);

-- ---------- Certificates ----------
create table if not exists certificates (
  id             text primary key default gen_random_uuid()::text,
  training_id    text references trainings(id) on delete cascade,
  participant_id text references participants(id) on delete cascade,
  number         text unique,
  issued_on      date default current_date
);

-- ---------- Competency records (pre/post proficiency) ----------
create table if not exists competency_records (
  id             text primary key default gen_random_uuid()::text,
  participant_id text references participants(id) on delete cascade,
  competency_id  text references competencies(id) on delete cascade,
  training_id    text references trainings(id) on delete cascade,
  pre            integer,
  post           integer
);

-- ---------- Notifications / invitations log ----------
create table if not exists notifications (
  id             text primary key default gen_random_uuid()::text,
  type           text default 'Invitation',   -- Invitation | Reminder | Notice
  training_id    text references trainings(id) on delete cascade,
  participant_id text references participants(id) on delete set null,
  subject        text,
  sent_on        date default current_date,
  status         text default 'Sent'
);

-- ---------- Helpful indexes ----------
create index if not exists idx_nominations_training on nominations(training_id);
create index if not exists idx_attendance_training on attendance(training_id);
create index if not exists idx_sessions_training on training_sessions(training_id);
create index if not exists idx_scores_assessment on assessment_scores(assessment_id);
create index if not exists idx_evaluations_training on evaluations(training_id);
create index if not exists idx_certificates_training on certificates(training_id);

-- =====================================================================
-- Row Level Security
-- Single-tenant internal tool: any authenticated (signed-in) staff user
-- may read and write. Tighten later with role columns if needed.
-- =====================================================================
do $$
declare t text;
begin
  for t in
    select tablename from pg_tables
    where schemaname = 'public'
      and tablename in (
        'institution','competencies','facilitators','facilitator_competencies',
        'participants','budgets','budget_lines','trainings','training_sessions',
        'training_facilitators','training_competencies','cohorts','cohort_members',
        'nominations','attendance','assessments','assessment_scores','evaluations',
        'honoraria','certificates','competency_records','notifications')
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "auth_all" on %I;', t);
    execute format(
      'create policy "auth_all" on %I for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;
