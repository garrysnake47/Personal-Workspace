# Design System — WorkNest

> **How it looks.** The single source of truth for values is the CSS, not this file:
> `app/src/app/globals.css` (app + auth) and `app/src/app/banner/banner.css`
> (homepage). This file explains the system and the rules. If you change a token,
> update the table here in the same change.
>
> Last synced with the codebase: **2026-09-29**

---

## 1. Three visual worlds

WorkNest deliberately has three scoped palettes. **Never mix them** and never export
one world's variables into another.

| World | Scope (CSS selector) | Where | Tokens |
|---|---|---|---|
| **Workspace** (the product) | `.app-shell` | Every authenticated route | `--c-*` overrides in `globals.css` |
| **Base / auth** | `:root` | `/login`, `/register`, anything outside the shell | `--c-*` defaults in `globals.css` |
| **The Quiet Studio** (homepage) | `.portfolio-page` | `/`, `/banner` | `--pf-*` in `banner/banner.css` |

**Light only.** The theme toggle and theme provider were removed; `viewport.colorScheme`
is `light` and `themeColor` is `#ffffff`. The `.dark` / `.dark .app-shell` token blocks
and `--pf-*` night values still exist in the CSS, but **nothing applies the `.dark`
class** — treat them as dormant. Don't build new dark-mode UI unless dark mode is
reintroduced on purpose (and then update this file and `Memory.md`).

## 2. Workspace palette (`.app-shell`)

User-supplied on 2026-09-24: **teal `#3c6e71` · navy `#284b63` · charcoal `#353535`**
plus their shades only. The page is white; cards are white with a teal-shade border;
tinted fills are for emphasis only. No neutral grey fills.

| Token | Value | Use |
|---|---|---|
| `--c-bg` | `#ffffff` | page canvas |
| `--c-surface` | `#ffffff` | inputs, menus, items nested in cards |
| `--c-surface-2` | `#f1f6f6` | toolbars, insets, hover |
| `--c-surface-3` | `#dfebec` | pressed / selected |
| `--c-card` | `#ffffff` | default card fill |
| `--c-card-tint` | `#e9f1f1` | teal emphasis card |
| `--c-card-navy` | `#e7edf2` | navy emphasis card |
| `--c-text` | `#353535` | headings, primary values (12.2:1) |
| `--c-text-muted` | `#414141` | descriptions (10.2:1) |
| `--c-text-subtle` | `#555555` | sublabels, hints, timestamps (7.5:1) |
| `--c-border` | `#8fb1b4` | card edges, dividers |
| `--c-border-strong` | `#5f8587` | **functional** control edges (inputs, toggles) |
| `--c-primary` | `#3c6e71` | large fills, icons, accents |
| `--c-primary-strong` | `#284b63` | normal-size links, small labels |
| `--c-primary-hover` / `-active` | `#325c5f` / `#284b63` | states |
| `--c-primary-subtle` | `#d3e3e4` | selected state |
| `--c-accent-text` | `#284b63` | accessible accent text (9.1:1) |
| `--c-ring` | `#3c6e71` | focus ring |
| `--c-sidebar` (+`-2`,`-3`) | `#284b63` / `#213f53` / `#1a3343` | **navy chrome**: nav pill, primary buttons, work-log hero, code blocks |
| `--c-sidebar-fg` / `-muted` / `-subtle` | `#fff` / `#d2dde5` / `#a9bccb` | text on navy |
| `--c-overlay` | `rgba(40,75,99,.55)` | navy scrim behind dialogs |

The name `--c-sidebar-*` is historical (there used to be a sidebar); it now means
"dark navy chrome".
### Feedback, status, priority, tracker tones

- **Feedback:** `danger #dc2626`, `success #15803d`, `warning #b45309`, `info #1d4ed8`,
  each with `-fg` and `-subtle`.
- **Ticket status** (`--c-status-{open,progress,blocked,waiting,testing,completed,closed}`
  + `-bg` / `-fg`). The UI shows five workflow stages mapped onto these.
- **Priority** (`--c-priority-{low,medium,high,urgent}` + `-bg`) — shown as dot + label,
  never a pill.
- **Tracker tones** `--c-tk-*`: `overdue #dc2626`, `today #0f766e`, `upcoming #4f46e5`,
  `undated #0369a1`, `notes #b45309`, `done #15803d`, `followup #1d4ed8`, `task #0e7490`,
  `note #b45309`, `idea #7c3aed`, `on #ffffff` (text on a solid tone). **Where a tone
  may appear:** the solid icon tile in a group header, solid date chips (overdue/today),
  and tinted chips (10% fill, text = tone + 20% ink so all tones clear 4.5:1 at 12px).
  Group cards, their headers and borders stay neutral (white + `--c-border`) and the
  count is a `surface-2` pill — no tone washes over large areas (they read as muddy
  pastels next to the teal/navy palette). The quick-capture bar is a plain white card.
