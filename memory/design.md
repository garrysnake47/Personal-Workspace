# Design System — Personal Workspace

> ## Homepage world — “The Quiet Studio” (2026-09-19, current `/` and `/banner`)
>
> The public homepage is scoped by `.portfolio-page` and the `--pf-*` tokens in
> `app/src/app/banner/banner.css`. It is a cinematic editorial personal workspace,
> built from separate paired light/dark photographs in `public/Images/portfolio/`:
> hero, about workspace and coast. Dark frames are canonical;
> each light asset is a daylight lighting edit of that exact composition, with
> the subject, pose, crop, geometry and focal point held fixed. Theme changes swap real
> day/night assets; they never filter one photograph in CSS. All copy,
> navigation, workspace links and controls remain semantic DOM. The former
> three-photo workspace-card section is removed; its image files remain unused in `public/`.
> The About pair now uses `about-screen-{dark,light}.webp`: the laptop screen
> faces the viewer in both frames, and the daylight asset relights the dark scene.
>
> Light mode uses warm off-white ground with ink text; dark mode uses near-black
> studio surfaces with soft white text. Plus Jakarta Sans carries interface and
> display copy, Bricolage carries the small environmental note, and the quote uses
> self-hosted Cormorant Garamond 500/600 from `app/src/app/fonts/`. Buttons are
> small pills; index icon wells use 12px radii; depth comes from photographic light and
> restrained, text-local overlays rather than decorative shadows. Photo pixels
> stay unfiltered, and Next's optimized homepage images use quality 90.
>
> Desktop is an asymmetric image-led composition. At 767px and below the page
> uses a real four-link mobile navigation, 44px theme toggle, single-column index,
> stacked about section and wrapped copy with zero horizontal overflow. The
> about photograph masks into the page ground across its left 25% on desktop and
> top 12% on mobile, with no top or inset divider between copy and image. The hero
> fills the visible viewport (`100dvh` with fallback). Motion adds `motion/react`
> entry reveals for hero copy, section headings, the workspace index, quote and
> contact content. They reset the replay flag outside the viewport and replay in
> either scroll direction without fading any text out; the pre-observer and no-JS
> baseline stays visible. Theme cross-fades, arrow feedback, the scroll cue, a short Sun/Moon exchange and Skiper UI
> secondary-link underlines remain. Navigation stays static; spatial motion is reduced under
> reduced motion. `app/DESIGN.md` and
> `app/.impeccable/design.json` are the detailed token-bearing sources.
> The coast quote keeps separate, light-touch overlay strengths: the native dusk
> image is unfiltered, with very light right-side shading and localized text shadows
> for white type.
> The quote is right-aligned over the coast with shading strongest on the right.
> The second section is four ruled links to live Work Logs,
> Resources (including saved GitHub URLs), Notes/code ideas, and Tracker tasks.
> Small label text uses a separate contrast-safe `--pf-label` tone instead of
> the soft display tone; tablet navigation stays present through 1100px.

> ## Replaced banner palette — 2026-09-16 (historical)
>
> `app/src/app/banner/banner.css` holds a third, page-local palette: `--bn-*` on
> `.banner-page`, re-declared under `.dark .banner-page`. It exists because the
> supplied reference comps are a warm ivory studio / night studio, which is
> neither the app's slate+teal nor the marketing page's ink+violet. It is scoped,
> not global, and the banner's display sizes (`.bn-h1` and friends) are a
> `clamp()` inside that file — they are NOT added to the global type scale.
>
> `--bn-muted` deliberately departs from the comp: it was darkened to ~4.9:1
> because the comp's grey is 3.6:1 on the cream at 13px.
>
> The scene is a matched, deep-focus photographic pair: daylight
> (`scene-workspace-v3.png`) and a true night exposure
> (`scene-workspace-dark-v2.png`). Both keep the wall, desk and props optically
> crisp; the image layer is not scaled or blurred. Theme changes cross-fade the
> images, so dark mode is not a brightness filter over the daytime room.
> Navigation, copy, icons and controls are separate DOM/SVG layers. Dark mode
> uses a scoped teal/amber wash; control colours come from the `--bn-*` palette.
> Rationale in `decisions.md`.
> The photograph carries only two pieces of environmental lettering from the
> reference: gold “Better Workdays” on the notebook spine and cream handwritten
> “Good Notes Brighter Days” on the mug.
>
> Motion is owned by scoped GSAP timelines in `banner-motion.tsx`.
> Navigation is excluded completely and is visible immediately as stable page
> chrome. Hero eyebrow fades, heading uses a horizontal mask, lead resolves from
> a bounded blur, and actions use a restrained scale settle. Toolkit copy, hub
> lines, cards and closing content each use a different reveal material. Every
> section restarts on forward or backward re-entry and resets after leaving back;
> content is visible before hydration and `prefers-reduced-motion` skips motion.
>
> `/` and `/banner` render the same three-chapter experience: hero, connected toolkit, and closing
> landscape. The toolkit is a hub-and-spoke map on desktop and a
> compact two-column capability grid on mobile. Its icons come from Phosphor's
> React library and its surfaces use only deep emerald, clay and ochre variants
> of the existing scene palette; no unrelated pastel or neon accents.
>
> Every section and its meaningful children reveal through scoped GSAP scroll
> timelines with restrained staggers. Positioned hub cards use opacity-only
> reveals so animation cannot overwrite their layout transforms.
> Navigation remains explicitly static. Reduced motion skips all choreography.
>
> The closing landscape has separate generated sunrise and deep-teal night
> plates with identical composition. Copy and sign labels remain semantic HTML;
> the image contains no baked-in lettering. The closing copy is optically centered
> in the scene; board labels use self-hosted Bricolage Grotesque and individually
> tuned placement/rotation so each line sits on its wooden board. Login/register locally override the
> dark auth ramp to the same restrained emerald family (`#174f45` support field)
> and keep distinct returning-user versus new-workspace stories.

