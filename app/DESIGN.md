---
name: Personal Workspace — The Quiet Studio
description: A cinematic, photo-led editorial world for the public homepage, scoped to `.portfolio-page`; the authenticated product keeps its own established UI system.
colors:
  warm-paper: "#f6f5f2"
  midnight-paper: "#101214"
  warm-surface: "#fdfcf9"
  midnight-surface: "#14171a"
  warm-surface-2: "#eceae5"
  midnight-surface-2: "#1c2024"
  ink: "#11151b"
  chalk: "#f4f4f2"
  muted-ink: "#5d626b"
  muted-chalk: "#bec1c5"
  soft-ink: "#a0a3aa"
  soft-chalk: "#898d93"
  label-ink: "#646a72"
  label-chalk: "#b5b9bf"
  rule: "rgba(17, 21, 27, 0.18)"
  rule-dark: "rgba(255, 255, 255, 0.14)"
  rule-strong: "rgba(17, 21, 27, 0.56)"
  rule-strong-dark: "rgba(255, 255, 255, 0.66)"
  inverse: "#f8f8f6"
  action-light: "#171a20"
  action-dark: "#f4f4f2"
  action-fg-light: "#ffffff"
  action-fg-dark: "#111317"
  photo-card: "#121418"
  photo-card-dark: "#0d0f11"
  focus-light: "#5f5b55"
  focus-dark: "#d5b38a"
  selection-light: "#ddd2c4"
  selection-dark: "#6b5136"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3.8rem, 6vw, 6.55rem)"
    fontWeight: 750
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 3.5vw, 3.35rem)"
    fontWeight: 700
    lineHeight: 1.03
    letterSpacing: "-0.04em"
  title:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.55rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.28em"
  quote:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.4rem, 4.3vw, 4.35rem)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.025em"
rounded:
  focus: "4px"
  card: "8px"
  icon: "12px"
  pill: "9999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "20px"
  6: "24px"
  8: "32px"
  10: "40px"
  14: "56px"
  18: "72px"
components:
  button-solid:
    backgroundColor: "{colors.action-light}"
    textColor: "{colors.action-fg-light}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "46px"
  button-solid-dark:
    backgroundColor: "{colors.action-dark}"
    textColor: "{colors.action-fg-dark}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "46px"
  theme-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "44px"
  workspace-index-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    iconSize: "48px"
    minHeight: "104px"
---

# Design System: Personal Workspace — The Quiet Studio

## Overview

**Creative North Star: "The Quiet Studio"**

The public homepage is a cinematic editorial portrait of a personal working life. It pairs generous, asymmetrical type with real photographic atmosphere: a focused desk anchors the opening viewport, a ruled workspace index leads directly to live areas, a borderless split about section shifts the rhythm, and a coast image gives the serif quote a quiet closing breath. Content, controls, and icons remain semantic DOM layered over separate image assets; the page is never a flattened screenshot.

Night is the canonical art direction. Every daylight photograph is a lighting-only edit of its dark source, preserving the same subject, identity, pose, crop, geometry, and focal point before the pair is cross-faded by the existing theme state. The palette follows that imagery with warm paper and near-black in daylight, then graphite and chalk after dark. The design is expressive but restrained: compact navigation, heavy sans display type, a muted second headline line, one italic studio note, pill actions, fine rules, and very little decoration beyond photography.

**This world is scoped to the public homepage and its `/banner` review route only.** Its boundary is `.portfolio-page`, implemented in `src/app/banner/banner.css`. The authenticated app keeps its established tokens, components, density, and teal product language. Do not harmonize the systems or export homepage variables into authenticated screens.

**Key Characteristics:**

- Asymmetric, photo-led hero with editorial type placed in the quiet side of the image.
- Paired daylight and night photography for every major image-bearing region.
- Warm-neutral monochrome palettes with no homepage brand accent competing with the photographs.
- Heavy Plus Jakarta Sans display type with a muted second line; Cormorant Garamond is reserved for the coast quote.
- Full-pill actions and theme control; index icon wells remain gently squared.
- A four-destination workspace index, a borderless split about image, a brighter right-set quote band, and a centered contact/footer close.
- Semantic HTML and separate images at every layer; never a screenshot of composed text or controls.

## Colors

The homepage is almost monochrome so light, landscape, and skin tones in the photography provide the colour. Each neutral role has an intentional daylight and night value.

### Primary

- **Ink / Chalk** (`{colors.ink}` / `{colors.chalk}`): the primary text pair for headings, navigation, body copy, and brand. The reversal is crisp without becoming absolute black versus pure white.
- **Action Reversal** (`{colors.action-light}` with `{colors.action-fg-light}` / `{colors.action-dark}` with `{colors.action-fg-dark}`): the solid CTA is a direct foreground/background reversal. It is the strongest non-photographic contrast on the page.

### Neutral