- **Note accents** (`lib/note-colors.ts`): brand icons keep their real brand hex — the
  one deliberate exception to "tokens only". Generic icons get a stable colour picked
  from the note id.

## 3. Base / auth palette (`:root`)

Slate + teal: `bg #f8fafc`, `surface #fff`, `text #0f172a`, `muted #475569`,
`subtle #64748b`, `border #e2e8f0`, `border-strong #64748b`, `primary #0d9488`,
`primary-strong #0f766e`. Auth pages add their own motion in `(auth)/auth-motion.css`
and composition in `components/auth/auth-shell.tsx` (login = "resume your day",
register = "create your system" — intentionally different layouts).

## 4. The Quiet Studio (homepage)

Scoped by `.portfolio-page`, tokens `--pf-*` in `app/src/app/banner/banner.css`.

- Near-monochrome so the photography supplies colour: `--pf-bg #f6f5f2`,
  `--pf-surface #fdfcf9`, `--pf-text #11151b`, `--pf-muted #5d626b`,
  `--pf-label #646a72` (contrast-safe small labels), `--pf-button #171a20` on white.
- Photos come in matched light/dark pairs in `public/Images/portfolio/`. Theme swaps
  real assets; **never** filter a photo in CSS. Next image quality 90.
- Plus Jakarta Sans for display + UI (heavy, tight tracking), Cormorant Garamond 500/600
  (self-hosted in `src/app/fonts/`) for the coast quote only.
- Pill buttons, 44px theme-sized controls, 12px icon wells, fine rules, no decorative
  shadows. Text-local gradients protect copy; photos stay crisp.
- Sections: hero (`100dvh`) → workspace index (4 ruled links) → about → contact → quote.
- All copy is semantic DOM over separate images — never a screenshot of text.

## 5. Typography

Loaded in `app/src/app/layout.tsx` via `next/font` (self-hosted, no runtime Google calls).

| Face | Variable | Used for |
|---|---|---|
| **Geist** | `--font-geist` → `--font-sans` | All authenticated app UI (since 2026-09-28) |
| **Geist Mono** | `--font-geist-mono` → `--font-mono` | Ticket IDs, timestamps, commands, code (ligatures off) |
| Plus Jakarta Sans (+ italic) | `--font-jakarta` | Homepage, banner, auth |
| Cormorant Garamond 500/600 | `--font-cormorant` | Homepage quote only |
| Bricolage Grotesque, Archivo, Martian Mono | `--font-bricolage` / `--font-archivo` / `--font-martian-mono` | Legacy `.marketing-document` styles only |

**Type scale** (Tailwind `text-*`, 14px app base):

| Class | Size | Use |
|---|---|---|
| `text-2xs` | 11 | uppercase micro-labels (+0.06em tracking) |
| `text-xs` | 12 | meta, timestamps |
| `text-sm` | 13 | table cells, badges |
| `text-base` | **14** | app default body |
| `text-md` | 15 | long-form prose (work-log notes, descriptions) |
| `text-lg` | 16 | card titles |
| `text-xl` | 18 | h3 |
| `text-2xl` | 20 | h2 |
| `text-3xl` | 24 | h1 / page title |
| `text-4xl` | 30 | large numerals |
| `text-5xl` | 36 | auth only |
| `text-6xl`–`text-9xl` | 44–72 | marketing only |

**Headings (2026-09-29 pass).** Hierarchy comes from weight and colour, not raw scale
(taste skill; Linear headline ≈ 28px/600):

| Role | Class | Weight | Tracking |
|---|---|---|---|
| Page title (h1, `PageHeader` and the work-log/ticket pages) | `text-3xl lg:text-4xl` (24 → 30px) | 600 | `-0.03em` |
| Work-log editor date h1 | `text-2xl md:text-3xl` | 600 | `-0.03em` |
| Section h2 | `text-lg`–`text-xl` | 600 | `-0.02em` (global) |
| h3 | `text-base`–`text-lg` | 600 | `-0.01em` (global) |

No weight 750 anywhere in the app. Page description: `text-base`, muted, `max-w-[65ch]`.
Headings `text-wrap: balance`, body `text-wrap: pretty`, numbers `tabular-nums` (all set
globally in the base layer). Use the `…` character, never `...`. Ticket keys always go
through the `TicketId` wrapper (`font-mono text-sm font-medium`).

## 6. Layout, spacing, radius, elevation

- **Breakpoints — exactly four:** `xs` 360 · `md` 768 · `lg` 1024 · `xl` 1440.
  **`sm:` and `2xl:` do not exist** (reset on purpose).
