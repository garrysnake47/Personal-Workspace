# Memory — WorkNest

> Project memory for humans and agents: the current state, decisions already made
> (with the *why*), gotchas that cost time before, and a changelog. Newest first in
> every section. Update rules are in `AGENTS.md` §2.
>
> Last synced with the codebase: **2026-09-29**

---

## Current state (snapshot)

- **Branch:** `setup/vercel-deploy-notes`. Last commit `9a9d6a7` (2026-09-25). A large
  body of work since then is **uncommitted** in the working tree: day types, learning
  notes, attachments, Idea/Important in Tracker, Profile settings, Favourites, the
  dashboard retirement, light-only theme, Geist font, and the removal of the old
  agent tooling. Typecheck passes (2026-09-29).
- **Repo:** https://github.com/garrysnake47/Personal-Workspace (public, `main`).
- **Live features:** homepage, auth, Work Logs, Tickets (toggleable), Tracker (landing
  page), Notes, Resources, Favourites, Profile. Coming soon: Tasks, Reports, Links,
  Settings. Details in `PRD.md` §4.
- **Hosting:** prepared for Vercel (root dir `app`) + Neon; deploy steps are the
  owner's to run (see `skills.md` → Deploy).

## Decisions

Format: **date — decision.** Why. *Rejected:* alternatives.

**2026-09-29 — One-command setup: `npm run dev` on a fresh clone does everything.**
`scripts/setup.mjs` (zero deps, runs before `npm install`) is idempotent and runs on
every `npm run dev`, so pulling new migrations or a changed lockfile self-heals. It
seeds **only when the `User` table is empty** because `seed.ts` deletes all users.
The seed's email became `SEED_EMAIL` (setup writes `demo@worknest.local`) so the
public README doesn't publish the owner's address; unset, it still falls back to the
owner's email so the existing `app/.env` behaves as before. Verified on an isolated
fresh copy (separate container/port): 22 s to a seeded DB, sign-in works, re-run skips
everything. *Rejected:* a shell script (not portable to Windows), `prisma migrate dev`
in setup (can prompt/create migrations), auto-seeding a non-empty DB.

**2026-09-29 — Tracker: colour on labels, not on surfaces.** The owner found the
pastel group headers/borders (each tone mixed 10–40% into white) and the teal-tinted
quick-capture bar unattractive. Cards, headers and borders are now neutral; tones stay
on icon tiles, date chips and kind chips. Chip text is deepened with 20% ink because
the red/amber/green tones measured 4.1–4.4:1 on their own tint.

**2026-09-29 — Resources keeps a distinct colour per type.** The layout pass had put
all 10 types on the single teal accent (taste skill "one accent"); the owner preferred
the colour coding and it was restored the same day. The one-accent rule covers UI
chrome only — see Design-System.md §10 rule 1a.

**2026-09-29 — Layout polish pass against taste-skill, ui-ux-pro-max, Vercel
guidelines and Linear's DESIGN.md.** Targeted fixes, not a redesign (redesign skill:
"improve what's there"): palette and fonts kept (Geist + Geist Mono is the taste
skill's own recommended pairing). Dials for the app: variance 5, motion 4, density 7.
Changes: 64px single-line nav; page titles 24→30px / 600 (were 30→36px / 750);
per-level heading tracking; 42 dead `sm:` classes → `md:`; `window.confirm` →
`ConfirmationDialog`; `…` not `...`;
meeting-tab indicator moves by transform. *Rejected:* ui-ux-pro-max's generated system
(Caveat/Quicksand, storytelling pattern, zinc+blue — built for marketing pages);
Phosphor instead of Lucide (taste suggestion, but a swap across every screen for no
functional gain); noise/grain textures (wrong for a dense tool).

**2026-09-29 — Palette switcher tried and removed; the teal/navy/charcoal palette stays.**
Two alternative palettes were trialled the same day under a Profile → "Website
settings" section — **Harbor** (cream `#f2f2ec`, indigo `#2a2548`, sky `#5aa8c4`,
graphite `#57575a`, mustard `#ecbb55`, sage `#bbbda8`) and **Blossom** (blush
`#fff7f6`, ink `#26262f`, coral `#e56a67`, green `#3d8250`, yellow `#f2cf45`, dusty pink
`#e0d6d7`) — as inline `--c-*` overrides on `.app-shell` chosen via a `wn-palette`
cookie. The owner chose to keep the original, and all of it (switcher, section,
cookie handling) was removed. If palettes come back, that token-override approach
worked cleanly; Harbor's sky blue needed deepening to `#2f7f9c` for white button text.
A browser that tried it may still hold a harmless, ignored `wn-palette` cookie.