- **Warm Paper / Midnight Paper** (`{colors.warm-paper}` / `{colors.midnight-paper}`): the homepage ground and the color mixed into hero image gradients.
- **Warm Surface / Midnight Surface** (`{colors.warm-surface}` / `{colors.midnight-surface}`): the workspace-index ground and any future homepage overlay that stays inside this world.
- **Surface 2** (`{colors.warm-surface-2}` / `{colors.midnight-surface-2}`): hover fills and quiet interaction wells.
- **Muted Ink / Muted Chalk** (`{colors.muted-ink}` / `{colors.muted-chalk}`): the hero's readable second line, supporting copy, and secondary footer language; the soft tone remains on the scrollbar thumb.
- **Label Ink / Label Chalk** (`{colors.label-ink}` / `{colors.label-chalk}`): small uppercase labels; both clear normal-text contrast against their homepage grounds.
- **Rule / Rule Strong** (`{colors.rule}` / `{colors.rule-dark}`, `{colors.rule-strong}` / `{colors.rule-strong-dark}`): index-row separation and the stronger functional boundary around controls; the About photo has no dividing rule.
- **Photo Card** (`{colors.photo-card}` / `{colors.photo-card-dark}`): a neutral source for localized contrast on the coast photograph.
- **Focus** (`{colors.focus-light}` / `{colors.focus-dark}`): the keyboard focus outline, warmer at night to remain visible without introducing an app-like accent.
- **Selection** (`{colors.selection-light}` / `{colors.selection-dark}`): the text selection wash.

### Named Rules

**The Photograph Carries Colour Rule.** Homepage UI remains warm-neutral. Do not introduce a general-purpose accent; colour comes from the paired photography.

**The Paired Scene Rule.** A meaningful homepage photograph ships as a light/dark pair derived from the dark canonical frame. Subject, identity, pose, crop, geometry, and focal point remain fixed; only environmental light, exposure, atmosphere, and time of day may change. Theme changes must feel like time passing in the same world, not navigation to a different page.

**The Scoped World Rule.** `--pf-*` belongs under `.portfolio-page`. The authenticated app's semantic tokens remain authoritative everywhere else.

## Typography

**Display Font:** Plus Jakarta Sans (with `ui-sans-serif`, `system-ui`)
**Body Font:** Plus Jakarta Sans (with `ui-sans-serif`, `system-ui`)
**Quote Font:** self-hosted Cormorant Garamond (with `Georgia`, `serif`)

**Character:** The sans is dense, contemporary, and direct enough for a working product, but becomes editorial through scale, tight tracking, and the contrast between a heavy first line and a soft second line. Cormorant appears once as an atmospheric counter-voice; it does not become a general heading face.

### Hierarchy

- **Display** (750, `clamp(3.8rem, 6vw, 6.55rem)`, 0.92, `-0.04em`): the homepage h1. On small screens it resolves to `clamp(2.75rem, 12vw, 4.8rem)`, then 2.75rem below 430px.
- **Headline** (700, `clamp(2.2rem, 3.5vw, 3.35rem)`, 1.03, `-0.04em`): workspace, about, and contact headings.
- **Body** (400, 1rem, 1.6): explanatory copy; hero lead rises responsively to 1.17rem and stays in the photo's quiet zone.
- **Label** (700, 0.75rem, `0.28em`, uppercase): rare environmental notation such as “Organize / Learn / Build”; use the higher-contrast label token rather than the soft display tone.
- **Quote** (Cormorant Garamond 500, `clamp(2.4rem, 4.3vw, 4.35rem)`, 0.98): the coast-band statement only.

### Named Rules

**The Muted Second Line Rule.** The second line of the hero headline is the same type, weight, size, and rhythm as the first; only its soft neutral colour changes.

**The One Serif Moment Rule.** Cormorant Garamond belongs to the coast quote and nowhere else. Repeating it in cards or section headings would turn a singular pause into a theme.

## Layout

The homepage uses a fluid shell of `min(100% - 40px, 1320px)`, narrowing to `100% - 32px` below 768px. It is not a centred stack: the hero copy occupies the left quiet zone while photography carries the right, the about section splits 44/56, and the quote places its oversized statement on the right against a small left-hand refrain.

The hero fills at least the visible viewport. The workspace index follows it immediately, with a generous 72–112px vertical rhythm: a short editorial introduction beside four ruled destination rows, stacking below 768px. The borderless About photograph then leads into the coast quote and centered contact close.

Responsive changes occur at 1100px, 767px, and 430px. At 1100px the central desktop navigation yields to a separate 44px-target link row and the footer reduces columns. At 767px, the split about composition becomes copy then image, the workspace index becomes a single list, and quote/footer content wraps. At 430px, actions stack and index rows tighten without shrinking body copy.

### Named Rules

**The Quiet-Side Rule.** Place hero copy in the image's low-detail zone and tune the theme-specific gradient to preserve both typography and the photographic subject.

**The Editorial Sequence Rule.** Keep the page rhythm: hero → practical workspace index → borderless split about → full-width quote image → centered contact/footer. The index uses ruled rows, not photographic cards.

## Elevation & Depth

The homepage is flat by default. Depth comes from image planes, tonal steps, hairline rules, transparent gradient overlays, and the subtle blur behind the theme/outline controls. There are no card or button shadows.

### Named Rules