> ## Palette refresh — 2026-09-13 (dashboard/app shell)
>
> The UI/UX Pro Max `--design-system` query for a productivity workspace returned
> Flat Design: clean lines, no gradients, no decorative card shadows, and 150–200ms
> state transitions. Its dark-mode search informed the contrast requirements, but
> the product now uses a neutral charcoal ladder (`#0B0B0D`, `#141416`, `#1E1E22`,
> `#2A2A30`) with `#F5F5F6` foreground so dark mode does not read as blue-indigo.
> The app retains the product's blue identity for actions and status accents; the earlier pale-blue
> surfaces and near-black OLED dark mode made the work-log screens look washed out
> in light mode and too harsh in dark mode.
>
> `app/src/app/globals.css` is authoritative for the values below. The dashboard
> is now a concise working overview: today’s log first, a compact workspace count
> row, then active tickets. This supersedes the earlier empty-dashboard direction.
> Reuse these same semantic surfaces and avoid decorative cards that do not expose
> useful workspace data.
>
> ### Current app-shell palette
>
> | Token | Light | Dark | Use |
> |---|---|---|---|
> | `--c-bg` | `#FFFFFF` | `#101012` | page canvas |
> | `--c-surface` | `#FFFFFF` | `#15161A` | cards, lists, timeline panels |
> | `--c-surface-2` | `#EDF3F6` | `#1C1E23` | hover rows, inset wells |
> | `--c-surface-3` | `#DCE8ED` | `#282B31` | selected/pressed surfaces |
> | `--c-text` | `#101820` | `#F4F4F2` | headings and primary values |
> | `--c-text-muted` | `#4D5B66` | `#C2C6CC` | body copy and labels |
> | `--c-text-subtle` | `#5A6973` | `#9FA5AD` | timestamps and placeholders |
> | `--c-border` | `#C9D5DB` | `#3A3D45` | decorative dividers |
> | `--c-border-strong` | `#667680` | `#8D949D` | functional field/control edges |
> | `--c-primary` | `#397B8C` | `#83C2D1` | large fills, icons, accents |
> | `--c-primary-strong` | `#275C6B` | `#83C2D1` | normal-size links and CTA fills |
> | `--c-accent-text` | `#275C6B` | `#9FD8E4` | accessible links and accent labels |
> | `--c-primary-active` | `#244F5B` | `#71ACBA` | pressed state |
> | `--c-primary-subtle` | `#D7E9EF` | `#294753` | selected and supporting surfaces |
>
> White on `--c-primary-strong` remains the normal-label rule; `--c-primary` is
> reserved for large text, icons, decoration, and large fills. Status and priority
> hues remain unchanged so blue does not become ambiguous with ticket state.
>
> ### Component handoff rules
>
> - App shell: `bg-bg` canvas, `bg-surface` content panels, `bg-surface-2` for
>   hover/inset, one-pixel `border-border`; no nested white cards inside white cards.
> - Active nav: `bg-primary-subtle`, `text-primary-strong`, and the existing 3px
>   left rule; inactive items use `text-text-muted` and only gain a surface tint on
>   hover. Keep the label and icon aligned to the same 44px hit row on touch.
> - Work-log list/timeline: use a flat surface and one structural divider between
>   rows; reserve `surface-3` for selected/pressed rows, not every row background.
> - Dark mode: elevation comes from the surface ladder, not stacked shadows or
>   bright borders. Keep body copy at `text-text-muted` and functional edges at
>   `border-border-strong`.
> - Dashboard: keep today’s work as the primary card; counts and active tickets
>   are supporting information with flatter hierarchy and no decorative filler.
> - Typography: prefer Manrope and JetBrains Mono when installed, with Avenir Next
>   / system UI and SF Mono / Menlo fallbacks. Do not use `next/font/google`;
>   production builds must not depend on live font downloads.


> Owned by the UI Designer. Single source of truth for all visual values.
> Frontend dev: use these tokens only. No raw hex/px in components.
> Implemented in `app/src/app/globals.css` (Tailwind v4 `@theme inline`).
> Every value below was verified for contrast — actual ratios in §11.


> ## ⚠ PALETTE REVISED AGAIN — 2026-09-12 (supersedes the note below)
> The user supplied a reference site — **https://optlify.vercel.app** — and asked for its color
> combination across the entire product, all forms and all pages. Values were extracted from
> that site's live DOM, not eyeballed.
>
> **Light is now the primary theme** (the reference is light-only). Dark mode is retained as a
> dark variant of the same identity.
>
> | Token | Light | Dark | Source |
> |---|---|---|---|
> | `--bg` | `#F8FBFF` | `#060B14` | reference page ground |
> | `--surface` | `#FFFFFF` | `#0D1524` | reference cards |
> | `--surface-2` | `#F1F6FD` | `#141E30` | tinted panels |
> | `--surface-3` | `#DBE5F1` | `#1E2A40` | reference secondary border |
> | `--text` | `#0A1B33` | `#F5F9FF` | reference headings |
> | `--text-muted` | `#44546B` | `#9BAAC1` | reference body copy |
> | `--border` | `#E2E8F0` | `#202C42` | reference borders |
> | `--primary` | `#017EFD` | `#4DA3FF` | **the reference brand blue** |
> | `--primary-strong` | `#0166D0` | `#7CBBFF` | **added — see below** |
>
> **Font: Manrope** (extracted from the reference) for all UI. JetBrains Mono stays for ticket IDs.
>
> ### ⚠ The one place we deliberately deviate from the reference
> `#017EFD` measures **3.89:1 on white** — it FAILS WCAG AA (4.5:1) for normal-size text and for
> a white label on a blue fill. The reference site ships this failure. We do not.
>
> **Rule:** `--primary` (`#017EFD`) is for **large text and large fills only** — hero accent words,
> big CTA buttons (≥24px, or ≥18.66px bold), icons, rules, and decorative accents, where 3:1 applies.
> For **normal-size text** — links in body copy, small button labels, form helper links — use
> `--primary-strong` (`#0166D0`, 5.51:1). Same hue, same identity, actually readable.
>
> ### Status colors keep NO blue
> The brand color is now blue, so statuses must stay off blue or the UI turns ambiguous.
> In Progress stays **amber**, Waiting **violet**, Testing **magenta**. Do not revert these.
>
> `app/src/app/globals.css` is authoritative.


> ## ⚠ Superseded: PALETTE REVISED — 2026-09-12
> The Work Log refresh uses a softer middle-contrast canvas: light `#F1F4F8` /
> `#FAFBFD` and dark `#182235` / `#222E43`. Indigo remains the action anchor,
> with blue-slate text and borders so the interface does not feel stark white or
> black. The Work Log editor uses rounded field boxes, a two-column layout, and a
> sticky right-side progress summary.
> - Priority is now a warm heat ramp: grey → gold → orange → rose.
> - All ratios re-verified; worst badge in the system is Testing light at **5.46:1**.
>
> `app/src/app/globals.css` is authoritative. If a value below disagrees with it, the CSS wins.

---

## 0. Direction (sourced from `.claude/skills/ui-ux-pro-max/`)

**Style: Flat Design** (`styles.csv` → `flat-design`). Chosen over the runner-up
`dark-mode-oled` because Flat is the only active style whose `Best For` lists
"SaaS, dashboards, web apps" *and* supports light **and** dark. Its rules —
no gradients, no decorative shadows, typography-led hierarchy, 150–200ms
transitions — are exactly the Linear/Notion feel and they keep dense screens
readable. `dark-mode-oled` informed the dark theme but was **deliberately
softened**: it prescribes `#000000`, which on a desktop LCD during an 8-hour
session produces halation against white text. We use a deep slate `#09090B`.

**Anti-patterns taken from the skill and binding here:** no emoji as icons
(Lucide only), no gradient chrome, no drop-shadow on cards, no "complex
onboarding", no 0ms state changes.

**Palette:** synthesised from the skill's SaaS, IDE, and Micro SaaS references,
then tuned for a softer middle-contrast work surface: mist/slate light and dark
surfaces (`#F1F4F8` / `#FAFBFD`, `#182235` / `#222E43`) with indigo action
accents (`#5B5BD6` / `#9B9BFF`). Blue-slate text and transparent field edges keep
the UI from feeling stark white, black, or over-outlined.
- Rejected: the **Productivity Tool** teal/orange row (teal reads consumer-wellness,
  and its orange accent collides with the High-priority ramp) and the
  **Notes & Writing App** cream row (warm cream fights the dense-data grid).

