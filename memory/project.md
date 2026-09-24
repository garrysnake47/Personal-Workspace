# Project — Personal Workspace

**What we're building:** A single-user work management app for daily professional use. Central place to record daily work logs, meeting notes, ticket work history, tasks, notes, reports, links, and resources. Used every working day for fast data entry, and later mined to generate reports.

**Location:** `app/` (Next.js project). Agent + memory files live at repo root.

## Stack (decided 2026-09-12)
- Next.js 15 (App Router) + React + TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL 16 via Docker Compose (`docker compose up -d`)
- Prisma ORM
- Auth.js (NextAuth v5) — credentials provider, bcrypt
- Zod for validation
- Node 24

## The one feature that matters most
**Work Log → Ticket search/create → append work update.** Everything else is secondary. Specifically:

1. User types a Ticket ID (e.g. `ASU-1234`) inside today's work log.
2. If it exists for this user → load it, show title, current status, recent history.
3. If not → create it inline. No page change, no modal.
4. User writes "Work Done Today" + sets status.
5. On save this creates a **NEW `TicketWorkUpdate` row**. It NEVER overwrites a previous one.
6. The ticket's current status updates; status history is preserved.

**This is the requirement to get right before anything else is built.**

Autosave caveat: the *in-progress* update for today's log may be updated in place while editing (debounced). Finalized/historical updates are immutable. Autosave must never produce duplicate TicketWorkUpdate rows.

## Build order (core workflow first)
1. Auth (login / register / logout / protected routes)
2. App shell (collapsible sidebar, top nav, light+dark)
3. Dashboard
4. Work Log editor — meetings + ticket search/create + work updates
5. Work Log detail (read-only) + listing
6. Tickets list + ticket detail timeline
7. Then: Tasks, Notes, Reports, Links, Resources, Global search

## Current product scope (2026-09-13)
Only the public homepage, login, registration, Work Logs, and Resources are active. The standalone Tickets, Tasks, Reports, Links, Profile, and Settings routes remain authenticated but render a shared Coming Soon page. Ticket creation and updates embedded inside Work Logs remain part of the active core workflow.

**Superseded (2026-09-16):** Dashboard, Tracker and Notes are live — this line previously listed Dashboard and Notes as Coming Soon. `/dashboard` renders Today, Needs you, This sprint, Tickets by stage, Recent ticket work and Library from `src/lib/dashboard.ts`.

**Tickets update (2026-09-23):** `/tickets` is live as the standalone ticket-management surface. It supports search/filtering, direct current-title/current-status edits, standalone body updates, and confirmed deletion of those standalone updates. Direct edits and deletes never rewrite or remove a `TicketWorkUpdate`; work-log notes and their status-at-that-time remain immutable.

**Work-log project context (2026-09-23):** Every work log has an optional `projectName` value labelled **Project name / site**. It can be supplied at creation, autosaved from the editor, searched from the work-log listing, and displayed on the sprint list, read-only timeline, and Today dashboard summary.

**Homepage/auth update (2026-09-19):** `/` and `/banner` now render the complete
photo-led personal workspace portfolio: paired day/night hero, four-link workspace
index, split about scene, coast quote and centered contact/footer. Login and registration
retain their intentionally different compositions (resume-state snapshot vs
creation-map canvas), and `/dashboard` remains an asymmetric daily command centre.

## Non-negotiables
- **User isolation.** Every query scoped to `userId`. A user must never read another user's rows.
- Passwords hashed (bcrypt). Server-side Zod validation on every mutation. Secrets in env only.
- `ticketId` unique **per user**, not globally.
- Desktop-first, fully responsive at 360/768/1024/1440.
- Must not look like a generic CRUD admin panel. Target feel: Linear / Notion / modern SaaS.
- Keyboard-friendly, minimal clicking, minimal modals.

## Deliberately deferred (keep architecture modular, don't build)
AI summaries, Jira/GitHub/Slack/Calendar integrations, file attachments, PDF/Markdown export, email reports, team workspaces.

## Full original spec
`memory/spec.md` — the user's complete prompt, verbatim. Consult it for any detail not covered here.

## Tracker (added 2026-09-14, `/tracker`)
Third active tool, alongside Work Logs and Resources. Holds **three kinds** of
entry, chosen from a dropdown on one form — `EntryKind` = `FollowUp | Task | Note`:

| Kind | Addressed to | Dated | Answers |
|---|---|---|---|
| Follow-up | a person (required) | next nudge | "what did I tell whom, and when?" |
| Task | you | due date | "what do I owe today?" |
| Note | you | never | "what did I want to keep?" |

They share one table because they share one spine: a subject, an optional day,
and an append-only record. Only the required fields and the wording differ —
all of that lives in `KIND_META` in `tracker-board.tsx`, so the form and the
cards stay one component instead of three near-copies.

> **Naming:** the Prisma models are still `FollowUp` / `FollowUpUpdate`, and the
> lib/actions files are still `follow-ups.ts`. The UI, route and nav say
> **Tracker**. Renaming the models is a migration nobody needs yet — just know
> the mapping before you go looking for a `Tracker` model.

The original follow-up question it was built for:

A `FollowUp` is a thread with one person about one subject (`person`, `subject`,
optional free-text `ticketKey`, optional `dueDate`, `status` Open|Done). The
thread holds **no note text**. Everything said lives in `FollowUpUpdate` rows —
`note` + `channel` (Slack/Email/Call/Meeting/Teams/InPerson/Other) + `occurredAt`
— and those rows are **append-only**, exactly like `TicketWorkUpdate`. There is
deliberately no action to edit or delete a single update: correcting the record
means appending a correction, which is itself dated. That immutability is the
whole value of the feature.

`/follow-ups` groups open threads into **Overdue → Today → Upcoming → Follow-ups**
(undated), with Done collapsed. "Today" is the user's local calendar day.