**The No Floating Card Rule.** Cards stay on the page plane with one hairline and clipped photography. Do not add box shadows, glow, or hover lift.

**The Image-First Depth Rule.** Use crop, overlay, light, and restrained image scale to create depth. UI chrome must remain quiet enough that the photograph leads.

## Shapes

Actions and the 44px theme control are true pills. Index icons use 12px corners and focus outlines use a 4px corner. Section bands, the split about composition, and the quote image remain full-bleed rectangles.

Borders are one pixel. Functional controls use the stronger rule and index rows use the quiet rule. The About composition has no top or inset dividing border. The system has no decorative blobs, glass cards, or oversized rounded panels.

## Components

### Buttons

- **Shape:** full pill, 46px minimum height, 24px horizontal padding; the header version is 42px high with 19px horizontal padding.
- **Solid:** reversed foreground/background using the action pair; bold 0.875rem label with a 17px arrow.
- **Outline:** transparent, one strong rule, with a restrained blur when laid over photography; hover reverses to page text on page ground.
- **Hover / Focus:** colour changes over 160ms; the arrow moves 2px right and up over 180ms. No lift, scale, or shadow. Focus is a 2px homepage ring with 4px offset.

### Theme Toggle

A 44px circular control with one strong rule and a translucent page-ground fill. It swaps Moon/Sun based on the resolved theme, labels the upcoming action for assistive technology, fills with Surface 2 on hover, and rotates 8 degrees. It drives the shared pre-paint theme system; it does not create a homepage-only preference.

### Navigation

Desktop navigation is a compact centred row inside a 96px header, with 46px gaps and 0.875rem medium labels. Hover and active states draw a 1px underline from left to right. Below 1100px, the central row disappears and a horizontally scrollable semantic nav sits beneath the header; it is not a hamburger overlay.

### Split About

The about band is a 44/56 split with a minimum 560px height: restrained copy on the page ground and a full-height paired desk photograph. Its laptop screen faces the viewer in both theme variants, and the light frame is a lighting-only edit of the dark scene. The photo fades broadly into the page ground along its left edge; there is no top or inset dividing rule. On mobile it becomes a simple vertical narrative, copy first and image second, with the image fading in from the top.

### Workspace Index

A two-column editorial band immediately follows the hero. A concise introduction sits beside four ruled, full-row links: Work Logs, Resources & Links, Notes & Code Ideas, and Tasks & Follow-ups. Those destinations point to live routes; GitHub is described only as a URL a person can save in Resources, not as an integration. Rows have readable body copy, 48px neutral icon wells, a directional arrow, and visible hover/focus feedback. The section stacks on phones without changing DOM reading order.

### Quote Band

A full-width paired coast photograph, cropped toward the horizon so the sunset, rocks, and water remain visible. The large Cormorant quote sits in a bounded right column; a small uppercase refrain and hairline remain on the left. A light right-side shade and localized text shadows preserve white-copy contrast without dulling the coast. On mobile the quote remains right-aligned below the refrain.

### Motion

The hero fills at least one visible viewport (`100dvh`, with `100vh` fallback) and lets content expand it on shorter screens. Theme image pairs cross-fade over 320ms. UI state changes take 160–180ms. The scroll cue moves 7px on a 1.8s loop. Reduced-motion preference compresses all animation and transition durations to 0.01ms and restores non-animated usability.

`motion/react` drives the short, interruptible Sun/Moon exchange and viewport-entry reveals for content only. Text translates 12px, index rows drift 10px from the left, and the right-set quote drifts 24px from the right. The observer resets only the replay flag after content exits; it never fades readable content out on scroll. Entries replay in both scroll directions with a capped stagger, and the SSR/no-JS baseline is visible. Reduced motion shows the final state without spatial travel. Navigation does not animate. The secondary hero link uses Skiper UI `Link000` underline with a keyboard-focus equivalent; the footer carries the public attribution.

## Do's and Don'ts

### Do:

- **Do** keep this system inside `.portfolio-page` and preserve the authenticated app's existing visual language.
- **Do** ship every major photograph as coordinated light and dark files under `public/Images/portfolio/`.
- **Do** keep text, links, icons, and controls as semantic DOM layered over separate image assets.
- **Do** preserve the heavy first-line / muted second-line hero hierarchy.
- **Do** use Cormorant Garamond only for the coast quote.
- **Do** use hairlines, tonal changes, overlays, and image crop for hierarchy before adding decoration.
- **Do** preserve real focus states, useful alt text on the light image, empty alt text on its dark duplicate, and the reduced-motion fallback.

### Don't:

- **Don't** flatten the composition into a screenshot or bake text and controls into an image.
- **Don't** apply homepage `--pf-*` values to authenticated screens or redesign product primitives to match this page.
- **Don't** introduce a general brand accent; photography carries the colour.
- **Don't** add shadows, hover lift, or large rounded marketing panels.
- **Don't** use Cormorant for headings, navigation, cards, or body copy.
- **Don't** substitute one photograph plus CSS filters for the authored day/night pairs.
- **Don't** promise collaboration, integrations, social proof, or deferred product features in homepage copy.
