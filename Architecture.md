# Architecture — WorkNest

> **How it's built.** Read this instead of re-scanning the repo. If you add, move or
> delete a module, route, model or script, update the relevant section in the same
> change.
>
> Last synced with the codebase: **2026-09-29**

---

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.3** (App Router, `src/` dir, alias `@/*`) | Breaking changes vs. older Next — read `app/node_modules/next/dist/docs/` before using an unfamiliar API. `middleware.ts` is now **`proxy.ts`**. Production build uses `next build --webpack`. |
| UI | **React 19.2**, TypeScript 5 | Server Components by default; `"use client"` only where needed. |
| Styling | **Tailwind CSS 4** (CSS-first, no `tailwind.config`) | All tokens in `src/app/globals.css` via `@theme inline`. |
| Form fields | **MUI 9** (`@mui/material`, `@mui/material-nextjs`) + Emotion | In `@layer mui` so Tailwind wins. |
| Rich text | **TipTap 3** (+ lowlight) | Notes pages (JSON) and work-log Markdown fields. |
| Motion | `motion` / `framer-motion`, GSAP (legacy banner) | |
| Icons | `lucide-react` (app), `react-icons` (note icons) | |
| Data | **PostgreSQL 16** + **Prisma 7.10** with `@prisma/adapter-pg` | Client generated to `src/generated/prisma` (gitignored). URL lives in `prisma.config.ts`, not the schema. |
| Auth | **Auth.js / NextAuth v5 beta** — Credentials provider, **JWT** sessions (30 days), `@auth/prisma-adapter`, `bcryptjs` (cost 12) | |
| Validation | **Zod 4** | Every mutation. |
| Toasts | `sonner` (wrapped in `components/ui/toast.tsx`) | |
| Dates | `date-fns` 4 | |
| Runtime | Node 24 | |

## 2. Repository layout

```
/                              repo root (git)
├── AGENTS.md  CLAUDE.md       agent instructions (CLAUDE.md imports AGENTS.md)
├── PRD.md  Design-System.md  Architecture.md  Memory.md  skills.md
├── .claude/skills/            project design skills (taste-skill ×2, ui-ux-pro-max)
├── README.md                  clone → `npm run dev` quick start
├── scripts/setup.mjs          one-command, idempotent local setup (zero deps)
├── package.json               root convenience scripts → delegate to app/
├── docker-compose.yml         Postgres 16, container workspace-db, host port 5434
└── app/                       the Next.js application
    ├── next.config.ts         image qualities [75,90]; LAN dev origin 192.168.31.130
    ├── prisma.config.ts       schema path, migrations dir, seed command, DATABASE_URL
    ├── components.json        shadcn config (utils alias → @/components/cn)
    ├── prisma/
    │   ├── schema.prisma      the data model (§5)
    │   ├── migrations/        14 migrations, init 2026-09-11 → profile_settings_favorites 2026-09-25
    │   └── seed*.ts           seed scripts (§8)
    ├── scripts/
    │   ├── hosted-db.mjs      migrate (+ optional seed) the hosted DB
    │   └── generate-banner-scene.py   one-off image generation helper
    ├── public/Images/         homepage photo pairs (portfolio/), legacy banner art
    └── src/
        ├── proxy.ts           route protection (§4)
        ├── app/               routes (§3)
        ├── actions/           "use server" — the client's entire API surface
        ├── lib/               server-only data + domain layer
        ├── components/        UI (see Design-System.md §8)
        └── generated/prisma/  generated client (never edit)
```

## 3. Routes

Route groups: `(marketing)` public homepage, `(auth)` login/register, `(app)`
authenticated shell.