**Typography:** a deliberate cross of two `typography.csv` pairings.
- **Inter** for all UI ← *"Modern Dark Cinema (Inter System)"*, whose `Best For`
  is literally "developer tools, high-end productivity apps". Tall x-height,
  real tabular numerals, holds up at 13px in a table.
- **JetBrains Mono** for code/IDs ← *"Developer Mono"*. Picked over Fira Code
  (*"Dashboard Data"*) because JetBrains Mono has the taller x-height and the
  unambiguous `0/O` `1/l/I` `5/S` shapes — non-negotiable when `ASU-1234` vs
  `ASU-I234` is a real failure mode in this app. Ligatures are switched **off**
  so nothing fuses inside a ticket ID.
- Rejected *"Developer Mono"*'s IBM Plex Sans body (corporate, wider, costs ~8%
  horizontal room per table row) and the all-mono *"Terminal CLI"* / *"Brutalist
  Raw"* pairings (unreadable for paragraph-length meeting notes).

---

## 1. How the tokens are organised

Two layers, on purpose:

1. **Raw tokens** `--c-*` on `:root` and `.dark` — the actual hex values.
2. **Tailwind theme** `@theme inline { --color-*: var(--c-*) }` — what generates
   utilities. `inline` is required so `.dark` overrides reach the utilities.

In components use the **Tailwind utility** (`bg-surface`, `text-text-muted`,
`border-border`). Use `var(--c-*)` only in raw CSS. Never write a hex.

**Dark mode toggles on `class="dark"` on `<html>`.** The custom variant is
already declared: `@custom-variant dark (&:where(.dark, .dark *))`. There is no
`prefers-color-scheme` media query — the toggle is the only switch, so the
frontend dev must read the system preference once and apply the class (with an
inline pre-hydration script to avoid a flash).

---

## 2. Color tokens — surfaces, text, lines

| Token | Light | Dark | Use |
|---|---|---|---|
| `--surface` → `bg-surface` | `#FAFBFD` | `#222E43` | cards, panels, table body, editor |
| `--bg` → `bg-bg` | `#F1F4F8` | `#182235` | app canvas behind cards, sidebar rail |
| `--surface-2` → `bg-surface-2` | `#E6ECF3` | `#2C3A52` | table header, inset wells, hover row |
| `--surface-3` → `bg-surface-3` | `#D8E0EB` | `#374963` | active/pressed row, selected nav item |
| `--overlay` | `rgba(15,23,42,.45)` | `rgba(2,6,16,.65)` | dialog scrim |
| `--text` → `text-text` | `#182033` | `#F8FAFC` | primary copy, headings, table values |
| `--text-muted` → `text-text-muted` | `#475569` | `#A3B0C2` | labels, secondary column, helper text |
| `--text-subtle` → `text-text-subtle` | `#738198` | `#8593A8` | timestamps, placeholders, counts |
| `--text-inverse` | `#F1F4F8` | `#182235` | text on a solid `--text`-colored fill |
| `--border` → `border-border` | `#D2DAE6` | `#3A4A62` | dividers, card outlines (decorative) |
| `--border-strong` → `border-border-strong` | `#9AA9BC` | `#7084A3` | **functional** edges: input, checkbox, toggle, radio |

> **Rule.** `--border` is decorative and intentionally below 3:1. Anything whose
> boundary carries meaning — an input's edge, an unchecked checkbox, a segmented
> control — must use `--border-strong`, which clears 3:1 on every surface.
>
> **In dark mode, elevation comes from lightness, not shadow.** Going
> `bg → surface → surface-2 → surface-3` is the elevation ladder. Do not stack
> drop shadows on dark panels.

## 3. Color tokens — brand & feedback

| Token | Light | Dark | Use |
|---|---|---|---|
| `--primary` | `#5B5BD6` | `#9B9BFF` | primary button fill, active nav, links |
| `--primary-hover` | `#4C4CC4` | `#B7B7FF` | hover |
| `--primary-active` | `#3F3FAE` | `#D0D0FF` | pressed |
| `--primary-fg` | `#FFFFFF` | `#182235` | label on a `--primary` fill |
| `--primary-subtle` | `#E9E9FF` | `#34345F` | selected row tint, ghost-button hover |
| `--danger` / `-fg` / `-subtle` | `#DC2626` / `#FFF` / `#FDE9E9` | `#F87171` / `#09090B` / `#3F1717` | destructive, validation errors |
| `--success` / `-fg` / `-subtle` | `#15803D` / `#FFF` / `#DFF4E4` | `#4ADE80` / `#09090B` / `#0C2E1B` | "Saved ✓", task completed |
| `--warning` / `-fg` / `-subtle` | `#B45309` / `#FFF` / `#FDF0D8` | `#FBBF24` / `#09090B` / `#3A2A08` | unsaved changes, overdue |
| `--info` / `-fg` / `-subtle` | `#0F766E` / `#FFF` / `#E6FAF6` | `#2DD4BF` / `#09090B` / `#0C2F2B` | neutral toasts, hints |
| `--ring` | `#0F766E` | `#5EEAD4` | focus ring (see §7) |

Accent orange from the skill's palettes is **not** adopted as a global accent —
in this app orange is spoken for by High priority. Indigo carries all action.

## 4. Ticket status colors (7 states)

Each status ships three tokens: `--status-X` (dot / left-rule accent),
`--status-X-bg` (badge fill), `--status-X-fg` (badge label).

| Status | Hue | Light fg / bg | Dark fg / bg |
|---|---|---|---|
| **Open** | cool grey | `#52525B` / `#F4F4F5` | `#CBD5E1` / `#232C3E` |
| **In Progress** | blue | `#92400E` / `#E6FAF6` | `#FCD34D` / `#0C2F2B` |
| **Blocked** | red | `#B91C1C` / `#FDE9E9` | `#FCA5A5` / `#3F1717` |
| **Waiting** | amber | `#92400E` / `#FDF0D8` | `#FCD34D` / `#3A2A08` |
| **Testing** | violet | `#A21CAF` / `#FBE9FB` | `#F0ABFC` / `#3B0D3D` |
| **Completed** | green | `#166534` / `#DFF4E4` | `#86EFAC` / `#0C2E1B` |
| **Closed** | warm grey | `#57534E` / `#EDEAE7` | `#D6D3D1` / `#2C2A28` |

Utilities: `bg-status-blocked-bg text-status-blocked-fg`, dot `bg-status-blocked`.

**Keeping the two greys apart (Open vs Closed).** Cool grey vs warm grey is not
enough on its own, so the badge *shape* also differs and this is mandatory:

- **Open** renders as an **outline badge** — transparent fill, `1px solid
  --status-open`, colored label. It reads "not started, nothing has happened".
- **Closed** renders as a **solid badge** — filled `--status-closed-bg`,
  label `--status-closed-fg`. It reads "settled, archived".
- Every other status renders solid-filled.

**Never color-only.** Every badge shows its text label. A status dot alone is
allowed only inside a row that repeats the label in an adjacent column or a
`title`/`aria-label`. Same rule for the ticket timeline.

## 5. Task priority colors (4 levels)