**2026-09-29 — MUI popups portal into the open dialog.** Dropdowns inside `Modal`
were invisible: MUI portals to `<body>`, below the top-layer `<dialog>`. Theme
defaults in `mui-provider.tsx` now portal `MuiPopper`/`MuiPopover` into the open
`dialog:modal` (fixed strategy so it isn't clipped). Consequence: `Modal`'s backdrop
close now also requires the pointer *press* to start on the backdrop (see Gotchas).
*Rejected:* `disablePortal` per field (lists clipped by the dialog's overflow) and
swapping native `<dialog>` for MUI Dialog (loses the platform focus trap/Escape).

**2026-09-29 — Resources are editable; type + tags are searchable.** Edit reuses the
add form prefilled (`updateResource` already existed). Type is a searchable
Autocomplete; tags use the new `TagInput`, suggesting the user's existing tags
(derived client-side from the loaded resources, no extra request). Tags normalise to
lowercase so "AWS" and "#aws" don't fork.

**2026-09-29 — Project docs consolidated into six root files.** The old `memory/`
folder, `agents/` role files, `.claude/` / `.codex/` / `.agents/` skill bundles,
`app/PRODUCT.md`, `app/DESIGN.md`, `office/` monitor and `skills-lock.json` were
removed by the owner. Replaced by `PRD.md`, `Design-System.md`, `Architecture.md`,
`AGENTS.md` (+ `CLAUDE.md` → `@AGENTS.md`), `Memory.md`, `skills.md`, rebuilt from the
current code. Where old notes disagreed with the code, the code won.

**2026-09-28 — Geist is the app UI face.** Crisp neo-grotesk with real Medium/SemiBold
steps keeps hierarchy at dense 13–14px. Geist Mono for IDs/timestamps/code. Plus
Jakarta Sans stays for public pages only. *Rejected:* keeping Plus Jakarta everywhere.

**2026-09 (late) — Light only; theme toggle removed.** `theme-provider`, `theme-toggle`,
`theme.ts` and the homepage toggle were deleted; viewport is `colorScheme: light`.
Dark token blocks remain in CSS but are dormant. Reintroducing dark mode is a
deliberate project, not a toggle flip.

**2026-09-25 — Dashboard retired; Tracker is home.** `/dashboard` redirects to
`/tracker`; login and signed-in `/login` land on `/tracker`. `lib/dashboard.ts` and
the dashboard card motion were deleted. The Tracker is the thing you check first.

**2026-09-25 — Profile settings are per user.** Sprint start date + length (7/14/21/28)
and a `ticketsEnabled` switch live on `User`. Turning tickets off hides the nav item,
redirects `/tickets`, and hides the editor's Tickets section — data is kept.
Sprint maths take the user's `SprintConfig`; default anchor 2026-09-02, 14 days.

**2026-09-25 — Favourites page.** Aggregates favourite notes, favourite resources
(new `Resource.favorite`) and pinned open Tracker entries. *Rejected:* a generic
polymorphic favourites table — each area already had (or needed) its own flag.

**2026-09-25 — Tracker gets `Idea` kind and `pinned` (shown as "Important").**
Important items form their own group at the top and appear in Favourites.

**2026-09-25 — Work logs gain learning notes and attachments.** `learningNotes`
(Markdown) on `WorkLog`; `WorkLogAttachment` (File | Link). Files are stored in
Postgres (`bytea`, ≤10 MB, ≤10 per upload) so they survive serverless hosting; uploads
use a route handler because server actions cap bodies at 1 MB. `data` is never
selected in list queries. *Rejected:* filesystem storage (lost on Vercel), blob
storage (extra service for a single user).

**2026-09-25 — Work logs have a `dayType` (Work / Holiday / Leave).** Days off account
for the day without meetings/tickets, render hatched in the sprint list, and are
excluded from the ticket journey.

**2026-09-25 — Project / site moved from WorkLog to Ticket.** A project belongs to the
work item, not the day. The migration copied each ticket's most recent log project.
`ProjectInput` autocompletes from the user's existing names. *Supersedes* the
2026-09-23 "work logs carry projectName" decision.

**2026-09-24 — Workspace palette: teal / navy / charcoal (user-supplied).** White page,
white cards with teal-shade borders, tinted fills only for emphasis, navy chrome.
Scoped to `.app-shell` so homepage/auth keep their looks.

**2026-09-24 — MUI for form fields.** Input, Select, Textarea and Autocomplete use MUI,
themed with CSS tokens, in `@layer mui` so Tailwind utilities still win. Ticket search
is a freeSolo Autocomplete. Tiny inline micro-controls stay custom.

**2026-09-24 — Hosting: Vercel + Neon; migrations from a laptop.** Vercel root `app`,
pooled URL at runtime, `db:hosted` runs `migrate deploy` against the direct URL.
Seeds read `SEED_PASSWORD` — never hardcode credentials (public repo).

**2026-09-23 — Standalone ticket updates are a separate, deletable history.**
`/tickets` body updates create `TicketHistoryEntry` rows (status snapshot); they can be
deleted with confirmation. `TicketWorkUpdate` rows are never touched from `/tickets`.
Title/status edits only change the `Ticket` row. *Rejected:* reusing
`saveTicketWorkUpdate` (needs a log id, could overwrite that day's draft); a delete on
every timeline row (would let the page erase work-log history).

**2026-09-23 — Ticket details require an explicit selection.** No auto-selecting the
first ticket; the detail panel loads only after a choice.

**2026-09-19/20 — Homepage is "The Quiet Studio".** Photo-led editorial page with
matched light/dark photo pairs, a 4-link workspace index right after the hero, no
floating product cards. Earlier commit-graph and banner designs remain in source,
unmounted.

**2026-09-14 — Tracker kinds share one table.** Follow-ups, tasks, notes (and later
ideas) share a spine: subject, optional date, append-only record. Wording per kind
lives in `KIND_META`. Models stay named `FollowUp`/`FollowUpUpdate` — a rename is a
migration nobody needs.

**2026-09-14 — Pill nav replaces the sidebar.** Top floating nav matches the
homepage; no collapsed-rail cookie.

**2026-09-14 — Notes are notebooks (Note → Section → Page, TipTap JSON).** Ported from
the Nexa project; notes carry no body themselves.

**2026-09-13 — Five-stage ticket workflow.** In Progress → Sent to QA → Ready for
Production → Released → Done. Legacy statuses stay in the enum for old rows and are
normalised on read (`lib/workflow-status.ts`).

**2026-09-12 — Append-only ticket history enforced structurally.**
`@@unique([ticketId, workLogId])` + upsert: same log = in-place autosave, new log = new
row. No path can clobber yesterday's entry or duplicate on autosave.

**2026-09-12 — Stack.** Next.js App Router + TS + Tailwind 4, Postgres 16 in Docker,
Prisma, Auth.js v5 credentials + bcrypt, Zod. No automated test suite — verification
is done on the real rendered app.

## Gotchas

- **Tracker = `FollowUp`.** Looking for a `Tracker` model? It's `FollowUp` /
  `FollowUpUpdate` in `lib/follow-ups.ts` and `actions/follow-ups.ts`.
- **`--c-sidebar-*` means navy chrome**, not a sidebar (there isn't one).
- **No `sm:` / `2xl:` breakpoints.** Only `xs md lg xl`.
- **`Menu` must not close on `button[type=submit]`** — closing unmounts the
  `<form action>` before it submits.
- **Clicks inside a dialog can target the dialog itself.** If a press and release
  land on different elements (press a Select, release on its menu option), the
  browser fires `click` on their common ancestor — now the `<dialog>`, since menus
  portal into it. That looked like a backdrop click and closed the popup; `Modal`
  therefore tracks where the pointer press started.
- **MUI 9 freeSolo Autocomplete:** Enter commits the *typed* text even when an
  option is auto-highlighted. Use click or ↓+Enter to pick; don't rely on
  `autoHighlight` in freeSolo fields.
- **`sm:` classes do nothing here** (breakpoints are `xs md lg xl`) — they fail
  silently. 42 of them (Profile, Favourites, Notes editor, ticket card) were converted
  to `md:` on 2026-09-29; e.g. the Notes editor toolbar had been hidden on desktop.
  Grep for `sm:` after adding UI.
- **The nav is 64px (4rem).** `.tickets-board` height and sticky asides (`top-20`) are
  computed from it — change them together.
- **Server actions cap bodies at 1 MB** — file uploads go through
  `/api/work-logs/[id]/attachments`.
- **`ProjectInput` has no module-level cache on purpose** — module state survives
  client-side sign-out/in and would leak one account's project names to the next.
- **`auth()` throws on an undecryptable cookie** (e.g. after changing `AUTH_SECRET`).
  `getCurrentUser` treats it as signed out and `proxy.ts` clears the cookie.
- **Prisma 7:** URL lives in `prisma.config.ts`; the CLI doesn't auto-load `.env`
  (dotenv is imported there); the client is gitignored so `postinstall` must run
  `prisma generate`; a driver adapter (`@prisma/adapter-pg`) is required.
- **Dates:** `WorkLog.date` is UTC midnight; sprints and Tracker "today" are local
  days. Two copies of sprint maths once disagreed by a day — only use `getSprint`.
- **Postgres is on host port 5434** (5432/5433 are used by other projects).
- **LAN dev origin** `192.168.31.130` is hard-coded in `next.config.ts` for testing
  from another device; update it if the IP changes.
- **Default meeting cards** (ASU / Veritech / Client Sync-up / Others) are hard-coded
  in `lib/worklogs.ts`.
- **Seed scripts** default to the owner's account (`DEFAULT_EMAIL` in each script) and
  some replace that account's data — ask first.
- **`next dev` may re-create `app/AGENTS.md`** with a Next.js "read the docs" block.
  That's harmless; the guidance is already in the root `AGENTS.md`.
- **Legacy code** in `components/marketing/` and `components/banner/` is unmounted —
  don't fix bugs there thinking they're live.

## Changelog

`YYYY-MM-DD — what changed — key files`

- 2026-09-29 — README with one-command setup (`npm run dev` / `npm run setup`), `SEED_EMAIL`, app/README points to root; fixed root `npm run typecheck` (ran tsc from the repo root with no tsconfig, printing help) — `README.md`, `scripts/setup.mjs`, `package.json`, `app/.env.example`, `app/prisma/seed.ts`, `app/README.md`
- 2026-09-29 — Tracker: neutral group cards/headers and quick-capture bar, quieter chips with AA text — `tracker/tracker-board.tsx`
- 2026-09-29 — Restored per-type colours on Resources — `resources/resource-library.tsx`

- 2026-09-29 — Layout polish: single-line 64px nav, calmer page titles, heading tracking, `sm:`→`md:` fixes, confirm dialogs, day-type toggle fits on phones, transform-based tab indicator; installed design skills — `shell/app-nav.tsx`, `shell/page-header.tsx`, `globals.css`, `resources/resource-library.tsx`, `work-log/meeting-section.tsx`, `work-log/day-type-toggle.tsx`, notes/profile/favourites files, `.claude/skills/`

- 2026-09-29 — Removed the palette switcher and Website settings section; original palette only — `actions/profile.ts`, `lib/validation.ts`, `(app)/layout.tsx`, `(app)/profile/page.tsx`, `shell/app-shell.tsx`, `profile/profile-form.tsx` (deleted `components/theme/`, `profile/website-settings.tsx`)
- 2026-09-29 — Trialled a palette switch (Harbor / Blossom) under Profile → Website settings; MUI popups outside dialogs now portal into `.app-shell` (kept) — `ui/mui-provider.tsx`

- 2026-09-29 — Fixed invisible MUI dropdowns inside popups (Resources type, Tracker "Where") and the resulting backdrop false-close — `components/ui/mui-provider.tsx`, `components/ui/modal.tsx`
- 2026-09-29 — Resources: edit button + prefilled edit form, searchable type dropdown, `TagInput` tag autocomplete — `components/resources/resource-library.tsx`, `components/ui/tag-input.tsx`
- 2026-09-29 — Added 6 AI/design resources (Taste Skill, MCP Market, Web Design Guidelines, Awesome DESIGN.md, UI Skills, Context7) to the sahiltari36 account in the local DB — data only

- 2026-09-29 — Created PRD.md, Design-System.md, Architecture.md, AGENTS.md (+ CLAUDE.md import), Memory.md, skills.md from the current codebase — repo root
- 2026-09-28 — App UI font switched to Geist / Geist Mono — `src/app/layout.tsx`, `globals.css`
- 2026-09-25→28 — Theme toggle removed (light only); dashboard retired → `/tracker`; Favourites page; Profile settings (sprint, tickets toggle); resource favourites; Tracker Idea + Important; work-log day type, learning notes, attachments; project name moved to tickets — `prisma/migrations/20260925*`, `actions/profile.ts`, `components/work-log/*`, `app/(app)/favourites`, `app/api/*`
- 2026-09-25 — `db:seed:sprint`, `db:seed:tracker`, `db:seed:workspace` added — `app/prisma/seed-*.ts`
- 2026-09-25 — Vercel/Neon deploy prep logged (`9a9d6a7`)
- 2026-09-24 — `db:hosted` helper for the hosted DB (`ee4ee09`); repo pushed to GitHub (`0f13d26`); seeds read `SEED_PASSWORD`
- 2026-09-23 — `/tickets` live with standalone history entries; work-log project name (later moved to tickets)
- 2026-09-19/20 — Homepage "Quiet Studio" redesign; auth pages diverged
- 2026-09-14 — Tracker, Notes notebooks, pill navigation
- 2026-09-11/12 — Initial schema, auth, work-log editor with append-only ticket updates