| Path | File | Kind |
|---|---|---|
| `/` | `(marketing)/page.tsx` → `PortfolioHome` | public, static |
| `/banner` | `banner/page.tsx` → `PortfolioHome` | public |
| `/login`, `/register` | `(auth)/*/page.tsx` | public; redirect to `/tracker` if signed in |
| `/work-logs` | `(app)/work-logs/page.tsx` | sprint-grouped listing |
| `/work-logs/[workLogId]` | `.../page.tsx` | read-only detail + Copy as text |
| `/work-logs/[workLogId]/edit` | `.../edit/page.tsx` | `WorkLogEditor` |
| `/tickets` | `(app)/tickets/page.tsx` | `TicketBoard`; redirects to `/work-logs` if tickets disabled |
| `/tracker` | `(app)/tracker/page.tsx` | `TrackerBoard` — default landing after login |
| `/notes`, `/notes/new`, `/notes/[noteId]`, `/notes/[noteId]/edit` | `(app)/notes/**` | notebooks |
| `/resources` | `(app)/resources/page.tsx` | `ResourceLibrary` |
| `/favourites` | `(app)/favourites/page.tsx` | reads Prisma directly |
| `/profile` | `(app)/profile/page.tsx` | `ProfileForm` |
| `/dashboard` | `(app)/dashboard/page.tsx` | `redirect("/tracker")` (retired) |
| `/tasks`, `/reports`, `/links`, `/settings` | `(app)/*/page.tsx` | `ComingSoonPage` |
| `GET/POST /api/auth/[...nextauth]` | route handler | NextAuth |
| `POST /api/work-logs/[workLogId]/attachments` | route handler | multipart upload (field `files`) |
| `GET /api/attachments/[attachmentId]` | route handler | owner-only download |

`(app)/layout.tsx` runs `requireUser()` + `getUserSettings()` once, wraps children in
`MuiProvider` + `AppShell`, and passes `ticketsEnabled` to the nav.

## 4. Request lifecycle & layering

```
browser ──► proxy.ts ──► (app)/layout.tsx ──► page.tsx (Server Component)
            JWT check      requireUser()          reads via actions/* or lib/*
            (no DB)        getUserSettings()      │
                                                  ▼
            client component ──call──► actions/*.ts ("use server")
                                        1. requireUserId()         ← identity from session only
                                        2. parseOrFail(zodSchema)  ← lib/validation.ts
                                        3. lib/*.ts fn(userId, …)  ← every WHERE has userId
                                        4. revalidatePath(...)
                                        5. return ActionResult<T>  ← lib/result.ts
```

- **`proxy.ts`** uses the Prisma-free `lib/auth.config.ts` (`authorized` callback,
  `PUBLIC_ROUTES = ["/", "/login", "/register", "/banner"]` + `/api/auth/*`). It also
  **clears undecryptable session cookies** (e.g. after an `AUTH_SECRET` change) so a
  stale cookie can't loop forever.
- **`lib/auth.ts`** adds the Node-only pieces: Credentials provider, PrismaAdapter,
  bcrypt. Unknown emails are compared against a dummy hash (no enumeration).
- **`lib/session.ts`**: `getCurrentUser` (request-memoised; treats a bad cookie as
  signed out), `requireUser`, `requireUserId`. **Every action and query starts here.**
- **`lib/result.ts`**: `ActionResult<T> = {ok:true,data} | {ok:false,error:{code,message,fields?}}`;
  codes `VALIDATION_ERROR | UNAUTHORIZED | NOT_FOUND | CONFLICT | INTERNAL_ERROR`.
- **`lib/*`** files import `"server-only"`. `components/**` must not import them in
  client components — client-safe constants live in components (e.g.
  `components/work-log/day-type.ts` mirrors the server defaults).
- `cn()` lives at `@/components/cn`, not in `lib/`.

### Server modules

| File | Owns |
|---|---|
| `lib/worklogs.ts` | work logs, meetings (4 defaults), learning notes, attachments, days off, UTC-date helpers, `touchWorkLog` |
| `lib/tickets.ts` | **the critical piece** — ticket lookup/upsert, `addTicketWorkUpdate` (upsert on `(ticketId, workLogId)`), detach, standalone history, project names |
| `lib/workflow-status.ts` | 5-stage workflow + legacy status normalisation |
| `lib/follow-ups.ts` | Tracker entries + append-only updates, pin, status, reschedule |
| `lib/note-store.ts`, `lib/notes.ts`, `lib/note-icons.ts`, `lib/note-colors.ts` | notebooks, trash/restore, icon search, accent colours |
| `lib/content.ts` | tasks, links, resources (+ favourite) |
| `lib/sprint.ts` | **the only** sprint arithmetic (`getSprint`) — local calendar days |
| `lib/user-settings.ts` | profile settings (name, sprint config, `ticketsEnabled`), request-memoised |
| `lib/validation.ts` | all Zod schemas |
| `lib/prisma.ts` | Prisma client singleton with the pg adapter |

