# Codebase Map

> Read this instead of re-scanning the repo. Keep it accurate.
> **Repo root** = `/Users/sahiltari/Work/Claude/Personal Workspace`. The Next.js app lives in `app/`.
> Paths below are relative to repo root.

## Structure
```
agents/              role definitions (shared Claude + Codex)
memory/              shared memory — project.md, spec.md, map.md, design.md, decisions.md, worklog.md
.claude/skills/      ui-ux-pro-max skill bundle (.codex/skills symlinks here)
docker-compose.yml   Postgres 16 on host port 5434
office/              Agent Office — live monitor of the agent team (zero-dep Node server + static page)
  server.mjs         reads ~/.claude/projects/<slugged-cwd>/*/subagents/*.{meta.json,jsonl}; serves /api/state
  index.html         2D office floor drawn as one inline SVG (viewBox 1280x880): walls, windows,
                     whiteboard, plants; one workstation per role with monitor, desk, keyboard,
                     chair and a seated character. Side rail: desk detail, activity feed, worklog.
app/                 Next.js 16 + React 19 + TS + Tailwind 4, App Router, src/ dir, alias @/*
  next.config.ts     LAN dev origin allowlist for 192.168.31.130 + matching Server Action origin
  prisma.config.ts   Prisma 7 config — schema path, migrations dir, seed cmd, DATABASE_URL
  prisma/schema.prisma  the data model
  prisma/migrations/    init + additive ticket workflow status migration (applied)
  prisma/seed.ts        demo user + multi-entry ticket history  (npm run db:seed)
  src/app/           routes
  src/app/globals.css  DESIGN TOKENS — all of them. Tailwind v4 @theme. See below.
  src/app/layout.tsx   root layout; owns <html> class (dark mode) + next/font vars
  src/app/api/auth/[...nextauth]/route.ts  NextAuth handlers (GET/POST)
  src/proxy.ts       ROUTE PROTECTION. Next 16 renamed middleware.ts -> proxy.ts
  src/lib/follow-ups.ts  FOLLOW-UPS data layer — append-only FollowUpUpdate, same rule as tickets
  src/lib/           server-side data + auth layer (see "Server layer" below)
  src/actions/       "use server" actions — the frontend's entire API surface
  src/generated/prisma/  generated Prisma client (gitignored; `npm run postinstall`)
  .env               DATABASE_URL, AUTH_SECRET  (gitignored)
  .env.example       committed template
```

## Design tokens — `app/src/app/globals.css`
Single file, no `tailwind.config`. Spec + reasoning live in `memory/design.md`.
- Two layers: raw `--c-*` on `:root` / `.dark`, mapped into Tailwind via `@theme inline`.
- **Dark mode = `class="dark"` on `<html>`.** `@custom-variant dark` is declared there.
  No `prefers-color-scheme` media query — frontend dev owns the toggle + pre-hydration script.
- Color utilities: `bg-bg|surface|surface-2|surface-3`, `text-text|text-muted|text-subtle`,
  `border-border|border-strong`, `primary*`, `danger|success|warning|info` (+`-fg`/`-subtle`),
  `status-{open,progress,blocked,waiting,testing,completed,closed}` (+`-bg`/`-fg`),
  `priority-{low,medium,high,urgent}` (+`-bg`), `ring`.
- Type scale overridden: `text-base` = **14px**, extra `text-2xs` (11) and `text-md` (15).
- **Marketing display sizes** `text-6xl` (44) / `text-7xl` (52) / `text-8xl` (60) — added for the
  public homepage only; the app UI still stops at `text-4xl`.
- **`.force-light`** is DEAD. It still exists in `globals.css` and `(auth)/auth-motion.css`,
  but nothing applies it any more — auth and marketing inherit the shared dark theme
  (verified 2026-09-14: `document.querySelector('.force-light') === null` on /login).
- Breakpoints reset to exactly four: `xs` 360 / `md` 768 / `lg` 1024 / `xl` 1440.
  **`sm:` and `2xl:` no longer exist** — deliberate.
- Global `:focus-visible` ring (2px `--c-ring`, 2px offset) + `prefers-reduced-motion` reset.
- **Form controls are centralised.** `components/ui/{input,select,textarea}` share `inputBase`:
  `rounded-md` + `border-border` on `bg-surface`, 36px tall. Do **not** re-patch
  `border-border-strong bg-surface` at a call site — the border ships with the primitive.
  `Button` matches: `rounded-md`, sizes xs 28 / sm 32 / md 36 / lg 40 (default **md**),
  variants primary / subtle / secondary / outline / ghost / danger, plus `block`.
  Control edges use `border-border-strong`, never `border-border` — a boundary
  must clear 3:1 (SC 1.4.11) and `--c-border` is 1.23:1 on white.
  The focus ring must never set `border-radius` — that reshapes the control itself.