Priority is a **different visual language from status** — a 6px dot plus a text
label, never a filled pill — so it never competes with a status badge in the
same row.

| Priority | Light | Dark | `-bg` tint (light / dark) |
|---|---|---|---|
| **Low** | `#52525B` | `#94A3B8` | `#F4F4F5` / `#232C3E` |
| **Medium** | `#A16207` | `#D4A017` | `#E4F2FB` / `#0C2B3D` |
| **High** | `#C2410C` | `#FB923C` | `#FDEEE4` / `#3A230F` |
| **Urgent** | `#BE123C` | `#FB7185` | `#FDE8ED` / `#3D1421` |

Rationale: a rising-temperature ramp (grey → cyan → orange → rose) reads as an
ordinal scale at a glance. Urgent is **rose**, not the Blocked red, so an
Urgent task and a Blocked ticket never look identical side by side on the
dashboard. Only Urgent may use its `-bg` tint as a full row highlight.

---

## 6. Typography

- **UI / body:** Inter — `--font-sans`, via `var(--font-inter)`.
- **Mono:** JetBrains Mono — `--font-mono`, via `var(--font-jetbrains-mono)`.
- Weights in use: **400** body · **500** labels, table headers, nav ·
  **600** headings, badge labels, buttons · **700** page titles / metrics only.
  Never 300 (fails at 13px), never 800/900.
- `font-variant-numeric: tabular-nums` is on globally — dates and counts align
  in columns. Do not turn it off in tables.
- `font-feature-settings: "cv11","ss01"` (Inter's single-storey `l`, disambiguated
  `1`/`I`) — matters when ticket IDs sit in body text.
- Mono ligatures are **disabled** (`font-variant-ligatures: none`).

**Base size is 14px, not 16px.** This is a dense desktop tool; 16px costs roughly
one extra table row per screen. 15px (`text-md`) is used for anything read as
prose. Minimum is 12px; 11px is permitted **only** for uppercase micro-labels
with `+0.06em` tracking.

| Token | px | Line height | Use |
|---|---|---|---|
| `text-2xs` | 11 | 16 | uppercase section eyebrows only |
| `text-xs` | 12 | 18 | timestamps, meta, "Last saved 2 min ago" |
| `text-sm` | 13 | 20 | table cells, badges, sidebar items |
| `text-base` | **14** | 20 | app default body, form inputs, buttons |
| `text-md` | 15 | 24 | **long-form**: meeting notes, work-done text, note bodies |
| `text-lg` | 16 | 24 | card titles, section headings |
| `text-xl` | 18 | 26 | h3 |
| `text-2xl` | 20 | 28 | h2 |
| `text-3xl` | 24 | 32 | h1 / page title |
| `text-4xl` | 30 | 36 | dashboard metric numerals |
| `text-5xl` | 36 | 40 | auth screens only |

Line height: body/prose **1.5–1.6**, UI rows **1.4**, headings **1.2–1.3**.
Prose (`text-md`) gets `max-width: 72ch` — a work-log note running the full
1440px width is unreadable.

Tracking: `-0.01em` at 20px+, `0` at body sizes, `+0.06em` on uppercase 11px.

## 7. Spacing, radii, shadows, borders, focus

**Spacing** — 4px base (`--spacing: .25rem`), so Tailwind's `p-1 p-2 p-3 p-4 p-6
p-8 p-12 p-16` = 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. Use only those eight steps.
Odd steps (`p-5`, `p-7`, `p-10`) are available but should not appear —
if you reach for one, the layout is wrong.

**Radii** — `xs 3` (dots) · `sm 4` (badges, tags) · `md 6` (inputs, buttons, menu
items) · `lg 8` (cards, panels) · `xl 12` (dialogs, command palette) · `2xl 16`
(maximum — nothing rounder). `rounded-full` only for avatars and status dots.

**Borders** — 1px everywhere. Structure is carried by `border-border`, not by
shadow. The only 2px line in the system is the focus ring and the 3px left rule
on an active sidebar item / a ticket card's status accent.

**Shadows** — flat-first. Cards, tables, panels and the sidebar get **no shadow**;
they get a border. Shadows are reserved for things that float above the page:

| Token | Use |
|---|---|
| `shadow-xs` | sticky table header once the body scrolls under it |
| `shadow-sm` | ticket-search autocomplete results |
| `shadow-md` | dropdowns, popovers, date picker, toasts |
| `shadow-lg` | dialogs, command palette |

**Focus ring — one spec, no exceptions:**

```css
outline: 2px solid var(--c-ring);
outline-offset: 2px;
border-radius: var(--radius-sm);
```

Applied globally on `:focus-visible` in `globals.css`. Rules:
- Never `outline: none` without replacing it. `:focus:not(:focus-visible)` is
  already cleared for you, so mouse clicks don't show a ring.
- Every interactive control needs all five states: rest, hover, **focus-visible**,
  active, disabled. Disabled = `opacity: .5; cursor: not-allowed`, no color change.
- Clickable things get `cursor: pointer`.
- Sticky top nav must not cover a focused element — `scroll-padding-top` is set
  on `html`; keep it in sync if the nav height changes (WCAG 2.2 AA 2.4.11).
- Ticket status dropdowns, the ticket-ID search and the work-done textarea are
  the highest-traffic controls — they must be reachable and operable by keyboard
  end to end, no pointer.

**Motion** uses one shared rhythm:

| Token | Value | Use |
|---|---:|---|
| `--motion-fast` | 150ms | hover, press, icon and colour feedback |
| `--motion-state` | 200ms | menus, errors, selection changes |
| `--motion-reveal` | 350ms | marketing/auth component entrance only |
| `--motion-reveal-exit` | 180ms | reset a marketing reveal after it leaves the viewport |
| `--motion-section` | 400ms | marketing section transition only |
| `--motion-stagger` | 40ms | short lists, maximum 6 children |
| `--motion-reveal-y` | 12px | maximum vertical reveal offset |
| `--motion-reveal-scale` | 0.97 | optional start scale for cards/illustrations only |
| `--ease-out-quick` | `cubic-bezier(0.16, 1, 0.3, 1)` | compact UI entrance |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | state changes |
| `--ease-section` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | decelerating section/reveal motion (`power1.out`) |

Dense application UI remains at 150–200ms. The 350–400ms tokens are a scoped
marketing/auth exception for travelling between full-viewport sections and
revealing a major block; they must never delay input. Animate only `transform`
and `opacity`, never `width`/`height`/`top`/`left`. Every entrance must have a
fully visible final state without JavaScript, and `prefers-reduced-motion:
reduce` must disable smooth scrolling and render that final state immediately.

### Homepage interaction direction — three sections only

- The page remains exactly **Hero → How it works → Get started**. The document
  root is the **only** vertical scroll surface; never put these sections inside
  a nested `overflow-y` scroller. Use root-scoped `scroll-snap-type: y mandatory`,
  `scroll-snap-align: start`, and `scroll-snap-stop: always` on exactly the three
  `min-height: 100dvh` sections. Do not apply snapping to authenticated routes or
  auth forms.
- Anchor navigation keeps the real hashes `#top`, `#how-it-works`, `#start` and
  uses native `scroll-behavior: smooth`. Links must scroll both forward and back
  to the document's section boundary. The reduced-motion branch is `auto`.