| Actions file | Exposes |
|---|---|
| `actions/auth.ts` | `register`, `login` (→ `/tracker`), `logout` (→ `/login`) |
| `actions/worklog.ts` | open today/by date, get, adjacent, list, update, delete, meetings CRUD, learning notes, link attachments, delete attachment |
| `actions/tickets.ts` | find, upsert-for-work-log, save work update, detach, get, list, projects, active, update, append/delete history entry, delete ticket |
| `actions/follow-ups.ts` | create, add update, pin, status, reschedule, delete, list, people |
| `actions/notes.ts` | create, update, delete (trash), restore, toggle favourite |
| `actions/content.ts` | tasks, links, resources CRUD + `toggleResourceFavorite` |
| `actions/profile.ts` | `updateProfile` |

Client-safe shared modules outside `lib/`: `components/work-log/day-type.ts`,
`components/cn.ts`.

## 5. Data model (`app/prisma/schema.prisma`)

Every domain table has `userId` → `User` with `onDelete: Cascade`, and indexes led by
`userId`.

```
User ─┬─ WorkLog ─┬─ Meeting
      │           ├─ WorkLogAttachment (File bytes | Link)
      │           └─ TicketWorkUpdate ─┐
      ├─ Ticket ──┬────────────────────┘   @@unique([ticketId, workLogId])
      │           ├─ TicketHistoryEntry     (standalone, deletable)
      │           └─ Task (optional FK)
      ├─ FollowUp ── FollowUpUpdate          (Tracker; append-only)
      ├─ Note ── NoteSection ── NotePage     (TipTap JSON)
      ├─ Resource   ├─ Link   ├─ Task
      └─ Account / Session (Auth.js)         VerificationToken
```

| Model | Key fields & invariants |
|---|---|
| `User` | `email` unique, `passwordHash`, profile: `sprintStartDate` (`@db.Date`, null = default), `sprintLengthDays` (14), `ticketsEnabled` (true) |
| `WorkLog` | `date` `@db.Date` stored as UTC midnight, **`@@unique([userId, date])`**; `title`, `dayType` (Work/Holiday/Leave), `learningNotes` (Markdown) |
| `Meeting` | `name`, `notes` (Markdown), `order`, `isDefault` |
| `WorkLogAttachment` | `kind` File/Link, `name`, `url?`, `mimeType?`, `size?`, `data Bytes?` (≤10 MB). **`data` is never selected in lists** — only the download route reads it. |
| `Ticket` | `ticketId` = human key, **`@@unique([userId, ticketId])`**; `title`, `projectName?`, `status` |
| `TicketWorkUpdate` | one per (ticket, work log): `description`, `status` snapshot. **Append-only history.** |
| `TicketHistoryEntry` | `body`, `status` snapshot; written from `/tickets`; may be deleted |
| `FollowUp` | `kind` (FollowUp/Task/Note/Idea), `person?` (FollowUp only), `subject`, `ticketKey?` (free text, not FK), `status` Open/Done, `pinned`, `dueDate?` |
| `FollowUpUpdate` | `note`, `channel`, `occurredAt`. **Never updated in place.** |
| `Note` / `NoteSection` / `NotePage` | icon (`iconName`, `iconLibrary` si/lu/fa6), `favorite`, `deletedAt` (trash); sections & pages ordered by `order`; page `content Json` |
| `Resource` | `type` (10 values), `url?`, `content`, `tags[]`, `favorite` |
| `Task`, `Link` | exist with actions; no UI yet |

**Enums:** `DayType`, `AttachmentKind`, `TicketStatus` (11 values, 5 used for new
writes), `TaskPriority`, `TaskStatus`, `FollowUpChannel`, `FollowUpStatus`,
`EntryKind`, `ResourceType`.

## 6. Critical invariants

1. **User isolation.** Every read/write filters by the session `userId`. Ownership is
   checked before creating child rows (`assertWorkLogOwned`, `assertTicketOwned`,
   `findFirst({ id, userId })`). Use `updateMany`/`deleteMany` with `userId` in the
   WHERE for single-row mutations.
2. **Append-only ticket history.** All work-update writes go through
   `prisma.ticketWorkUpdate.upsert` keyed on `(ticketId, workLogId)`:
   same log → in-place (autosave-safe), different log → new row. No code path may
   update "the latest update" or blind-create.
3. **Ticket status follows the newest update**; detaching recomputes it.
4. **Tracker updates are append-only** — no edit/delete action exists for a
   `FollowUpUpdate`; a first note is created as an update row, not a field.