- **Fonts: done.** `layout.tsx` loads `Plus Jakarta Sans` -> `--font-jakarta` and
  `JetBrains_Mono` -> `--font-jetbrains-mono` via `next/font/google`, both vars on `<html>`.
  (Until 2026-09-14 `--font-sans` named "Manrope" with nothing loading it, so the app
  rendered in the system fallback. If you change the face, change BOTH files.)
- **Dark mode: done.** Choice persisted in `localStorage["pw-theme"]` (light|dark|system),
  applied pre-paint by the inline script in `<head>` (`components/theme/theme.ts`).
  Sidebar collapse persists separately in the `pw-sidebar` **cookie**, so the server
  renders the right rail width on the first paint.

## Agent Office — `office/`
Live view of the agent team at `http://localhost:4600` (`node office/server.mjs`, Node 24, no deps).
- Truth comes from Claude Code's own transcripts: each background subagent writes
  `<session>/subagents/agent-<id>.jsonl` plus a `.meta.json` (`agentType`, `description`, `toolUseId`).
- Role is matched from `subagent_type`, else from `You are the **Role**` in the launch prompt —
  background agents usually launch as `general-purpose`, so the prompt is the real signal.
- `working` = transcript mtime < 90s old; otherwise `done`. Desk shows last tool call rendered as
  plain English, turn count, and files written/edited.
- `GET /api/state` returns the whole state; the page polls it every 2s and re-renders the SVG.
- Reading the floor: **green pulsing desk LED + typing arms + blinking caret** = working now;
  **blue ✓ on the shoulder** = task finished; **empty chair, dim screen** = no task assigned.
  The monitor on each desk shows that agent's task and current action. Click a station to pin
  its full detail (turns, files touched) in the side rail.
- Character colors live in the `LOOK` map in `index.html`, one shirt color per role.
- Read-only. It never writes to the project or to the transcripts.

## Infrastructure
- **Postgres:** `docker compose up -d` from repo root. Container `workspace-db`, host port **5434**
  (5432 and 5433 are taken by other projects on this machine).
  `postgresql://workspace:workspace@localhost:5434/workspace`
- **Dev server:** `cd app && npm run dev`

- **npm scripts (app/):** `dev`, `build`, `db:migrate`, `db:seed`, `db:studio`, `db:reset`,
  `postinstall` (= `prisma generate` — required, the client is gitignored).

## Installed deps
prisma **7.10.0** + @prisma/client 7.10.0 + **@prisma/adapter-pg** (Prisma 7 needs a driver adapter),
next-auth@beta (v5), @auth/prisma-adapter, bcryptjs, zod, server-only,
date-fns, clsx, tailwind-merge, class-variance-authority, lucide-react, sonner
dev: @types/bcryptjs, tsx, dotenv (Prisma 7 CLI no longer auto-loads .env)

## Components
All under `app/src/components/`. Paths below are relative to that.
**`cn.ts` lives here, not in `src/lib/`** — `src/lib/**` is backend-owned. Import `@/components/cn`.

### Theme (class-based dark mode, no media query)
| Component | Path | What it does |
|---|---|---|
| `THEME_INIT_SCRIPT` | `theme/theme.ts` | Inline pre-hydration script string + `THEME_STORAGE_KEY` (`pw-theme`) + `Theme` type. Applies the stored choice (or the OS preference) to `<html>` before first paint — no flash. Injected in `app/layout.tsx` `<head>`. |
| `ThemeProvider` / `useTheme` | `theme/theme-provider.tsx` | Reads localStorage + `matchMedia` through `useSyncExternalStore` (server snapshot = `"system"`). Exposes `{theme, resolved, setTheme}`; syncs `.dark` / `data-theme` / `color-scheme` on `<html>`. |
| `ThemeToggle` | `theme/theme-toggle.tsx` | 3-way segmented radiogroup light/dark/system. Frame uses `border-strong` (functional boundary). In the sidebar footer and the account menu. |
| `Providers` | `providers.tsx` | Client root: `ThemeProvider` + `Toaster`. Mounted by `app/layout.tsx`. |