- Desktop section links are geometrically centred in the whole nav pill, not
  merely in the leftover space between logo and actions. Use a three-column
  grid: `1fr auto 1fr`; logo left, links centre, account actions right.
- Active section state is **brand-blue text + 2px underline/pill indicator +
  semibold weight**. Colour alone is insufficient. Set `aria-current="location"`
  on the active link. The indicator moves with `--motion-state` and
  `--ease-standard`; click/press feedback uses `--motion-fast`.
- Every major text block, CTA group, illustration, card and section heading
  replays when it re-enters the viewport in **either scroll direction**. Use one
  scoped `IntersectionObserver` (`threshold: 0.18`, root margin approximately
  `-10% 0 -15%`) which adds an in-view state on entry and removes it on exit.
  Group a short headline's words under one observed parent; do not observe every
  word independently.
- Content is fully visible by default. Only a post-hydration root motion-ready
  flag may apply the hidden/offset start state, so no JavaScript failure can
  strand content invisible. Enter over `--motion-reveal`; reset after exit over
  `--motion-reveal-exit`. Use only opacity and translate up to
  `--motion-reveal-y`; cards/illustrations may also start at
  `--motion-reveal-scale`. Three sibling cards stagger by `--motion-stagger`.
- Delete continuous scroll timelines, scrub/pin effects, parallax, animation
  loops and permanently applied `will-change`. Do not animate blur, filters,
  backgrounds or layout properties. The observer changes state only at viewport
  boundaries; CSS performs the compositor-only transition.
- Section colour transition stays within the existing palette: Hero
  `--bg` + `--primary-subtle` decoration; How it works `--surface`; Get started
  `--primary-subtle` with `--surface` CTA/card. No new palette and no gradients.
- Background design is static and low-cost: a faint token-coloured dot/ruled
  grid plus two or three clipped outline rings or solid geometric shapes per
  section at 6–12% primary opacity. It is `aria-hidden`, pointer-events none and
  behind content. No blurred mega-orbs, drifting layers, video, canvas or motion.

### Auth content and differentiation

- Login and registration share the restrained emerald tokens but **not the same
  composition or repeated checklist**. Login is a hard split at `lg`: the left
  side is a returning-user day snapshot with a progress ring and latest-log
  object; the right side is the minimal credential form. On smaller screens the
  snapshot disappears so the returning-user action remains immediate.
- Registration is an emerald creation canvas with a floating surface card. Its
  supporting visual is a connected map—Private, Daily, Permanent—around a
  fingerprint hub. It is spatial onboarding, not a numbered list or a clone of
  login. On smaller screens the map disappears while the form card retains the
  creation-canvas identity.
- Remove all placeholder quotes, reviewer names/roles, fake testimonials and
  generic repeated product paragraphs. Supporting content must be useful and
  page-specific; neither route repeats the homepage verbatim.
- Keep the existing 44px auth controls, visible labels, inline errors, password
  manager/paste support, and focus-to-first-error behavior. Form entrance uses
  `--motion-reveal` once; field/error state changes use `--motion-state`.

## 8. Breakpoints

Exactly four. Tailwind's `sm` and `2xl` are removed on purpose.

| Variant | Width | Layout |
|---|---|---|
| *(base)* | **360** | single column, sidebar off-canvas as a drawer, tables become stacked cards, top nav collapses search into an icon |
| `md:` | **768** | two-column dashboard cards, sidebar still off-canvas, tables scroll horizontally inside their own container |
| `lg:` | **1024** | sidebar docked (collapsible to a 56px icon rail), full table columns, work-log editor gets its side panel |
| `xl:` | **1440** | content max-width ~1360px centered; extra width becomes gutter, **not** wider text columns |

Desktop-primary, but no horizontal page scroll at 360px — ever. Wide tables
scroll inside an `overflow-x-auto` wrapper, never the body.

## 9. Density — how tight is too tight

This is the part that makes it a tool and not an admin panel. Targets:

| Element | Value |
|---|---|
| Table / list row height | **36px** default, 32px minimum, 44px comfortable |
| Row vertical padding | 8px (`py-2`) |
| Cell horizontal padding | 12px (`px-3`), 16px for the first and last column |
| Input / select / button height | **32px** (`h-8`), 36px for primary actions |
| Badge | 20px tall, `px-2`, 13px/500 label |
| Card padding | **16px** (`p-4`); 24px only for the work-log editor and empty states |
| Gap between cards | 12px (`gap-3`) |
| Gap between page sections | 24px (`gap-6`) |
| Sidebar item | 32px tall, 8px vertical gap between groups |
| Icon in a row | 16px; 20px in the sidebar; 14px inside a badge |

**Too tight — hard floors, do not cross:**
- Row height below **32px**. Below that, scanning accuracy drops and the row is
  a click target.
- Any click target below **32×32px** on desktop or **44×44px** on touch, and
  fewer than **8px** between adjacent targets. A 24px icon button in a dense
  table row is a bug.
- Body text below **12px**, or line-height below **1.4** on multi-line text.
- Card padding below **12px**, or content touching a card edge.
- More than **7 columns** visible in a table at 1024px. Push the rest behind a
  column toggle or a hover-reveal.
- Two interactive controls in the same row with no separator and less than 8px
  between them.

**Breathing room is where meaning changes.** Rows inside one group stay tight
(36px, no gap); the gap between *groups* — one date's work log vs the next, one
ticket card vs the next — is 12–24px. Dense within a unit, generous between
units. That is the whole trick.

**Zebra striping is banned.** Separate rows with `border-border` hairlines.
Hover = `bg-surface-2`, selected = `bg-primary-subtle` + a 3px `--primary`
left rule.

## 10. Component-level rules (for the frontend dev)

- **Ticket IDs are always `font-mono`**, at `text-sm`, weight 500. Everywhere:
  tables, badges, timeline, search results, breadcrumbs.
- **Ticket status badge**: `rounded-sm`, 20px tall, `px-2`, `text-sm/500`,
  status `-bg`/`-fg` pair, plus the Open-outline / Closed-solid rule in §4.
- **Ticket card in the work-log editor** carries a 3px left rule in
  `--status-X` — the status is readable from the page edge while scrolling.
- **Timeline** (ticket history): `--border` vertical rule, a `--status-X` dot per
  entry, date in `text-xs text-text-subtle`, description in `text-md`.
- **Autosave indicator**: idle `text-text-subtle`, saving `text-text-muted`,
  saved `text-success`. Text only, no spinner larger than 14px, never a toast —
  it fires too often.
- **Toasts** (sonner) bottom-right, `shadow-md`, `rounded-lg`, max 2 stacked.
- **Empty states** get 24px padding, a 20px muted Lucide icon, one line of
  `text-md text-text-muted`, and one primary action.
- Icons: **Lucide only**. No emoji as icons, anywhere.
- Icon-only buttons require `aria-label`; decorative icons get `aria-hidden`.

## 11. Verified contrast (computed, WCAG 2.1 relative luminance)

Body text target ≥ 4.5:1, borders/large text ≥ 3:1. **All pairs pass.**