- **Shell:** top nav bar, **64px at every size, always one line** (no sidebar).
  Below `md` sections move into a sheet; `md` shows text-only links with the brand icon
  (brand text hidden to make room); `lg` adds the brand text and account name; `xl`
  adds section icons and the date. Labels are `whitespace-nowrap`. Content capped at
  1360px (`max-w-[85rem]`). Skip-to-content link. No horizontal body scroll — wide
  content scrolls inside itself. Anything sized against the nav (`.tickets-board`
  height, sticky asides at `top-20`) assumes 4rem.
- **Page rhythm:** page title block → 32px (`mb-8`) → content. Sections inside a page
  are separated by 20–24px (`gap-5`/`gap-6`).
- **Spacing:** Tailwind 4px scale. Page padding `px-3 md:px-5 lg:px-8`.
- **Radius:** `xs 3` dots · `sm 4` badges · `md 6` inputs/menu items · `lg 8` panels ·
  `xl 12` dialogs · `2xl 16` max. Buttons and chips are `rounded-full`. Work-log cards
  (`.wl-card`) use 16px.
- **Elevation:** soft navy-tinted shadows `--sh-card`, `--sh-card-hover`, `--sh-button`,
  `--sh-md`, `--sh-lg`, `--sh-focus`. Depth comes from borders + surface ladder first;
  shadows are subtle.

## 7. Motion

Tokens in `:root`: `--duration-{stagger 40, micro 80, quick 150, fast 250, medium 350,
slow 400, very-slow 500}ms`, `--ease-smooth-out`, `--ease-bounce`, distance/scale/blur
tokens. Utilities: `.motion-page-enter`, `.motion-stagger`, `.motion-lift`,
`.motion-disclosure-content`, `.scroll-reveal`, `.t-dropdown`, `.t-sheet`.

- Motion dial for the app: **4/10** (standard, not cinematic). State transitions
  150–250ms. Buttons press with `active:scale-[0.98]`.
- Animate `transform` and `opacity` only; list properties explicitly
  (`transition-[transform,opacity]`), never `transition-all`. Moving indicators
  (nav pill, meeting tabs) position with `translate3d`, not `left/top`.
- Navigation never animates in.
- `prefers-reduced-motion` disables all of it.
- Homepage uses `motion/react` reveals (replay in both scroll directions, never fade
  text *out*). GSAP is installed and used by the legacy `banner/` components.

## 8. Components

All under `app/src/components/`. Use these before writing new markup.

### Primitives — `ui/`
| Component | Notes |
|---|---|
| `Button`, `buttonVariants` | cva. Variants: `primary` (navy), `subtle`, `secondary`, `outline`, `ghost`, `danger`. Sizes `xs 28` / `sm 32` / `md 36` (default) / `lg 40`. Props `iconOnly`, `block`, `loading`. Rounded-full. |
| `Input`, `Select`, `Textarea` | MUI-backed fields (see §9). Never re-patch borders at call sites. |
| `Field`, `FormError` | Visible label + control + error/hint wired with ids. Never placeholder-only labels. |
| `Card`, `CardHeader` | Bordered surface; padding none/md/lg. |
| `Badge`, `TicketId` | Generic badge; `TicketId` is mandatory for ticket keys. |
| `TicketStatusBadge`, `TicketStatusDot` | Status colours + labels + order. |
| `PriorityIndicator` | Dot + label, never a pill. |
| `ProjectInput` | MUI Autocomplete (freeSolo) of the user's project names; loads on open, no module cache. |
| `TagInput`, `normalizeTag` | MUI Autocomplete (multiple + freeSolo) chip field over existing tags. Click or ↓+Enter picks a suggestion; Enter/comma adds typed text; blur keeps typed text. Tags normalised (lowercase, no `#`, spaces → `-`), max 25. No `autoHighlight` — in MUI 9 freeSolo, Enter commits typed text, so a pre-highlight would mislead. |
| `Modal` | Native `<dialog>`: header (eyebrow + title + close), scrolling body, optional footer; `md`/`lg`. Backdrop close only when the press **and** the click are both on the backdrop. |
| `ConfirmationDialog` | Native `<dialog>`; `destructive` uses the danger button; async `onConfirm`. |
| `EmptyState` | Muted icon, one line, one action. |
| `Toaster`, `toast` | sonner, bottom-right, max 2. Import `toast` from here, never from sonner. **Not for autosave.** |
| `skiper-ui/skiper40` | Animated underline link (homepage secondary links). |

### Shell — `shell/`
`AppShell`, `AppNav` (pill nav + mobile sheet + account menu), `nav-items.ts`
(`PRIMARY_NAV`, `navFor(ticketsEnabled)`, `isActivePath`), `Menu` (doesn't close on a
submit button, so form actions still fire), `PageHeader`, `ComingSoonPage`.