### Primitives — `ui/`
| Component | Path | What it does |
|---|---|---|
| `Button`, `buttonVariants` | `ui/button.tsx` | cva. variants primary/secondary/ghost/danger; sizes sm(h-8)/md(h-9); `iconOnly`; `loading` (spinner + disabled). All five states. |
| `Input`, `inputBase` | `ui/input.tsx` | 32px, `border-border-strong`, `aria-invalid:border-danger`. `inputBase` is shared with Textarea/Select. |
| `Textarea` | `ui/textarea.tsx` | Long-form; `text-md` (15px) prose size, resize-y. |
| `Select` | `ui/select.tsx` | Native `<select>` + Lucide chevron (`appearance-none`). Keyboard/SR correct for free. |
| `Card`, `CardHeader` | `ui/card.tsx` | Flat: border, **no shadow**. `padding` none/md(16)/lg(24). |
| `Badge`, `TicketId` | `ui/badge.tsx` | Generic 20px badge (tones + `outline`). `TicketId` = the mandatory `font-mono text-sm font-medium` wrapper for ticket keys. |
| `TicketStatusBadge`, `TicketStatusDot` | `ui/ticket-status-badge.tsx` | **Open = outline badge, Closed = solid, all others solid.** Also exports `TICKET_STATUS_LABELS`, `TICKET_STATUS_ORDER`, `TICKET_STATUS_DOT`, `TICKET_STATUS_RULE` (left-rule border classes for ticket cards). |
| `PriorityIndicator` | `ui/priority-indicator.tsx` | **Dot + label, never a pill.** Exports `TASK_PRIORITY_LABELS`, `TASK_PRIORITY_ORDER`, `TASK_PRIORITY_ROW_TINT` (Urgent only). |
| `Field`, `FormError` | `ui/field.tsx` | Visible label + control + inline error (`${id}-error`) / hint (`${id}-hint`). Never placeholder-only labels. |
| `EmptyState` | `ui/empty-state.tsx` | 24px padding, 20px muted Lucide icon, one `text-md` line, one action. |
| `ConfirmationDialog` | `ui/confirmation-dialog.tsx` | Native `<dialog>` (focus trap + Esc + top layer free). `destructive` swaps to the danger button; `onConfirm` may be async. |
| `Toaster`, `toast` | `ui/toast.tsx` | sonner, bottom-right, **max 2 stacked**, token-styled via `classNames`. Re-exports `toast` so app code never imports sonner directly. **Not for autosave** — design.md bans a toast there. |

### App shell — `shell/`
| Component | Path | What it does |
|---|---|---|
| `AppShell` | `shell/app-shell.tsx` | Composes `AppNav` + `<main>`; skip-to-content link; content capped at 1360px (`max-w-[85rem]`). Owns the cool daylight / graphite palette inherited by every authenticated route. |
| `AppNav` | `shell/app-nav.tsx` | Sticky authenticated top navigation with labelled desktop links, an accessible mobile menu, current date, account/theme menu, and active-route state. |
| `PRIMARY_NAV` / `isActivePath` | `shell/nav-items.ts` | Dashboard, Work Logs, Tickets, Tracker, Notes, and Resources navigation definitions plus subtree matching. |
| `BackButton` | `shell/back-button.tsx` | Shows a history-aware back action on routes outside the primary navigation roots. |
| `Menu`, `menuItemClass`, `MenuLabel`, `MenuSeparator` | `shell/menu.tsx` | Small dropdown: click-outside, Esc, focus return. **Does not close on a `button[type=submit]`** — closing would unmount a `<form action={...}>` before its submit fires. |
| `PageHeader` | `shell/page-header.tsx` | `text-3xl`/700 h1 + optional description + action slot, 24px bottom gap. |
| `ComingSoonPage` | `shell/coming-soon-page.tsx` | Shared token-only placeholder used by every deferred authenticated route, with a clear link back to Work Logs. |