5. **Dates:** `WorkLog.date` is UTC midnight (`toDateOnly`, `todayUtc`). Sprint maths
   and "today" in the Tracker use **local** calendar days (`lib/sprint.ts`; the board
   corrects to the browser clock after hydration via `useSyncExternalStore`).
   Dates cross the server→client boundary as ISO strings.
6. **Get-or-create races** are handled by the unique index: on `P2002`, re-read the
   winner's row.
7. **Uploads use route handlers**, not server actions (actions cap bodies at 1 MB).
   Downloads: owner-only, safe types inline (png/jpeg/gif/webp/pdf/txt), everything else
   forced to download, `X-Content-Type-Options: nosniff`, `Cache-Control: private, no-store`.

## 7. Environment

`app/.env` (gitignored; template `app/.env.example`):

| Var | Purpose |
|---|---|
| `DATABASE_URL` | `postgresql://workspace:workspace@localhost:5434/workspace?schema=public` locally; pooled Neon URL on Vercel |
| `AUTH_SECRET` | Auth.js secret (`npx auth secret`) |
| `AUTH_TRUST_HOST` | `true` |
| `SEED_EMAIL` | email of the account `db:seed` creates; setup writes `demo@worknest.local` (unset → falls back to the owner's email) |
| `SEED_PASSWORD` | password seeds give the demo account (8+ chars); setup generates one |
| `HOSTED_DATABASE_URL` | Neon **direct/unpooled** URL for `npm run db:hosted` |

`app/.env.vercel` (gitignored) holds values to paste into Vercel. Never commit real
env files; the GitHub repo is public.

## 8. Scripts

Root (`/package.json`, `engines.node >=20.9`):
`setup` (`scripts/setup.mjs`: check Node + Docker → create `app/.env` with generated
`AUTH_SECRET`/`SEED_PASSWORD` if missing → `npm ci` if `node_modules` missing or the
lock changed → `docker compose up -d --wait` → `prisma migrate deploy` → `db:seed`
**only when the `User` table is empty**; every step is idempotent), `dev` (runs `setup`
then app dev), `build`, `start`, `lint`, `typecheck`,
`install:app`, `db:up`, `db:down`, `db:seed`, `db:studio`, `db:migrate`.

App (`/app/package.json`):

| Script | Does |
|---|---|
| `dev` / `build` / `start` / `lint` | Next + ESLint |
| `postinstall` | `prisma generate` (required — client is gitignored) |
| `db:migrate` / `db:reset` / `db:studio` | Prisma |
| `db:seed` | `prisma/seed.ts` — demo user + multi-entry ticket history |
| `db:seed:bulk`, `db:seed:fill`, `db:seed:notes` | older bulk/fill/notes seeds |
| `db:seed:sprint [-- email]` | reset one account's content; fill current sprint with work logs + tickets |
| `db:seed:tracker [-- email]` | replace one account's Tracker entries with a realistic mix |
| `db:seed:workspace [-- email]` | fill one account's Notes + Resources with study content (re-runnable) |
| `db:hosted [-- --seed]` | `prisma migrate deploy` (+ seed, which wipes users) against `HOSTED_DATABASE_URL` |

## 9. Deployment

- **Local:** `npm run dev` from the root (Docker Postgres on 5434 + Next on 3000). The
  dev server also accepts the LAN origin `192.168.31.130` (for testing from another
  device) — update `next.config.ts` if the LAN IP changes.
- **Hosted:** Vercel with **Root Directory = `app`** + Neon Postgres. Vercel env:
  `DATABASE_URL` (pooled), `AUTH_SECRET`, `AUTH_TRUST_HOST=true`. `postinstall`
  generates the client. Migrations are **not** run in the Vercel build — run
  `npm --prefix app run db:hosted` from a laptop against the direct URL.
- Attachments live in Postgres, so they survive serverless hosting.

## 10. Legacy / dormant code

- `components/marketing/*`, `components/banner/*` — earlier homepage designs, not
  mounted. `.marketing-document` and `.force-light` CSS belong to them.
- `.dark` token blocks, `--pf-*` night values — dormant (no theme toggle).
- `Task` / `Link` models + actions — no UI (routes are Coming Soon).
- `TicketStatus` legacy enum values — kept for historical rows; normalised on read.
