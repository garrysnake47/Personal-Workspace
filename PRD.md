# PRD — WorkNest

> **What we're building.** Keep this file true to the code. When a feature ships,
> changes scope, or is retired, update the matching section here (see
> `AGENTS.md → Keeping the docs current`).
>
> Last synced with the codebase: **2026-09-29**

---

## 1. One-line pitch

WorkNest is a private, single-user workspace for a software professional's working
day: daily work logs, ticket history, follow-ups, notes and a resource library —
recorded as it happens so the record can answer *"what did I do, when, and in what
order?"* months later.

> Naming: the product was called **Personal Workspace** until the rebrand. The repo
> folder, the Docker container (`workspace-db`) and root `package.json` still use the
> old name. The UI, metadata and homepage say **WorkNest**.

## 2. Users & situation

- **Who:** one working software professional (the author) who is accountable ticket by
  ticket and day by day — stand-ups, sprint reviews, one-to-ones — and is regularly
  asked *"what happened with ASU-1234?"*.
- **Single-user by construction.** Registration is open, but every row is scoped to a
  `userId`; no user can see another's data. No teams, no sharing, no collaboration.
- **Primary moment:** the end of a working block, with ~90 seconds of willingness to
  write things down. Capture must be cheaper than remembering.
- **Device:** desktop-first, used every working day; must still work down to 360px.

## 3. Product principles

1. **The record is append-only.** Past ticket work and tracker updates are never
   rewritten. Correcting the record means appending a newer, dated entry.
2. **Capture is cheaper than remembering.** Tickets are found or created *inside*
   today's log — no page change, no modal. Autosave everywhere it's safe.
3. **One person's record.** No team, sharing or collaboration language, ever.
4. **Only what exists.** Deferred features and unbuilt routes are never presented as
   available; no invented social proof (users, logos, testimonials, numbers).
5. **Not an admin panel.** Dense and fast, but it should feel like Linear / Notion,
   not a CRUD table.

## 4. Feature inventory (current state)

Status legend: **Live** · **Hidden by setting** · **Coming soon** (authenticated
placeholder page) · **Retired** (redirects).

| Area | Route | Status | Summary |
|---|---|---|---|
| Homepage | `/` | Live (public) | Photo-led "Quiet Studio" page: hero, 4-link workspace index, about, contact, coast quote. |
| Banner review | `/banner` | Live (public) | Same component as `/`, kept as a design review route. |
| Auth | `/login`, `/register` | Live (public) | Email + password. Signed-in visitors are redirected to `/tracker`. |
| Work Logs | `/work-logs`, `/work-logs/[id]`, `/work-logs/[id]/edit` | Live | The core workflow — see §5.1. |
| Tickets | `/tickets` | Live · hidden when *Tickets* is off in Profile | Master-detail ticket manager — see §5.2. |
| Tracker | `/tracker` | Live — **post-login landing page** | Follow-ups, tasks, notes, ideas — see §5.3. |
| Notes | `/notes`, `/notes/new`, `/notes/[id]`, `/notes/[id]/edit` | Live | Notebooks: note → sections → pages — see §5.4. |
| Resources | `/resources` | Live | Typed personal library — see §5.5. |
| Favourites | `/favourites` | Live | Everything starred in one place — see §5.6. |
| Profile | `/profile` (account menu) | Live | Name, sprint calendar, tickets on/off — see §5.7. |
| Dashboard | `/dashboard` | **Retired 2026-09-25** | Redirects to `/tracker`. |
| Tasks, Reports, Links, Settings | `/tasks`, `/reports`, `/links`, `/settings` | Coming soon | Shared `ComingSoonPage`. `Task`/`Link` tables and actions exist but have no UI. |

Primary nav (in order): Work Logs · Tickets (only if enabled) · Tracker · Notes ·
Resources · Favourites. Account menu: Profile, Sign out.

## 5. Features in detail

### 5.1 Work Logs — the core workflow

**The one feature that matters most:** *Work Log → find/create ticket → append work
update.*

- **One log per user per calendar day** (`@@unique([userId, date])`). Opening a day
  creates it if missing.
- **Day type:** `Work`, `Holiday` or `Leave`. Holiday/Leave days account for the day
  without meetings or ticket work; their default titles are "Holiday" / "Leave"
  (a work day defaults to "Daily Work Log"). Auto-generated titles are hidden in the UI.
- **Listing (`/work-logs`):** grouped by **sprint** (from the user's Profile sprint
  calendar), newest first, with gaps kept visible so the schedule stays truthful.
  Weekends excluded. Days off render with a hatched tile. A "create day" tile opens a
  log for any date.
- **Editor (`/work-logs/[id]/edit`):** a navy hero header (title, day type, save
  status, prev/next log arrows), then sections:
  1. **Meetings** — every new log starts with four cards: *ASU Sync-up*, *Veritech
     Sync-up*, *Client Sync-up*, *Others*. Cards can be added, renamed, removed.
     Notes are Markdown (TipTap WYSIWYG, saved as Markdown text).
  2. **Tickets** (only when tickets are enabled) — type a key such as `ASU-1234`:
     - exists for this user → attach it, show title, status, recent history;
     - doesn't exist → create inline (key, title, project/site). No modal.
     - Write *work done today* and set the status. This upserts **one**
       `TicketWorkUpdate` for *(ticket, this log)*; the ticket's current status
       follows it.
     - Removing a ticket from a log deletes only that log's update row and recomputes
       the ticket's status from the newest surviving update.
  3. **Learning** — free Markdown notes for upskilling, independent of tickets.
  4. **Attachments** — upload files (≤10 MB each, ≤10 per upload) or add links.