### Legacy marketing components — `marketing/`
The former commit-graph homepage was replaced on 2026-09-19. These components
remain in source but are not mounted by `/`; the live homepage uses `banner/`.
Deliberately separate from `ui/`: the app is dense (14px base), a landing page is not.
All token-only. Colour rule applied throughout: `primary` for large text/fills/icons,
`primary-strong` for anything at normal text size (button labels, links, eyebrows).
| Component | Path | What it does |
|---|---|---|
| `Container`, `Eyebrow`, `OffsetCard`, `CheckList`, `CtaLink`, `TextLink`, `ctaVariants` | `marketing/primitives.tsx` | **Mostly legacy after the 2026-09-16 redesign** — the homepage uses only `Container` (via nav/footer); `Eyebrow` and `OffsetCard` belong to the discarded world and must NOT be reintroduced (an eyebrow above a heading, and a >1px coloured side border, are both craft-floor refusals). Historical note: shared marketing primitives. **`OffsetCard`** is the reference site's signature shape: hairline top/left edge + thick brand-blue bottom/right edge via per-side borders (NOT a box-shadow), so it survives dark mode and forced-colors. `ctaVariants.filled` uses `bg-primary-strong`, not `primary` — a 15px white label on `#017EFD` is 3.89:1 and fails AA. |
| `Rail`, `AddMark` | `marketing/commit-rail.tsx` | **The spine.** One vertical rail per section, stacked so they read continuous. The straight rail is TWO divs (static hairline + a `.m-spine-draw` segment animated `scaleY` on a `view()` timeline) — deliberately NOT an SVG dash animation, see decisions.md. A node of kind `merge` also emits a fixed-size 48x132 SVG whose cubic leaves the spine and rejoins at the node; that one DOES dash-draw, because it is 1:1 and carries no `vectorEffect`. `AddMark` is the diff-gutter `+`. |
| `AmendAttempt` | `marketing/amend-attempt.tsx` | **The homepage's signature interaction and its whole argument.** Pressing "Amend this entry" does not edit: the deletion red strikes once and resolves, a dated correction appends with its own id, the original stays legible, the live region reads "2 entries · nothing overwritten". The page's ONLY use of the deletion colour. Do not change its behaviour or timing. |
| `DayInTheLog` | `marketing/day-in-the-log.tsx` | Product surface DRAWN in DOM + tokens (no screenshots, user's decision). One `role="img"` + label so invented ticket ids are not read out as real. Caller must keep the "Illustrative log" caption. |
| `MarketingNav` | `marketing/marketing-nav.tsx` | Fixed floating pill over the native document scroll. Desktop uses `1fr auto 1fr` for truly centred links; section observation drives the shape+colour active state and `aria-current="location"`. Real hash links smooth-scroll in both directions; mobile menu and icon animate with reduced-motion fallbacks. |
| `RevealController` | `marketing/reveal-controller.tsx` | Scoped homepage IntersectionObserver. Arms motion only after hydration, toggles enter/leave state so text/cards replay in both directions, and leaves all content visible without JS or under reduced motion. |
| `DashboardMock`, `WorkLogMock`, `TicketMock`, `TasksNotesMock` | `marketing/app-mock.tsx` | **Product "screenshots" drawn in DOM + tokens, not images.** Each is one `role="img"` + `aria-label` node so the fake numbers are never read out. **Swap point for real screenshots:** replace a component body with `<Image>`, keep the wrapper + label. |
| `Pricing` | `marketing/pricing.tsx` | Single-plan card + monthly/yearly **radiogroup** (two choices, so radios, not a switch). |
| `Faq` | `marketing/faq.tsx` | Accordion: trigger is a real `<button>` inside an `<h3>` with `aria-expanded`/`aria-controls`; panel keeps its id and toggles `hidden`. Multiple rows may be open. |
| `MarketingFooter` | `marketing/marketing-footer.tsx` | Compact link footer inside the third homepage snap section; reuses `OffsetCard`. |

### Public portfolio homepage — `portfolio/`
The live `/` and `/banner` routes use this implementation. The older `banner/*`
chapter components remain in source but are not mounted.

| Component | Path | What it does |
|---|---|---|
| `PortfolioHome` | `portfolio/portfolio-home.tsx` | Complete semantic photo-led homepage: responsive nav, paired hero, four-link workspace index directly after the hero, borderless split About scene with a visible laptop screen, brighter right-set coast quote, and centered contact/footer. Uses live app destinations and omits unsupplied contact/social URLs. |
| `PortfolioThemeToggle` | `portfolio/portfolio-theme-toggle.tsx` | Accessible 44px light/dark toggle using the shared persisted theme provider. |
| Homepage styling | `app/src/app/banner/banner.css` | `.portfolio-page`-scoped `--pf-*` light/dark system, responsive layout, image swapping, browser-surface styling and reduced-motion handling. |
| Homepage assets | `app/public/Images/portfolio/` | Original canonical dark photographs and their daylight edits; distinct Work Logs journal pair `worklog-{dark,light}.webp` and front-facing-screen About pair `about-screen-{dark,light}.webp`. The dashboard Today hero uses user-supplied `dashboard-desk-cool.webp` in light mode (full-bleed banner, mask-blended) (worklog-dark.webp in dark); `dashboard-workday.webp` is unreferenced. |
| Homepage motion | `portfolio/portfolio-reveal.tsx`, `portfolio/portfolio-theme-toggle.tsx`, `ui/skiper-ui/skiper40.tsx` | `motion/react` animates replayable entry translations without hiding content on exit, plus the Sun/Moon exchange; Skiper `Link000` supplies secondary-link underline motion with focus and reduced-motion paths. Menu remains static. `app/components.json` scopes the shadcn CLI to this app and the registry. |
| Editorial quote font | `app/src/app/fonts/cormorant-garamond-{500,600}.ttf` | Official Google Fonts files, self-hosted via `next/font/local`; used only by the homepage quote. |

### Resources — `resources/`
| Component | Path | What it does |
|---|---|---|
| `ResourceLibrary` | `resources/resource-library.tsx` | Searchable, filterable resource index with expandable rows, type-aware icons, copy/delete actions, and an inline add form for websites, apps, links, tools, commands, snippets, and references. |

### Tickets — `tickets/`
| Component | Path | What it does |
|---|---|---|
| `TicketBoard` | `tickets/ticket-board.tsx` | Compact responsive master-detail ticket manager: starts unselected and reveals details only after an explicit choice, with a searchable/filterable navigator, direct title/status controls, Markdown body composer, and a newest-first timeline. Direct ticket updates have confirmed deletion; read-only work-log entries never do. Mobile uses a native ticket picker instead of a long card stack. |

### Deferred authenticated routes
Reports, Links, Profile and Settings retain limited/placeholder surfaces. Dashboard,
Work Logs, Tracker, Notes, Resources and Tickets are active authenticated routes.

### Auth — `auth/`
Redesigned 2026-09-12: a two-pane auth experience, not a centred card. **These pages have
their own field/input primitives — they do NOT use `ui/field.tsx` or `ui/input.tsx`.** The app
runs at 32-36px controls / 14px base; auth runs at 44px / 15px. Motion lives in
`app/src/app/(auth)/auth-motion.css` (CSS only, no GSAP — see Routes below).
Colour rule applied throughout: panel fill `primary-active`, CTAs + links `primary-strong`,
`primary` only for large fills and decoration.
| Component | Path | What it does |
|---|---|---|
| `AuthShell` | `auth/auth-shell.tsx` | Two deliberately different auth compositions. Login is a hard split with a visual day-progress/latest-log object; registration is an emerald canvas with a floating form card and connected Private/Daily/Permanent map. Both collapse to focused form-first mobile layouts. |
| `AuthField`, `AuthInput`, `authInputBase`, `AuthFormError` | `auth/auth-field.tsx` | Auth-scoped form primitives. 44px controls, 15px type, optional leading Lucide icon (turns `primary-strong` on focus-within) and `trailing` slot. **The hint/error slot is `min-h-5` and reserved**, so an inline error never shifts the submit button. Errors are icon + text (never colour-only), `role="alert"`, id `${htmlFor}-error`. `AuthFormError` is the top-of-form summary banner — `role="alert"` + `tabIndex={-1}` so a form can focus it after a failed submit. |
| `PasswordInput` | `auth/password-input.tsx` | Password field + visibility toggle: real `<button type="button">`, 40×40, `aria-label` from the `fieldName` prop ("Show password" / "Show password confirmation") and `aria-pressed`. After the input in DOM order. Never blocks paste; `autocomplete` always set. |
| `PasswordStrength`, `PasswordMatch`, `passwordScore` | `auth/password-strength.tsx` | Live register-form feedback. Meter animates `transform: scaleX()` — **never `width`**; always carries a written label (Weak/Fair/Good/Strong), `role="status"`. `PasswordMatch` shows the positive instantly and the negative only after blur. Both keep a reserved row height. |
| `LoginForm` | `auth/login-form.tsx` | Minimal returning-user form. Calls `login(input, callbackUrl)` and declares `method="post"` so a no-JS submit cannot put credentials in the URL. Keeps inline errors and focus-to-first-error. |
| `RegisterForm` | `auth/register-form.tsx` | Distinct setup form with Name/Email/Password/Confirm, strength/match guidance, and `method="post"`; calls `register` then `login` without changing the server contract. |
| `safeCallbackUrl` | `auth/safe-callback-url.ts` | Rejects anything that isn't a path-relative same-origin URL — closes the `?callbackUrl=` open redirect. |

## Routes / Pages
Three route groups: `(marketing)` = **public homepage at `/`**, `(app)` = authenticated shell,
`(auth)` = two-pane sign-in / sign-up (form column + brand panel).

> **⚠ ROUTING CHANGED 2026-09-12.** `/` is no longer the dashboard — it is the public
> marketing homepage. **The dashboard moved to `/dashboard`.** `/` is listed in
> `PUBLIC_ROUTES` (`src/lib/auth.config.ts`), and signed-in visitors are deliberately
> NOT redirected away from it; signed-in nav/footer CTAs open Work Logs.

| Route | Path | What it does |
|---|---|---|
| — | `app/src/app/layout.tsx` | Root layout: network-independent semantic font stacks, theme init script in `<head>`, `Providers`, metadata + themeColor. |
| — | `app/src/app/(app)/layout.tsx` | `requireUser()` gate + server-rendered date label, then renders `AppShell`. |
| — | `app/src/app/(auth)/layout.tsx` | Thin frame: owns `.force-light` and the auth motion stylesheet; page-specific presentation lives in `AuthShell` variants. |
| — | `app/src/app/(auth)/auth-motion.css` | Auth animation: one form-level entrance, error fade, CTA feedback, and scaleX strength meter; CSS-only transform/opacity motion with explicit reduced-motion final states. |
| `/login` | `(auth)/login/page.tsx` | Minimal `AuthShell variant="login"` + `LoginForm`; callback URL sanitised by `safeCallbackUrl`. |
| `/register` | `(auth)/register/page.tsx` | Distinct setup-card `AuthShell variant="register"` + `RegisterForm`. |
| — | `app/src/app/(marketing)/layout.tsx` | Thin public pass-through; the homepage supplies its own banner chrome and scoped palette. |
| `/` | `(marketing)/page.tsx` | **PUBLIC.** Renders `PortfolioHome`, the full photo-led personal workspace layout with first-class light/dark assets. |
| `/banner` | `app/src/app/banner/page.tsx` | **PUBLIC, STANDALONE.** Alias of the same `PortfolioHome` experience used at `/`; `banner.css` now owns the scoped `--pf-*` world. |
| `/dashboard` | `(app)/dashboard/page.tsx` | Data-backed daily command centre: full-width split photo Today feature, bordered counted shortcuts, cool-toned focus queue, open sprint/workflow and recent-ticket sections. Reads `src/lib/dashboard.ts`; image/blend CSS lives in `globals.css` while palette tokens come from the shared app shell. |
| Dashboard card motion | `app/src/components/dashboard/dashboard-card-motion.tsx` | Client-only GSAP ScrollTrigger enhancer for the dashboard's section and library cards; keeps server-rendered cards visible by default and disables motion for reduced-motion preference. |
| `/work-logs` | `(app)/work-logs/page.tsx` | Navy-tint create-log card, then the current sprint as a calendar (`SprintTable`, now a 2×5 grid of the sprint's 10 weekdays: logged day tiles link to the log, today teal, missed days dashed, future faded; header shows 'N of 10 days logged' + progress bar). Previous sprints (with logs) in a collapsed `<details>`. |
| `/work-logs/[workLogId]` | `(app)/work-logs/[workLogId]/page.tsx` | Read-only view, no cards: meta line, ruled meeting list (name column + notes), ticket table rows; border-l rail with Current ticket status + Ticket history (via `getTicket`). |
| `/work-logs/[workLogId]/edit` | `(app)/work-logs/[workLogId]/edit/page.tsx` | Autosaving work-log editor with editable title and project/site context, a bordered capture header, semantic meeting accents, token-based ticket cards, and a dark-mode-safe progress glance rail. |
| `/tickets` | `(app)/tickets/page.tsx` | Searchable ticket-management page for changing the current title/status without modifying append-only work-log entries; has a route-level loading skeleton. |
| `/resources` | `(app)/resources/page.tsx` | Searchable resource library with type dropdown, inline creation, expandable detail rows, URLs, commands, tags, and copy/delete actions. |
| `/tasks`, `/reports`, `/links`, `/profile` | matching `(app)/*/page.tsx` | Shared Coming Soon state; deliberately absent from navigation. |
| `/settings` | `(app)/settings/page.tsx` | Appearance controls and theme behavior explanation. |

## DB schema — `app/prisma/schema.prisma`
Enums: `TicketStatus` (InProgress, SentToQA, ReadyForProduction, Released, Done) ·
`TaskPriority` (Low, Medium, High, Urgent) · `TaskStatus` (Todo, InProgress, Completed) ·
`ResourceType` (Documentation, Command, Snippet, Reference, Tool, Learning, Other).

| Model | Key fields | Constraints / indexes |
|---|---|---|
| `User` | name, email, passwordHash, image | `email` unique |
| `Account` `Session` `VerificationToken` | NextAuth adapter tables | standard |
| `WorkLog` | userId, title, optional projectName, date (`@db.Date`), timestamps | **`@@unique([userId, date])`** · idx userId, (userId,date), (userId,updatedAt) |
| `Meeting` | workLogId, name, notes, `order`, `isDefault` | idx workLogId, (workLogId,order) |
| `Ticket` | userId, `ticketId` (human key "ASU-1234"), title, status | **`@@unique([userId, ticketId])` — per user, NOT global** · idx (userId,status), (userId,updatedAt) |
| `TicketWorkUpdate` | ticketId, workLogId, userId, description, status-at-that-time, timestamps | **`@@unique([ticketId, workLogId])` — the autosave key** · idx (ticketId,createdAt), (userId,createdAt), workLogId |
| `TicketHistoryEntry` | ticketId, userId, body, status-at-that-time, createdAt | Direct `/tickets` updates are inserted, never rewritten, and may be explicitly deleted · idx (ticketId,createdAt), (userId,createdAt) |
| `Task` | userId, ticketId?, title, description, dueDate, priority, status, notes, completedAt | idx (userId,status), (userId,dueDate) · ticket FK `SetNull` |
| `Note` | userId, title, content, `tags String[]`, pinned | idx (userId,updatedAt), (userId,pinned) |
| `Link` | userId, title, url, description, category, tags | idx (userId,category) |
| `Resource` | userId, title, description, type, url?, content, tags | idx (userId,type) |

Every user-owned model has `userId` + `onDelete: Cascade` + an index.
`WorkLog.date` is stored at **UTC midnight** — use `toDateOnly()` / `todayUtc()` from `@/lib/worklogs`.

## Server layer — `app/src/lib/`
| File | What it holds |
|---|---|
| `prisma.ts` | PrismaClient singleton (globalThis guard vs. hot-reload leak) + re-exports every enum and model type. **Import enums from `@/lib/prisma`, not from `src/generated`.** |
| `auth.config.ts` | Route-protection config used by `proxy.ts`. `PUBLIC_ROUTES = ["/login","/register"]` + `/api/auth/*`. `isPublicPath()` exported. |
| `auth.ts` | NextAuth v5: credentials provider, bcrypt cost 12, JWT sessions carrying `userId`. Exports `handlers, auth, signIn, signOut, hashPassword, verifyPassword`. |
| `session.ts` | **`requireUser()` / `requireUserId()`** — the gate. Every action + query starts here. `getCurrentUser()` is the nullable, React-`cache`d variant. |
| `result.ts` | `ActionResult<T>` = `{ok:true,data}` \| `{ok:false,error:{code,message,fields?}}`. Codes: VALIDATION_ERROR, UNAUTHORIZED, NOT_FOUND, CONFLICT, INTERNAL_ERROR. |
| `validation.ts` | Every Zod schema. `ticketKeySchema` upper-cases + strips spaces. `PASSWORD_MIN_LENGTH = 8`. |
| `workflow-status.ts` | Five-stage UI workflow order plus non-destructive normalization from legacy database statuses. New writes use the current stages; old history remains readable. |
| `worklogs.ts` | Work log + meeting queries. `DEFAULT_MEETINGS`, `todayUtc`, `toDateOnly`, `formatDateKey`, `workLogInclude`. |
| `tickets.ts` | **The critical piece.** Read the header comment before touching it. |
| `content.ts` | Task / Note / Link / Resource queries. |

## Server actions — `app/src/actions/` (the frontend's whole API)
All return `ActionResult<T>`. All call `requireUserId()` first and Zod-validate second.
A hostile id from the client matches zero rows and comes back `NOT_FOUND`.

### `@/actions/auth`
| Action | Does | Input | Output |
|---|---|---|---|
| `register(input)` | Creates a user; bcrypt cost 12; rejects duplicate email | `{name,email,password,confirmPassword}` | `{id,email}` / CONFLICT on dup |
| `login(input, redirectTo?)` | Credentials sign-in; server-sanitises redirect to a path-relative URL; throws the Next redirect on success | `{email,password}` | UNAUTHORIZED on bad creds |
| `logout()` | Signs out, redirects to `/login` | — | void |

### `@/actions/worklog`
| Action | Does | Input | Output |
|---|---|---|---|
| `openTodayWorkLog()` | Today's log, creating it with the 4 default meetings | — | WorkLog + meetings + ticketUpdates(with ticket) |
| `openWorkLogForDate(input)` | Same for any date (historical entries) | `{date:"YYYY-MM-DD", title?, projectName?}` | same |
| `getWorkLog(workLogId)` | Read one | id string | same / NOT_FOUND |
| `listWorkLogs(options?)` | Listing page, newest first, with `_count` | `{search?,from?,to?,ticketId?,take?,skip?}` | `{items,total}` |
| `updateWorkLog(input)` | Update title and/or optional project/site context | `{workLogId,title?,projectName?}` | WorkLog |
| `deleteWorkLog(input)` | Deletes log + meetings + its updates. **Tickets survive.** | `{workLogId}` | `{deleted:true}` |
| `createMeeting(input)` | "+ Add Meeting" | `{workLogId,name,notes?}` | Meeting |
| `updateMeeting(input)` | **Autosave target for meeting notes.** Idempotent. | `{meetingId,name?,notes?}` | Meeting + `savedAt` |
| `deleteMeeting(input)` | Remove a meeting card | `{meetingId}` | `{deleted:true}` |

### `@/actions/tickets`
| Action | Does | Input | Output |
|---|---|---|---|
| `findTicket(input)` | Ticket search box. Key is case-insensitive. | `{ticketKey}` | `{found:false,ticketKey}` or `{found:true,ticket}` (ticket has `updates[]`, newest first) |
| `upsertTicketForWorkLog(input)` | Find-or-create + attach to this log. Re-calling is a no-op, never clears a draft. | `{workLogId,ticketKey,title?,status?}` | `{ticket (full history), created, currentUpdate}` |
| `saveTicketWorkUpdate(input)` | **The append/autosave write.** Safe on every debounce tick. | `{workLogId,ticketId,description,status}` | `{update,ticket,savedAt}` |
| `detachTicketFromWorkLog(input)` | Remove the card from THIS log only | `{workLogId,ticketId}` | `{detached,ticket}` |
| `getTicket(ticketId)` | Detail page + full merged timeline source | id string | Ticket + work-log `updates[]` + direct `historyEntries[]` |
| `listTickets(input?)` | Tickets table | `{search?,status?,take?,skip?}` | `{items(+latestUpdate,+workLogCount),total}` |
| `listActiveTickets(take?)` | Dashboard: every ticket not marked Done | number | Ticket[] |
| `updateTicket(input)` | Direct edit. Writes NO history row. | `{ticketId,title?,status?}` | Ticket + history |
| `appendTicketHistoryEntry(input)` | Appends a standalone ticket body update and snapshots status; never writes a work-log row. | `{ticketId,body,status}` | `{entry,ticket}` |
| `deleteTicketHistoryEntry(input)` | Deletes one user-owned standalone ticket update; cannot reach work-log history. | `{ticketId,entryId}` | `{deleted:true}` |
| `deleteTicket(input)` | **Destructive** — ticket + all history | `{ticketId}` | `{deleted:true}` |

### `@/actions/content`
`createTask` `updateTask` `deleteTask` `listTasks(view)` — view: `"today"|"upcoming"|"completed"|"all"`
`createNote` `updateNote` `deleteNote` `listNotes(search?)`
`createLink` `updateLink` `deleteLink` `listLinks(search?)`
`createResource` `updateResource` `deleteResource` `listResources(search?, type?)`
Create takes the fields; update takes `{<x>Id, ...partial}`; delete takes `{<x>Id}`.

## Seed / demo login
`cd app && npm run db:seed` → account **tariboi36@gmail.com**, password = `SEED_PASSWORD` from `app/.env` (never committed)
Re-running is intentionally destructive: it deletes every local user (and cascade-owned content),
then creates this one dummy user. **Volume as of 2026-09-21** (verified against the running DB):
**3 work logs, 4 tickets, 4 tasks, 1 note, 3 links, 3 resources**.

- **Nav focus ring.** `#app-nav` scopes `--c-ring` to the bright teal, because the pill is
  dark in both themes and the light ring lands at 2.69:1 on an active item.
- **There is no sidebar** (removed 2026-09-14). Navigation is `shell/app-nav.tsx`, a dark
  pill across the top in the homepage's design. It is a 3-column grid from `md`; brand and
  back button are deliberately ONE grid item, or the right-hand block wraps to a second row.

## Notes — ported from Nexa (2026-09-14)
`Note -> NoteSection -> NotePage`, the OneNote shape. Source of truth for the port is
`~/Work/Claude/Nexa` (`components/notes/`, `lib/notes.ts`, `app/actions/notes.ts`).
- `src/lib/notes.ts`       shared Zod schemas + types — NO `server-only`, the editor imports it
- `src/lib/note-store.ts`  server-only Prisma layer (tree create/update in one transaction)
- `src/actions/notes.ts`   server actions — `useActionState` form state, not `ActionResult`
- `src/components/notes/`  ported editor; `note-field.tsx` adapts Nexa's `Field` to our tokens
- Routes: `/notes`, `/notes/new`, `/notes/[noteId]`, `/notes/[noteId]/edit`
- `deletedAt` trash + restore/destroy exist in the store and actions, with **no UI yet**.
- **`.note-prose` in `globals.css`** (~400 lines, appended at the end) styles ALL rich text —
  headings, lists, checklists, tables, code blocks and the lowlight syntax theme. Ported from
  Nexa with its `--color-*` vars remapped onto our `--c-*`. Without it, notes render as plain
  paragraphs. The `--code-*` set inside it is self-contained and stays dark in both themes.
- **Dummy data:** `npm run db:seed:notes` (3 notebooks, 8 pages). Pages are authored as HTML in
  `prisma/seed-notes.ts` and converted with `@tiptap/html/server` using the editor's own
  extension list — never hand-write TipTap node JSON, it drifts.
- When porting more from Nexa, remember its token vocabulary (`bg-sheet`, `border-line`,
  `text-muted-light`, `text-lede`…) does not exist here and fails **silently**.
## Public auth and portfolio navigation (2026-09-20)
src/components/auth/auth-shell.tsx owns the shared public login/register frame. It uses the paired portfolio workspace photographs and src/app/(auth)/auth-motion.css supplies the scoped warm-paper/graphite tokens, responsive split layout, contained desktop form column, and reduced-motion behavior. Form logic remains in login-form.tsx and register-form.tsx.

src/components/portfolio/portfolio-nav.tsx is the client-side public navigation. It tracks home, workspace, about, and contact from scroll position, exposes aria-current="location", and uses Motion's shared layout indicator for desktop/mobile active links. portfolio-home.tsx renders it in both header variants.

## Work-log Markdown capture (2026-09-22)

`src/components/work-log/markdown-editor.tsx` is the shared compact TipTap field
for meeting notes and ticket-work descriptions. It presents WYSIWYG formatting,
supports Markdown input rules such as `* ` to start a bullet list, honors native
Ctrl/Cmd+B and Ctrl/Cmd+I, and serializes back to Markdown strings so the existing
Prisma text columns and autosave server actions require no migration. Its
`MarkdownContent` export renders those strings in timelines and ticket history.
The focused rich-text styles live under `.worklog-prose` in `globals.css` and are
deliberately separate from the full Notes editor's `.note-prose` system.

`meeting-section.tsx` now uses a master-detail capture flow: four compact meeting
selectors keep completion state visible while only the selected meeting mounts a
full writing canvas. `work-log-editor.tsx` owns the live completed-meeting count,
integrates meeting/ticket/autosave progress into the graphite command header, and
renders meetings then ticket work as one full-width task sequence with no summary
sidebar.