### Feature components
`work-log/*` (editor, sections, ticket search/card/history, save status, attachments,
learning, day type/stamp, copy button), `tickets/ticket-board`, `tracker/tracker-board`
(all per-kind wording lives in `KIND_META`), `notes/*` (TipTap editors, icon picker,
viewer, TOC), `resources/resource-library`, `profile/profile-form`, `auth/*`,
`portfolio/*` (homepage).

`marketing/*` and `banner/*` are **legacy** — not mounted by any route. Don't extend them.

### CSS recipes in `globals.css`
`.wl-card` / `.wl-card-head` (work-log card), `.wl-hero` (navy header that re-points
tokens so normal components render light-on-navy; `.wl-solid` / `.wl-field` reset to
light inside it), `.wl-inset`, `.wl-off` (hatched holiday/leave tile), `.wl-scroll`
(slim scrollbar), `.worklog-prose` (Markdown fields, 15px), `.note-prose` /
`.note-editor-body` (Notes editor), `.tickets-board` (fits the viewport at `lg`).

## 9. MUI inside Tailwind

Form fields use MUI (`@mui/material` 9) via `components/ui/mui-provider.tsx`, mounted
in the `(app)` layout only.

- `@layer theme, base, mui, components, utilities;` — MUI lives in `@layer mui`
  (`enableCssLayer`), so Tailwind utilities passed through `className` win.
- MUI's palette holds concrete hexes (it computes alphas); every visible colour in the
  overrides reads CSS tokens.
- **Popups inside dialogs:** MUI portals menus/listboxes to `<body>`, which sits
  *below* a native modal `<dialog>` (top layer). The theme's `MuiPopper` /
  `MuiPopover` defaults portal into the open `dialog:modal` instead (else into
  `.app-shell`, so popups inherit the workspace tokens; else `<body>`),
  and Poppers use `strategy: "fixed"` so the dialog's `overflow: hidden` can't clip
  them. Any MUI field works inside `Modal` with no extra props.
- MUI draws its own 2px teal focus border, so the global outline is suppressed on
  `.MuiInputBase-input`, `.MuiSelect-select`, `.MuiAutocomplete-input`.
- Deliberately *not* MUI: tiny inline micro-controls (e.g. the Notes move-to-section
  pill, code-block language chip).

## 10. Rules (non-negotiable)

1. **Tokens only.** No raw hex, px font sizes or ad-hoc shadows in components. The
   only exception is brand colours in `lib/note-colors.ts`.
1a. **One accent for UI chrome** (buttons, links, focus, selection = teal/navy).
   Coding colour is allowed where it helps scanning: status, priority, Tracker date
   groups, feedback, note brand colours, and **Resources types** — each of the 10 types
   keeps its own hue (`TYPE_COLOR` in `resource-library.tsx`: Documentation `#2563EB`,
   Learning `#16A34A`, Reference `#D97706`, Tool `#0D9488`, Website `#0284C7`, App
   `#7C3AED`, Link `#DB2777`, Command `#EA580C`, Snippet `#4F46E5`, Other `#64748B`).
   The owner chose these over a single accent (2026-09-29) — don't flatten them.
2. `--c-primary` is for large text, icons and fills; normal-size text uses
   `primary-strong` / `accent-text`.
3. Control edges use `border-border-strong` (≥3:1, WCAG 1.4.11); `border-border` is
   decorative only.
4. Focus is always visible: 2px `--c-ring`, 2px offset. The ring never changes a
   control's `border-radius`.
5. Icons: **Lucide** in the app (`iconLibrary: "lucide"`), react-icons for note icons
   only.
6. Minimal modals. Prefer inline creation (tickets are created inside the log).
7. Nothing implies history can be rewritten: no edit/delete affordance on
   `TicketWorkUpdate` or `FollowUpUpdate` rows.
8. Check every new screen at 375, 768, 1024 and 1440 — nav on one line, no clipped
   labels, no horizontal scroll.
9. Destructive confirmations use `ConfirmationDialog` (or an Undo), never
   `window.confirm` / `alert`.
10. Only `xs md lg xl` breakpoints exist — an `sm:` class silently does nothing.

### Sources

Rules above were checked against (2026-09-29): the **redesign-existing-projects** and
**design-taste-frontend** skills (taste-skill), **ui-ux-pro-max** (pre-delivery
checklist; its generated font/pattern suggestions didn't fit a dense app and were not
used), **Vercel Web Interface Guidelines** (vercel.com/design/guidelines) and the
**Linear** DESIGN.md from awesome-design-md (type scale, 64–72px nav, 4px spacing).
Palette and fonts are unchanged.
