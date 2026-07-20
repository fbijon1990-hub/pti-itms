# PTI Institutional Training Management System

A training-management platform for the **Parliamentary Training Institute (PTI), Parliament of Ghana**.
Built with Next.js 14 (App Router), TypeScript, Tailwind CSS and Supabase (Postgres + Auth).

Thirteen modules: training calendar, participant nominations, cohort allocation, invitations
and notices, QR attendance, pre/post assessments, participant evaluations, facilitators and
honoraria, training budgets, certificates, competency records, training reports and a management
dashboard.

---

## Deploy in three stages

You need free accounts on **Supabase**, **GitHub** and **Vercel**.

### 1. Supabase (database + auth)

1. Go to https://supabase.com and create a new project. Note the database password.
2. Open **SQL Editor** -> **New query**. Paste the contents of
   `supabase/migrations/0001_init.sql` and click **Run**. This creates every table,
   the indexes and the row-level-security policies.
3. (Optional) Run `supabase/migrations/0002_seed.sql` the same way to load the PTI sample data
   (three programmes, eight participants, facilitators, a completed programme with attendance,
   assessments, evaluations and certificates). Skip this for an empty system.
4. Create your first user: **Authentication** -> **Users** -> **Add user** ->
   enter an email and password and tick **Auto Confirm**. (Or use the in-app "Create account"
   button and confirm via the email link. Auto-confirm is simplest for internal staff.)
5. Go to **Project Settings** -> **API** and copy two values:
   - `Project URL`
   - `anon` `public` key

### 2. GitHub (source control)

From this project folder:

```bash
git init
git add .
git commit -m "PTI ITMS: initial commit"
git branch -M main
git remote add origin https://github.com/fbijon1990-hub/pti-itms.git
git push -u origin main
```

(Create the empty `pti-itms` repository at https://github.com/new first.)

### 3. Vercel (hosting)

1. Go to https://vercel.com -> **Add New** -> **Project** -> import `fbijon1990-hub/pti-itms`.
2. Framework preset is detected as **Next.js**. Leave build settings as default.
3. Under **Environment Variables**, add both (from Supabase step 5):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. When it finishes, open the URL and sign in with the user from step 4.

That's it. Every push to `main` redeploys automatically.

---

## Run locally

```bash
npm install
cp .env.example .env.local     # then fill in the two Supabase values
npm run dev                    # http://localhost:3000
```

Useful scripts: `npm run build`, `npm run start`, `npm run typecheck`.

---

## How it is put together

```
supabase/migrations/   0001 schema + RLS, 0002 sample data
lib/supabase/          browser client, server client, auth middleware
lib/queries.ts         all server-side reads and derived metrics
lib/format.ts          GHS currency, dates, percentages (British spelling)
lib/types.ts           row types for every table
app/login/             email + password auth (Supabase Auth)
app/(app)/             the authenticated shell and all module pages
components/             sidebar + shared UI (cards, badges, tables)
middleware.ts          refreshes the session and guards every /(app) route
```

**Security model.** RLS is on for every table. The policy grants full read/write to any
signed-in (`authenticated`) user - correct for a single internal institute. To restrict by
role later, add a `role` column to a `staff` table and tighten the policies in `0001_init.sql`.

**Currency and spelling.** All amounts render as `GHS` via `lib/format.ts`; British spelling
throughout.

---

## Module status

Fully wired (create / edit / delete against Supabase): **Training Calendar**, **Participants**,
**Nominations** (approve / waitlist / reject, with auto-generated invitations), **Settings**.

Live read + analytics views (data comes straight from Supabase): **Dashboard**, **Cohorts**,
**Budgets**, **Facilitators & Honoraria**, **Invitations**, **Attendance**, **Assessments**,
**Evaluations**, **Certificates**, **Competency records**, **Reports**.

The read views share the same server-action pattern as the wired modules, so adding their
create/edit forms is mechanical - the next increment.
