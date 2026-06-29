# Hosting Tracker — Build Plan

A checkable, step-by-step plan. Work top to bottom. Each phase ends with a
"you can now…" so you know it actually works before moving on. Don't skip ahead —
later phases assume earlier ones are done.

---

## Phase 0 — Tools & accounts (½ day)

- [ ] 0.1 Install Node.js (LTS) if you don't have it. Verify: `node --version`.
- [ ] 0.2 Install the Expo tooling: `npm install -g expo` (or use `npx` per-command).
- [ ] 0.3 Install **Expo Go** on both your phones (App Store / Play Store).
- [ ] 0.4 Create a free **Supabase** account at supabase.com.
- [ ] 0.5 Create a new Supabase project. Save the **Project URL** and **anon public key**
        (Project Settings → API). You'll paste these into the app later.

✅ You can now: log into Supabase and open Expo Go.

---

## Phase 1 — Database schema (1 day)

Do all of this in the Supabase web dashboard → SQL Editor. Run each block, check
it succeeded, then move on.

- [ ] 1.1 Create the `households` table (id, name, created_at).
- [ ] 1.2 Create `household_members` (id, household_id → households, user_id, created_at).
- [ ] 1.3 Create `students` (id, household_id, name, notes, created_at).
- [ ] 1.4 Create `stays` (id, student_id → students, arrival_date, departure_date nullable).
- [ ] 1.5 Create `income_entries` (id, household_id, student_id, date, amount, created_by, created_at).
- [ ] 1.6 Create `expenses` (id, household_id, amount, date, type, student_id nullable,
        category, note, created_by, created_at). Add a CHECK so `type` is one of
        direct/shared/excluded.
- [ ] 1.7 Add a couple of test rows by hand in the Table Editor, then delete them.
        Confirms the tables and foreign keys work.

✅ You can now: see all six tables in the Supabase Table Editor.

> Tip: when you reach this phase, ask me to generate the exact `CREATE TABLE` SQL.
> I held it back so the plan stays readable, but it's ready when you are.

---

## Phase 2 — Security rules / RLS (1 day) — THE FIDDLY PHASE

This is the part most likely to bite. Go slow and test with both accounts.

- [ ] 2.1 Enable Row-Level Security on all six tables.
- [ ] 2.2 Write a policy: a user can only see/edit rows whose `household_id`
        matches a household they belong to (via `household_members`).
- [ ] 2.3 Write the "create a household on signup" logic (a trigger or a small
        function): when a new user signs up, create their household + membership,
        OR join an existing one via an invite code.
- [ ] 2.4 Decide the second-person flow: simplest is an **invite code** stored on
        the household. Person 2 enters it on signup to join the same household.
- [ ] 2.5 TEST: sign up account A, add a student. Sign up account B with A's invite
        code. Confirm B sees A's student. Confirm a third unrelated account sees nothing.

✅ You can now: two accounts share one dataset, strangers see nothing.

> ⚠️ If a list is empty when it shouldn't be, it's almost always an RLS policy —
> not a bug in the app. Debug here, not in React.

---

## Phase 3 — App scaffold + login (1 day)

- [ ] 3.1 Create the Expo app: `npx create-expo-app hosting-tracker`. Run it, see it
        load in Expo Go on your phone.
- [ ] 3.2 Install the Supabase client (`@supabase/supabase-js`) and a secure storage
        adapter for the session.
- [ ] 3.3 Add a `supabase.js` file with your Project URL + anon key from Phase 0.
- [ ] 3.4 Build a login/signup screen (email + password). Signup should accept an
        optional invite code (feeds Phase 2.4).
- [ ] 3.5 TEST: log in on both phones with your two accounts.

✅ You can now: both of you log into the app on your own phones.

---

## Phase 4 — Students & stays screen (1 day)

Build this first of the data screens — nothing else is meaningful without students.

- [ ] 4.1 List screen: show all students in the household.
- [ ] 4.2 Add-student form: name + notes.
- [ ] 4.3 For each student, add/edit **stays**: arrival date, optional departure date.
- [ ] 4.4 TEST: add a student with a stay on phone A, confirm it appears on phone B.

✅ You can now: manage who you host and when.

---

## Phase 5 — Income screen (½ day)

- [ ] 5.1 Form to log a monthly stipend: student, date/month, amount.
- [ ] 5.2 List of income entries, newest first, editable and deletable.
- [ ] 5.3 TEST: add a few months of income, edit one, delete one.

✅ You can now: record the money you receive.

---

## Phase 6 — The split calculation (½ day) — THE ONE PIECE OF REAL LOGIC

Build this as a standalone, tested function before wiring it into screens.

- [ ] 6.1 Write a pure function: given an expense's date and the list of stays,
        return which students were present that day and the per-head share.
- [ ] 6.2 Test it on paper cases: nobody present, one present, two present, someone
        who left the day before, someone who arrived the same day.

✅ You can now: trust your shared-expense math.

---

## Phase 7 — Add-expense screen (1 day)

- [ ] 7.1 Form: amount, date (default today), type (default shared),
        category (default last-used), note. If type = direct, pick a student.
- [ ] 7.2 Save to `expenses`. List recent expenses, editable and deletable.
- [ ] 7.3 TEST: log one of each type (direct, shared, excluded) and confirm they save.

✅ You can now: record everything you spend.

---

## Phase 8 — Dashboard (1 day) — THE REWARD

- [ ] 8.1 Pick the reporting period (default: current calendar year).
- [ ] 8.2 Compute net: total income − (direct expenses + shared shares via Phase 6),
        excluding `excluded` expenses.
- [ ] 8.3 Show the net number big, with income and expense subtotals beneath.
- [ ] 8.4 Prominent "+ Add expense" button that opens Phase 7.
- [ ] 8.5 Make this the landing screen after login.

✅ You can now: open the app and instantly see your profit.

---

## Phase 9 — Report screen (1 day) — THE YEAR-END PAYOFF

- [ ] 9.1 Period picker (calendar year or academic year via custom range).
- [ ] 9.2 Breakdown by student: income received vs. expenses attributed.
- [ ] 9.3 Breakdown by category.
- [ ] 9.4 The final net figure for the period.

✅ You can now: at year end, see exactly how much you made.

---

## Phase 10 — Polish (ongoing, optional)

- [ ] 10.1 Add the "personal estimate, not tax advice" disclaimer somewhere visible.
- [ ] 10.2 Empty states ("No students yet — add one").
- [ ] 10.3 Confirmation before deleting anything.
- [ ] 10.4 A loading spinner so empty lists don't look like errors.

---

## Deferred to "version 2" (don't build these yet)

Recurring-income automation · receipt photos · push reminders · charts/graphs ·
hosting with more than two people · export to spreadsheet.

---

## Rough timeline

If you work on it evenings/weekends, this is a **3–5 week** build. Phases 2 (RLS)
and 8 (dashboard) are the ones to budget extra time for. Everything else is forms.

## Where to ask me for help next

The natural next request is **"write the Phase 1 SQL"** — the full `CREATE TABLE`
statements — followed by the Phase 2 RLS policies and the household/invite flow,
since those three are the foundation everything sits on.