- **Autosave** is debounced, shows a save-status indicator, never toasts, and never
  creates duplicate rows.
- **Detail (`/work-logs/[id]`):** read-only view with a side rail (ticket history in
  its own scroll area) and **Copy as text** — the whole log as plain text for
  stand-ups, chat or email.

### 5.2 Tickets

- Ticket keys are free text in the user's own scheme, **unique per user**, not
  globally. No Jira sync.
- `/tickets` is a master-detail board: search/filter the list, then **explicitly**
  select a ticket (nothing is auto-selected).
- Edit the ticket's current **title**, **status** and **project/site** directly.
- **Standalone updates** written on this page are `TicketHistoryEntry` rows. They can
  be deleted (with confirmation). Work-log updates (`TicketWorkUpdate`) are shown in
  the same newest-first timeline, labelled by source, and can **never** be edited or
  deleted from here.
- A ticket "journey" view accounts for holiday/leave days.
- **Workflow statuses (UI):** In Progress → Sent to QA → Ready for Production →
  Released → Done. Legacy stored values (Open, Blocked, Waiting, Testing, Completed,
  Closed) are normalised into these five.
- **Project / site** lives on the ticket (moved from the work log on 2026-09-25) and
  autocompletes from names already used.
- If *Tickets* is switched off in Profile, the nav item disappears, `/tickets`
  redirects to `/work-logs`, and the editor hides the Tickets section.

### 5.3 Tracker

One board for four kinds of entry, chosen from one form (`EntryKind`):

| Kind | Addressed to | Dated | Answers |
|---|---|---|---|
| Follow-up | a person (required) | next nudge | "What did I tell whom, and when?" |
| Task | you | due date | "What do I owe?" |
| Note | you | never | "What did I want to keep?" |
| Idea | you | never | "What do I want to try?" |

- Each entry has a subject, optional ticket key, optional date, status Open/Done, and
  can be **pinned as Important**.
- What was said lives in **append-only** updates (`note` + channel: Slack, Email,
  Call, Meeting, Teams, In person, Other + `occurredAt`, back-datable). There is no
  action to edit or delete a single update. A whole entry can be deleted.
- Groups, top to bottom: **Important → Overdue → Today → Upcoming → No date →
  Notes & ideas → Done** (collapsed). "Today" is the browser's local day.
- Filter by kind and search. People previously used are suggested.

> Naming: the models are still `FollowUp` / `FollowUpUpdate` and the files
> `follow-ups.ts`. The UI and route say **Tracker**.

### 5.4 Notes

- OneNote-shaped notebooks: **Note → Sections → Pages**. Pages are TipTap rich-text
  documents (headings, lists, tables, highlights, alignment, syntax-highlighted code
  blocks).
- Each note has a title, description, an icon (searchable react-icons: Simple Icons,
  Lucide, Font Awesome 6) and an accent colour derived from the icon (brand colour
  when known).
- Favourite notes sort to the top. Deleting moves a note to trash (`deletedAt`);
  notes can be restored.

### 5.5 Resources

- A personal library with ten types: Website, App, Link, Documentation, Command,
  Snippet, Reference, Tool, Learning, Other. Each has a title, description, optional
  URL, content (commands/snippets render monospace) and tags.
- Grouped by type, searchable, and each resource can be **favourited**, **edited**
  (pencil on every card/row → the same form, prefilled) or deleted.
- In the add/edit form, **Resource type** is a searchable dropdown (type "doc" →
  Documentation) and **Tags** is a search-as-you-type chip field that suggests tags
  already used (most used first). Enter or a comma adds a new tag; tags are stored
  lowercase without "#", spaces become dashes.

### 5.6 Favourites

Aggregates, with jump links: favourite **notes**, favourite **resources**, and
**Important** (pinned, open) **tracker** entries.

### 5.7 Profile

- Display name (email is read-only).
- **Sprint calendar:** start date and length (1, 2, 3 or 4 weeks) with a live preview
  of the current sprint. Default: 14-day sprints anchored on 2 Sep 2026.
- **Tickets on/off:** whether ticket tracking exists for this user (see §5.2).

## 6. Non-functional requirements

- **User isolation:** every query scoped by `userId` taken from the session, never
  from the client.
- **Security:** bcrypt (cost 12) passwords; constant-time login (dummy-hash compare)
  to prevent email enumeration; Zod validation on every mutation server-side; secrets
  only in env; uploaded files served with `nosniff` and only safe types inline.
- **Responsive:** 360 / 768 / 1024 / 1440. No horizontal page scroll.
- **Accessibility:** visible labels, keyboard operable, focus-visible rings, 3:1
  control boundaries, 4.5:1 text, `prefers-reduced-motion` respected.
- **Theme:** light only (the theme toggle was removed; see `Memory.md`).
- **Hosting:** self-host locally (Docker Postgres) or Vercel + Neon.

## 7. Out of scope (don't build, don't promise)

AI summaries; Jira / GitHub / Slack / Calendar integrations; PDF/Markdown export;
emailed reports; team workspaces; sharing; global search (not built yet);
dark mode (removed).

## 8. Open questions / next candidates

- Reports route (sprint summaries from work logs + ticket history) — placeholder only.
- Should standalone `/tasks` and `/links` be removed now that Tracker tasks and
  Resources cover them?
- Global search across logs, tickets, notes, resources.