**Light**
| Pair | Ratio |
|---|---|
| `--text` on `--surface` | **17.85:1** |
| `--text` on `--bg` | 17.06:1 |
| `--text` on `--surface-2` / `--surface-3` | 16.30:1 / 15.18:1 |
| `--text-muted` on `--surface` | **7.58:1** |
| `--text-muted` on `--bg` / `--surface-2` / `--surface-3` | 7.24 / 6.92 / 6.44:1 |
| `--text-subtle` on `--surface` / `--bg` / `--surface-2` | 5.44 / 5.20 / **4.97:1** |
| `--primary` on `--surface` / `--bg` | 6.29 / 6.01:1 |
| `--primary-fg` on `--primary` | 6.29:1 |
| `--primary` on `--primary-subtle` | 5.62:1 |
| `--border-strong` on surface / bg / s-2 / s-3 | 3.57 / 3.41 / 3.26 / **3.04:1** |
| `--ring` on bg / surface / surface-2 | 6.01 / 6.29 / 5.74:1 |
| danger / success / warning / info on `--surface` | 4.83 / 5.02 / 5.02 / 5.17:1 |

**Dark**
| Pair | Ratio |
|---|---|
| `--text` on `--surface` | **16.62:1** |
| `--text` on `--bg` | 18.00:1 |
| `--text` on `--surface-2` / `--surface-3` | 14.98 / 12.77:1 |
| `--text-muted` on `--surface` | **7.90:1** |
| `--text-muted` on `--bg` / `--surface-2` / `--surface-3` | 8.56 / 7.12 / 6.07:1 |
| `--text-subtle` on `--surface` / `--bg` / `--surface-2` | 5.58 / 6.04 / 5.03:1 |
| `--primary` on `--surface` / `--bg` | 5.83 / 6.31:1 |
| `--primary-fg` on `--primary` | 6.31:1 |
| `--primary` on `--primary-subtle` | 5.36:1 |
| `--border-strong` on surface / bg / s-2 / s-3 | 4.25 / 4.61 / 3.83 / **3.27:1** |
| `--ring` on bg / surface / surface-2 | 9.45 / 8.72 / 7.86:1 |
| danger / success / warning / info on `--surface` | 6.28 / 9.98 / 10.41 / 6.84:1 |

**Status badge label on its own fill** (light / dark)
Open 6.92 / 9.42 · In Progress 5.75 / 8.27 · Blocked 5.55 / 8.22 ·
Waiting 6.29 / 9.62 · Testing 6.02 / 8.29 · Completed 6.18 / 10.52 ·
Closed 6.37 / 9.60. **Lowest in the system: 5.55:1.**

**Priority label on `--surface` / `--bg`** (light | dark)
Low 7.58 / 7.24 | 6.78 / 7.34 · Medium 5.93 / 5.67 | 8.12 / 8.79 ·
High 5.18 / **4.95** | 7.68 / 8.32 · Urgent 6.29 / 6.01 | 6.46 / 7.00.

`--border` (`#E4E4E7` / `#2A2A30`) is **1.23:1 / 1.35:1** — intentional, it is a
decorative divider. Meaningful boundaries must use `--border-strong`.

## 12. Rules
- Body text contrast ≥ 4.5:1, large text & functional borders ≥ 3:1.
- Every interactive element has hover, focus-visible, active, disabled.
- No raw hex or arbitrary px in components. One type scale, one spacing scale.
- Never signal state by color alone — always a label, an icon, or a shape change.
- `prefers-reduced-motion` is respected. Dense app motion stays at or below
  200ms; only marketing/auth entrances may use the scoped 350–400ms tokens.

---

## 2026-09-14 — Palette + type revision (teal on graphite, Plus Jakarta Sans)

**Brand ramp — teal.** From `ui-ux-pro-max` `colors.csv`, the Productivity Tool row.

| Token | Light | Dark |
|---|---|---|
| `--c-primary` | `#0d9488` | `#2dd4bf` |
| `--c-primary-strong` (text/fill) | `#0f766e` (5.3:1 on white) | `#14b8a6` |
| `--c-primary-hover` | `#0f766e` | `#2dd4bf` |
| `--c-primary-active` | `#115e59` | `#5eead4` |
| `--c-primary-fg` | `#ffffff` | `#042f2c` — near-black on bright teal |
| `--c-primary-subtle` | `#ccfbf1` | `#134e4a` |
| `--c-accent-text` | `#0f766e` | `#5eead4` |
| `--c-ring` | `#0f766e` | `#5eead4` |

The dark theme inverts the label rather than the fill: white on a mid-tone teal
never cleared AA, near-black on a bright teal clears it comfortably.

**Sidebar chrome — its own family, dark in BOTH themes.** `--c-sidebar` `#0f1115`,
`-2` `#191c23` (hover), `-3` `#232730` (pressed), `-fg` `#f3f5f7`, `-muted`
`#a1a9b8`, `-subtle` `#737d8e`, `-border` `#23272f`, `-accent` `#2dd4bf`,
`-accent-bg` `rgba(45,212,191,.14)`. **Never wire these to `.dark`.** The rail is
identity, not a surface. Anything that lives on it (currently `ThemeToggle`)
needs a `tone="sidebar"` variant rather than surface tokens.

**Type — Plus Jakarta Sans + JetBrains Mono.** From `typography.csv`
("Neumorphism Mobile" row: geometric sans, Best For = minimal tools / dashboards).
Loaded with `next/font` in `layout.tsx` as `--font-jakarta` / `--font-jetbrains-mono`.

> Before this, `--font-sans` named "Manrope" but **nothing loaded it** — the whole
> app had been rendering in the system fallback. Every density value in §9 was
> therefore tuned against the wrong face; re-measure before trusting them.

**Two faces, and only two (settled 2026-09-16).** A display serif (Instrument
Serif, as a `--font-display` token) was added for the marketing hero's second
headline line and then REMOVED: the accent is carried by weight and slope in the
same family instead — `font-light` (300) + real `italic` at `primary-strong`,
against `font-extrabold` (800) roman on the line above. That is enough contrast at
52-72px without a third family in the product. Do not reintroduce a serif.

**Jakarta's italic file is loaded** (`style: ["normal", "italic"]` in `layout.tsx`)
for that one span. Without it the browser synthesises an oblique by shearing the
roman, which is obvious at headline size. Nothing in the app UI sets `italic`, so
the second variable file is only fetched on pages that use it.

Inter's `font-feature-settings: "cv11","ss01"` was removed with Inter.
`tabular-nums` stays — columns of dates and counts must still align.

**Motion — scroll-driven reveals.** `.scroll-reveal` (sections) and
`.scroll-reveal-item` (list children) run on `animation-timeline: view()`, inside
an `@supports` + `prefers-reduced-motion: no-preference` guard so unsupported
browsers render the resting state. Keyframes animate `translate`/`scale`, not
`transform`, so `.motion-lift`'s hover transform still composes.

## Breakpoints — there is no `sm` (recorded 2026-09-16)

`globals.css` resets Tailwind's set (`--breakpoint-*: initial`) and defines only:

| Name | Value | px |
|---|---|---|
| `xs` | 22.5rem | 360 |
| `md` | 48rem | 768 |
| `lg` | 64rem | 1024 |
| `xl` | 90rem | 1440 |

`sm:` and `2xl:` **do not exist**. They compile to nothing and throw no error, so a
`sm:flex-row` looks right in the markup and silently never applies. Note `xl` is
1440, not Tailwind's 1280. When a responsive utility appears to do nothing, check
the emitted CSS for the `@media (min-width: ...)` block before debugging anything else.

## Marketing world — "The Commit Graph" (2026-09-16, REPLACED the hero banner)

The public marketing pages now run a **separate visual world** from the app. The
short version is below; `app/DESIGN.md` is the authority for its tokens.

**Scoping mechanism.** `.marketing-document` (and `.dark .marketing-document`)
redefine the `--c-*` RAW tokens. `@theme inline` resolves `var()` at the use
site, so every existing utility — `bg-bg`, `text-text`, `bg-primary` — renders
the marketing world inside that wrapper and the incumbent teal everywhere else.
Two complete systems coexist in `globals.css` deliberately. Do not merge them.

**Identity.** Ink ground with a violet cast (`#13111c` dark, `#f3f2f6` light),
a plotter-lime addition accent, a commit spine down every page, diff-gutter `+`
marks, and a deletion red used EXACTLY once — struck, resolving — because the
product has no delete. World-specific tokens are prefixed `--m-`.

**Type, marketing only.** Bricolage Grotesque (`.m-display`), Archivo (body),
Martian Mono (`.m-data`). `.m-data` is for REAL DATA ONLY: ids, dates, counts,
git-ref labels, diff notation. Display must never be the monospace — mono as a
costume for "technical" is a craft-floor refusal, and claiming that exemption
then spending it on nav links is how the first build failed review.

**One authored moment.** The spine drawing itself as each section enters. Nothing
else on the page has an entrance. The straight rail draws in LAYOUT space
(`scaleY(0->1)` from `transform-origin: top` on a `view()` timeline); only the
merge curve uses an SVG dash-draw. See decisions.md for why — `non-scaling-stroke`
defeats `pathLength`, and it cost a full review round.

**Elevation is declared once**, as a border, with no shadow under it.

The previous hero banner (full-bleed illustration + gradient masks) and its
`.hero-*` CSS were deleted in this pass; `hero-banner.tsx` is gone.

## Breakpoints — there is no `sm` (recorded 2026-09-16)

`globals.css` resets Tailwind's set (`--breakpoint-*: initial`) and defines only:

| Name | Value | px |
|---|---|---|
| `xs` | 22.5rem | 360 |
| `md` | 48rem | 768 |
| `lg` | 64rem | 1024 |
| `xl` | 90rem | 1440 |

`sm:` and `2xl:` **do not exist**. They compile to nothing and throw no error, so a
`sm:flex-row` looks right in the markup and silently never applies. Note `xl` is
1440, not Tailwind's 1280. When a responsive utility appears to do nothing, check
the emitted CSS for the `@media (min-width: ...)` block before debugging anything else.

## Homepage hero banner (2026-09-16)

`components/marketing/hero-banner.tsx` — full-bleed, `min-h-dvh`, its own gutters
(`px-6 md:px-12 lg:px-16`), NOT inside `Container`. Copy column capped at 38rem;
the illustration is anchored bottom-right and bleeds off the right and bottom edges.

Readability comes from three gradient masks, all built on `--c-bg` so they theme —
never restate them as hex. They live in `globals.css` as `.hero-mask-left`
(`lg:w-[58%]`, opaque to 45%, gone by 100%; a heavier full-width scrim under `lg`),
`.hero-mask-top` (`h-48 md:h-56 lg:h-64`, frames the nav pill) and
`.hero-mask-bottom` (`h-32 md:h-40 lg:h-48`). The centre-right stays clear.

