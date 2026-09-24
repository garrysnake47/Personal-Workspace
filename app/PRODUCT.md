# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Working software professionals who are accountable for what they did, ticket by
ticket and day by day: people in daily stand-ups, sprint reviews, and one-to-ones
who are regularly asked "what happened with ASU-1234?" or "what did you get done
this sprint?" and cannot answer from memory.

The product is single-user by construction — every row is scoped to a `userId`
and no user can read another's. There are no teams, no shared workspaces, and no
collaboration surface. The visitor is evaluating it for themselves alone, not for
a team, and this is a real constraint on what the marketing page may promise.

Primary situation: the end of a working block, with the work still fresh and
about ninety seconds of willingness to write it down.

## Product Purpose

Record the working day as it happens — work logs, meeting notes, and ticket
updates — so the story of each day survives past the day. Success is that months
later the record still answers what happened, when, and in what order, without
anyone having reconstructed it.

## Positioning

**Ticket history is append-only.** Writing today's update never overwrites
yesterday's. Every `TicketWorkUpdate` is a new immutable row; the ticket's current
status changes, but the status history is preserved. Correcting the record means
appending a correction, which is itself dated.

This is the claim a neighbouring tool cannot truthfully copy. Issue trackers store
a current state and let comments be edited or deleted; note apps store a document
that is overwritten every time it is saved. The same immutability governs the
Tracker (`FollowUpUpdate`), deliberately: there is no action to edit or delete a
single update anywhere in the product.

Second-order position: the ticket is found or created **inside** today's log — no
page change, no modal — so recording the work never interrupts it.

## Operating Context

- One work log per calendar day (the user's LOCAL day, not UTC).
- Four standing meeting cards are present on each new log, waiting for notes.
- Ticket IDs are free text in the user's own scheme (e.g. `ASU-1234`), unique per
  user rather than globally; the product does not sync with Jira or any tracker.
- The in-progress update for today may be autosaved in place while editing;
  finalised and historical updates are immutable. Autosave must never produce
  duplicate `TicketWorkUpdate` rows.
- Current and previous sprints sit on one timeline; weekends are excluded.
- Used every working day, at speed, on a desktop.

## Capabilities and Constraints

**Live:** public homepage, login, registration, Work Logs (editor, detail,
listing), Dashboard, Tracker, Notes, Resources. Ticket search/create and work
updates live inside the Work Log editor.

**Authenticated but unbuilt** (shared "Coming Soon" page): standalone Tickets,
Tasks, Reports, Links, Profile, Settings. The marketing page must not present
these as available.

**Deliberately deferred — must not be promised:** AI summaries; Jira, GitHub,
Slack or Calendar integrations; file attachments; PDF/Markdown export; emailed
reports; team workspaces.

**Technical:** Next.js 15 App Router, React, TypeScript, Tailwind CSS v4,
PostgreSQL 16 via Prisma, Auth.js v5 with a credentials provider (bcrypt), Zod
validation on every mutation. Self-hosted; registration is open.

**Terminology:** Work Log, Ticket, Work Update, Meeting Note, Tracker (the data
models behind Tracker are still named `FollowUp` — the UI never says so).

## Brand Commitments

Name: **Personal Workspace**.

Voice: plain, concrete, first-person-adjacent. States what the product does in the
user's own working language and does not sell in superlatives.

Product principle carried from the original spec: it **must not look like a
generic CRUD admin panel**; the reference feel is Linear / Notion / modern SaaS.

No binding palette, typeface, or layout constraint. The user explicitly released
all of them for this redesign ("complete new colour palette, new design"), so the
incumbent teal / Plus Jakarta Sans system is evidence and anti-reference, not
authority.

## Evidence on Hand

- Working product with real screens behind auth, and seed data.
- Assets: `public/Images/person-writing-work-log.png` (1254², transparent) and
  three flat SVGs — `meeting-notes-cards.svg`, `ticket-history-timeline.svg`,
  `checklist-cards.svg`.
- `src/components/marketing/app-mock.tsx` renders product surfaces in DOM +
  tokens (`DashboardMock`, `WorkLogMock`, `TicketMock`, `TasksNotesMock`), each a
  single `role="img"` node — currently unused on the homepage.

**Confirmed absent — must not be fabricated:** no users, no customers, no
testimonials, no logos, no press, no usage numbers, no uptime or benchmark
figures, no pricing, no case studies, no team. The product has never had a user
other than its author.

**Confirmed method:** product surfaces on the marketing page are DRAWN in DOM and
tokens, never screenshotted. The user chose this over real captures.

## Product Principles

1. **The record is append-only.** Nothing the product shows may imply that
   history can be rewritten — that immutability is the whole value.
2. **Capture must be cheaper than remembering.** Any claim or flow that adds
   effort at the moment of writing contradicts the product.
3. **One person's record.** No team, sharing, or collaboration language, ever.
4. **Only what exists.** Deferred features and unbuilt routes are never presented
   as available, and no social proof may be invented.
5. **Not an admin panel.** Density and speed are the goal, but the surface has to
   feel like a modern product, not a CRUD table.

## Accessibility & Inclusion

Desktop-first but fully responsive at 360 / 768 / 1024 / 1440. Keyboard-friendly,
minimal clicking, minimal modals. Light and dark themes are both first-class; the
theme is chosen before first paint to avoid a flash.