Motion is CSS only, no client component: `.hero-art` drifts 0.75rem over 12s, and
`.hero-arrow` moves 2px on `.hero-cta` hover (motion.csv row 1's sub-2px rule).
Both are off under `prefers-reduced-motion`.

**Scale is the thing that makes it read as a banner.** A first pass kept the
artwork inside the frame (`lg:h-[86%]`, bottom-aligned) and the headline on the
stepped scale (`text-5xl md:text-6xl xl:text-7xl`), and the result was
indistinguishable from the two-column hero it replaced. What fixed it: the artwork
oversized to `lg:h-[104%] w-[62%]` and pushed past BOTH the right and bottom edges
(`right-[-6%] bottom-[-6%]`, the bottom mask eating the crop), and the headline
moved off the scale to a fluid `clamp(2.625rem, 5.2vw, 4.5rem)` at `leading-[1]`
and `tracking-[-0.03em]`. The copy column is `lg:max-w-[44rem]` — sized so
"Write the day down" sets on ONE line at desktop, with the italic accent line
under it, matching the reference's two-line block; the paragraph keeps its own
`max-w-[44ch]` so widening the column did not lengthen the body measure.

## Homepage step illustrations (2026-09-16)

`app/public/Images/` — the three "how it works" step assets are flat SVGs on the **teal** ramp:

| File | Step | Brand accent |
|---|---|---|
| `meeting-notes-cards.svg` | 01 Open today's log | `#0D9488` |
| `ticket-history-timeline.svg` | 02 Type a ticket ID | `#0D9488` |
| `checklist-cards.svg` | 03 Say what you did | `#0D9488` |

They are loaded through `next/image`, so **they cannot read CSS variables** — the teal is
hardcoded to the light-theme token and does not flip in dark mode. If you add or edit one:

- brand accent is `#0D9488`; the tinted "active card" fill is `#F4FCFA`; card edges `#E2E8F0`
- text-like bars use `#0F172A` at low opacity, never a raw navy
- **status tints stay semantic** — `#FDE9E9` (blocked), `#FDF0D8` (waiting), `#F1F5F9` (open)
  are the `status-*-bg` tokens and must not be repainted teal
- no blue. `#017EFD` and its family are dead in this project (see decisions.md 2026-09-16)

`checklist-cards.png` is the retired soft-3D raster for step 03. It is unreferenced — do not
wire it back in; it carries baked-in blue and does not match the flat set.

## Dashboard command-centre system (2026-09-19)

2026-09-20 revision: The authenticated homepage-aligned treatment uses a flat graphite Today card with a normal token border—no colored bottom/right edge or ornamental circles. Its action is a light inverse pill. The adjacent Focus card uses the subdued surface token with a compact, left-aligned empty state rather than a large centered badge. The authenticated nav is an opaque paper/graphite sticky surface with a bottom rule, so scrolling content is concealed underneath while active navigation and focus remain legible. Section and library cards receive a subtle GSAP entrance (12px, 0.42s, no blur); defaults stay visible and reduced-motion disables it.

2026-09-21 revision: every authenticated route now uses the cooler shared slate/blue ramp rather than dusty brown: light `surface-2 #edf3f6`, `surface-3 #dce8ed`, `primary #397b8c`, strong accent `#275c6b`; dark `bg #101012`, `surface #15161a`, `surface-2 #1c1e23`, `surface-3 #282b31`, `primary #83c2d1`. Dashboard Today remains a full-width feature using the paired `worklog-{light,dark}.webp` notebook photos with one left-aligned copy, metrics, and action block; it has no date badge or enclosing card border. Focus is the single tinted supporting card; Sprint and Recent are open, ruled sections instead of repeated filled panels. Notes, Resources, and Sprint logs are bordered shortcut actions with live counts and arrow affordances. Sprint's data-derived SVG bars and real recent-update count stay intact.

`/dashboard` is an asymmetric bento hierarchy rather than a grid of equal white
boxes. The dominant Today panel reuses the app shell's graphite material and
teal bottom/right edge, so the signed-in product visibly belongs to the public
site without importing the banner palette. Focus queue sits beside it; Sprint
momentum and the ticket workflow share one analytical panel; recent ticket work
is a vertical activity trail. Notes, Resources and sprint logs remain a quiet
three-link dock below the main grid.

- Today is the only dark/loud panel and contains the primary action.
- Teal marks action/current state; semantic danger marks overdue work. No new hue.
- Secondary panels remain token surfaces with borders and no decorative shadow.
- Empty states use one meaningful visual object plus concise copy—not dashed boxes.
- Responsive order follows urgency: greeting, Today, focus, momentum, activity,
  library. The 12-column desktop grid collapses cleanly to one column.

The latest dashboard pass keeps the greeting editorial (5xl/6xl heading with a
larger supporting line) and turns Notes, Resources, and Sprint logs into
bordered shortcut actions with live counts and arrow affordances. All
authenticated pages share the cool slate tokens; dark mode uses `#101012` as
the canvas with graphite card shades (`#15161a`, `#1c1e23`, `#282b31`).

The Today feature now uses the clear paired notebook photographs with a soft
left-to-right text blend rather than a hard split. The public About section is
pure white in light mode and uses the same near-black card tone as the lower
dark bands in dark mode.

Work-log detail pages inherit the same cool-white/blue-slate light tokens and
`#101012` graphite dark tokens as the full authenticated app. Their
timeline is an open ruled document with soft tonal event rows; one borderless
summary rail replaces the former stack of nested bordered cards and shadows.

### Unused half of the chosen palette

The ui-ux-pro-max "Productivity Tool" profile this project picked is **teal
focus + action orange `#EA580C`**. Only the teal half was ever tokenised —
there is no `--c-accent` / action colour in `globals.css`. That is currently
fine (the page needs restraint, not more colour), but if a second accent is
ever wanted for the single primary CTA, `#EA580C` is the palette-sanctioned
value rather than a new invention. Adding it is a brand decision, not a
component one.

### Work-log capture surface (2026-09-22)

The work-log editor is an open editorial document rather than a grid of tinted
cards: editable title and date lead the page, Daily anchors use two ruled columns
at desktop and one column on mobile, Ticket work is separated by a single rule,
and the summary remains one quiet tonal rail. Use the authenticated app's shared
cool daylight/graphite tokens only. Rich-text controls are compact 32px desktop
toolbar actions inside a 44px-high toolbar region; the editable prose is
`text-md`, 1.65 line height, and uses the shared focus ring. Formatting is stored
as Markdown but shown WYSIWYG. Status meaning must use a labelled badge/select,
not a thick colored card edge.

2026-09-22 revision: the earlier two-column meeting-editor grid is superseded.
Meeting capture is master-detail: compact selectors form a left rail at `lg` and
a two-column choice grid below `lg`; one selected meeting owns the only visible
writing canvas. The canvas uses a strong functional border, white/graphite input
ground distinct from its surroundings, persistent field label, visible caret,
and focus ring. The command header is a light bordered surface with a pale tonal
metric strip; it groups editable title, date, save state, meeting progress, ticket
count, and timeline action without introducing a dark block. The selected meeting
uses `primary-subtle` plus a one-pixel `primary` edge instead of graphite. Ticket
work follows as the next full-width stage; there is no detached Work captured
sidebar on the editor.

### Ticket management surface (2026-09-23)

The UI/UX Pro Max search supported a dense dashboard treatment, labelled native
status controls, and explicit loading/success/error feedback. The project-wide
flat authenticated system overrides its generic glass recommendation: `/tickets`
uses the existing cool daylight/graphite semantic tokens, ruled rows, and no new
palette, typeface, blur, or resting shadow. Search and status filters sit above
one responsive ticket index. Every editable title and status has a visible label,
44px mobile-friendly control height, disabled/loading behavior during saves, and
an inline polite status message. Latest work-log content is visibly read-only and
separated by a rule so direct ticket metadata cannot be mistaken for historical
work-entry editing.

## App palette (2026-09-24, user-supplied) — ALL signed-in pages
Set on `.app-shell` in globals.css (homepage, login, register untouched). **Page bg is white only. NO GREY anywhere** (user rule) — every fill, border and hover is a tint of teal #3c6e71 or navy #284b63. Tokens: surface #fff, surface-2 #f1f6f6, surface-3 #dfebec, card #ffffff (tints via card-tint/card-navy), border #8fb1b4, border-strong #5f8587, primary #3c6e71, primary-subtle #d3e3e4, accent-text/primary-strong #284b63, buttons `--c-sidebar` #284b63, text #353535 / muted #414141 / subtle #555555. Neutral status/priority chips retinted navy (#e3ebf1). Dark mode is navy-based (#0e1a22 bg).

## Cards & components (2026-09-24, user rules)
- Palette = #3c6e71 teal, #284b63 navy, #353535 charcoal + their shades. Page bg white.
- Cards white by default with a teal-shade border (`--c-border` #8fb1b4). Tinted fill only for emphasis: `bg-card-tint` (teal #e9f1f1) / `bg-card-navy` (#e7edf2). Used on: dashboard Today (tint), dashboard Focus (navy), Create-a-work-log form (navy).
- **Don't make everything a card.** Use ruled lists (`divide-y`), table rows with a navy (`bg-sidebar`) header row, border-l rails, meta lines with border-y. Work-log timeline, sprint list and timeline sidebar follow this.
- No card header bars.
- Badges must be clearly visible: `TicketStatusBadge` = solid pill (InProgress teal `bg-primary`, SentToQA purple, ReadyForProduction amber, Released navy `bg-sidebar`, Done green) with white label + dot. Generic `Badge` = rounded-full, tinted fill + tone-colour border, semibold.

## Breakpoints gotcha
`globals.css` defines only `xs` (360), `md` (768), `lg` (1024), `xl` (1440) — **there is no `sm`**, so `sm:` classes silently do nothing. Use `md:` / `xs:`.

- Dashboard hero = full-viewport, full-bleed banner; the nav is transparent on top of it (fades solid over 160px of scroll via `animation-timeline: scroll(root)`). Photo = user-supplied `dashboard-desk-cool.webp` (cool white desk, plant, mug), **no colour overlay/grading** (user rejected a teal-graded version and an SVG illustration). Light banner bg = photo-sampled #e0e8e5, dividers #b3c7c3. Photo sits on the right 60% (md+) / as a band below the text (phones) framed at 100% 55% so its light wall meets the banner, with an eased multi-stop fade over the first third (md+) / 3rem top edge (phones). Blend must be seamless but not wash the whole image (user).
