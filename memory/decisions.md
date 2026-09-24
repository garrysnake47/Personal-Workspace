# Decisions

Newest at top. Format:

## YYYY-MM-DD — <decision>
**Why:** <reason>
**Alternatives rejected:** <what and why not>

## 2026-09-23 — Work logs carry optional project/site context

**Why:** A dated log title describes the day, but it does not reliably identify which project or website the work belongs to.
**How it works:** `WorkLog.projectName` is nullable so all existing logs remain valid. The labelled “Project name / site” field is available during creation and as an autosaved editor field, participates in work-log search, and appears in list, timeline, and Today-summary contexts when populated.
**Alternatives rejected:** Encoding the project in the title would mix two distinct pieces of information; making the new field required would invalidate existing logs and slow quick daily capture.

## 2026-09-23 — Direct ticket updates are deletable; work-log history is not

**Why:** The user needs to remove an update entered directly on `/tickets`, while the dated work-log record must remain protected and editable only through its owning work log.
**How it works:** Only `TicketHistoryEntry` timeline cards show a labelled Delete control. Deletion requires confirmation, is scoped by `userId + ticketId + entryId`, and removes only that direct entry. It does not roll back the ticket's current status and cannot reach `TicketWorkUpdate` rows.
**Alternatives rejected:** A delete control on every merged timeline row would let the ticket page erase work-log history; immediate deletion without confirmation is too easy to trigger accidentally. This supersedes the earlier append-only rule for standalone `TicketHistoryEntry` rows only.

## 2026-09-23 — Ticket details require an explicit selection

**Why:** Opening the first ticket automatically makes the page feel as if a ticket was chosen when the user only visited the route. History must also contain real written updates, not verification notes that report no change.
**How it works:** `/tickets` starts with no selected ticket, presents a neutral selection prompt on desktop and a disabled chooser prompt on mobile, then mounts and loads the detail panel only after an explicit ticket choice. The one browser-verification no-change history row was removed from local data; normal history creation still requires non-empty update text.
**Alternatives rejected:** Auto-selecting the first filtered result repeats the unwanted behavior; hard-coding a renderer filter for one sentence would leave bad data stored and create a hidden-content exception.

## 2026-09-23 — Standalone ticket updates use a separate history

**Why:** Ticket title/status need a fast management surface and the ticket also needs free-form body updates, but work-log notes are historical records and must retain exactly what was entered and the status captured at that time.
**How it works:** Title/status edits update only the user-owned `Ticket` row. Every body submission creates a separate `TicketHistoryEntry` with a status snapshot, while existing `TicketWorkUpdate` rows remain untouched. `/tickets` uses one compact master-detail editor and merges both sources into a labelled newest-first timeline. A later decision permits explicit confirmed deletion of these standalone entries.
**Alternatives rejected:** Reusing `saveTicketWorkUpdate` from the standalone page would require a work-log id and could rewrite that daily draft; overwriting one ticket-body field would discard earlier updates; page-wide edit cards made the manager hard to scan.

## 2026-09-20 — Workspace index becomes the second section; image cards are removed

**Why:** The photographic card section duplicated the workspace destinations and made the page longer, while the user wanted the practical four-link index immediately after the hero. They also flagged weak hero/quote text, an About dividing line, and an uncentered close.
**How it works:** The index owns `#workspace` and follows the hero. About now has no top rule and uses a broad photo fade; the coast shading is lighter with text-local contrast; the contact heading is centered. Hero secondary text, paragraph, and handwritten note use stronger contrast in both themes.
**Alternatives rejected:** keeping both workspace sections, removing the About fade entirely (which exposes a seam), and darkening the full coast image to protect the quote.

## 2026-09-20 — Homepage photography stays crisp; shading follows the text

**Why:** The broad hero, card, About, and coast treatments made the light and dark photos look dull or blurry.
**How it works:** Lighter theme-aware gradients protect only text-heavy regions; the About fade is limited to 12% to retain its seamless edge. The coast has no CSS image filter, and Next's image quality 90 is configured explicitly. The tablet hero paragraph stays in the quiet part of the photo.
**Alternatives rejected:** removing every overlay would lose text contrast, while keeping the old full-width wash would conceal the paired imagery.

## 2026-09-20 — Homepage index replaces logos; About laptop faces forward

**Why:** The logo strip described outside tools rather than what the workspace contains; the About photo showed only the laptop's back; scroll fades made text temporarily disappear; and the quote belonged on the right.
**How it works:** Four ruled links lead to live Work Logs, Resources, Notes, and Tracker routes; GitHub is named only as a savable URL, not an integration. A new matched About photo pair shows the screen, the coast quote is right-aligned with right-weighted shading, and entry motion replays without exit fading. Small labels get a contrast-safe token and tablet navigation remains available below 1100px.
**Alternatives rejected:** repeating the three image cards as another card grid, implying the standalone Tasks route or GitHub integration are live, filtering one About photo across themes, and fading content out just to enable replay.

## 2026-09-20 — Work Logs card gets a distinct matched photo pair

**Why:** Repeating the hero portrait in the Work Logs card made the page feel duplicated, while the card should communicate the daily record itself.
**How it works:** A journal-and-pen desk close-up replaces only that card's photograph. The light image is a daylight edit of the dark frame, preserving composition on theme changes; the existing semantic copy and bottom contrast gradient remain.
**Alternatives rejected:** re-cropping the hero would still repeat its subject, and a separate unrelated light image would break theme continuity.

## 2026-09-19 — Auth routes diverge; homepage adopts `/banner`; dashboard becomes a command centre

**Why:** Login and registration still looked like the same split template with
different copy, their repeated list blocks added little meaning, the older public
homepage was no longer wanted, and the dashboard's equal white boxes did not
match the visual confidence of the banner.

**How it works:** Login visualizes resuming an existing day with a progress ring
and latest-log object. Registration is a separate emerald creation canvas with a
connected Private/Daily/Permanent map and floating form card. `/` renders the
same three chapters as `/banner`. `/dashboard` keeps all real data reads but
reorganizes them into a dominant graphite Today panel, focus queue, momentum
panel, activity trail and library dock.

**Alternatives rejected:** swapping only the auth copy would preserve the same
template; another checklist would repeat the reported problem; re-skinning the
old dashboard boxes would not create a meaningful action hierarchy.

## 2026-09-19 — `/banner` keeps only three chapters and replays distinct motion

**Why:** The user removed the timeline and “Start with today” chapters, wanted
the closing statement centered, found the signboard labels poorly aligned and
typeset, and reported that identical text slides played together only once.

**How it works:** The page now flows hero → connected toolkit → closing scene.
Navigation mirrors those real anchors. Closing copy is optically centered, and
each board label has a tuned position, board-matching rotation and the self-hosted
Bricolage display face. Hero, toolkit and closing use different reveal materials;
ScrollTrigger restarts on either-direction entry and resets after leaving back.
The menu remains static and reduced-motion renders the finished state.

**Alternatives rejected:** keeping empty timeline navigation would create a dead
anchor; one generic translate reveal caused the sameness reported by the user;
editing text into the raster would make alignment and accessibility brittle.

## 2026-09-18 — `/banner` becomes four animated chapters; auth dark mode is restrained

**Why:** The row of capability tiles did not match the connected reference, the
closing scene and quote were oversized, the timeline/CTA composition was
congested, and the auth pages repeated similar product language while their
dark teal rendered as neon aqua.

**How it works:** `/banner` now flows hero → connected toolkit → append-only
timeline plus separate CTA → generated day/night closing landscape. Phosphor
icons replace ad-hoc SVGs. GSAP reveals each section and child with staggered,
reduced-motion-safe timelines, while the menu stays static. Login copy is about
resuming existing work; registration copy is about creating a new system. A
scoped auth token override uses deep emerald in dark mode without changing the
signed-in product palette.

**Alternatives rejected:** a flat capability row lost the requested hierarchy;
animating positioned cards with translate/scale overwrote their CSS transforms;
changing global dark tokens would repaint the authenticated application.

## 2026-09-18 — `/banner` keeps navigation static and sequences hero copy

**Why:** The menu entrance was distracting, the text reveal was too fast, and
overlapping starts made every element appear to arrive together. The user also
asked for a reference-inspired capability section directly below the hero
without drifting from the banner palette.

**How it works:** The nav is no longer a GSAP target. Scene, eyebrow, heading,
lead, actions and benefits have separate authored start times and slower clip
reveals. The below-banner toolkit uses the existing scoped light/dark world plus
four scene-derived pastel token pairs, and lists only capabilities that exist.

**Alternatives rejected:** animating nav items individually would intensify the
reported problem; adding a second unscoped palette would create a visible seam;
listing standalone Tasks or Reports would market Coming Soon routes as live.

## 2026-09-17 — `/banner` removes floating cards and uses sharp mask-led motion

**Why:** The user no longer wanted the Daily Log, ASU or Meeting Notes overlays,
found the scene visibly soft, disliked bottom-to-top text entrances, and saw
blur on the buttons during load.

**How it works:** The card component and its CSS/icon system are deleted. A new
deep-focus day/night photo pair keeps the same desk composition and environmental
lettering without bokeh, haze or transform scaling. GSAP reveals text with a
left-to-right clip mask and no vertical movement or blur; buttons use only
opacity and a 0.97-to-1 scale settle. Reduced-motion still renders the static
server state.

**Alternatives rejected:** retaining decorative cards contradicted the explicit
removal request; sharpening the old soft source with CSS would create halos;
blur filters and translateY entrances repeat the exact load defects the user
asked to remove.

## 2026-09-17 — `/banner` uses a GSAP load sequence and a real night photograph

**Superseded later on 2026-09-17:** the cards and blur-based card entrance were
removed; see the newer decision above. The GSAP foundation and separate night
exposure remain.

**Why:** The user explicitly requested GSAP for all page-load text, a card
redesign/reposition, and dark mode matching the supplied warm night-studio
reference. The earlier IntersectionObserver replay system and filtered daylight
photo no longer matched that direction.

**How it works:** `banner-motion.tsx` uses `@gsap/react` and one scoped timeline:
scene/nav first, copy next, card shells via clip-path and blur, then every card
and benefit text group. GSAP context and matchMedia clean up all temporary
styles; reduced-motion skips the timeline and the server-rendered default is
always visible. The card cascade is larger and more legible: Daily leads, ASU
sits foremost at lower-right, and Meeting Notes tucks behind at `25.2vw`, clear
of the book. Dark mode cross-fades to `scene-workspace-dark.png`, a separately
lit teal-black/amber photograph, instead of filtering the daylight asset.

**Alternatives rejected:** a character-split headline would add excessive DOM
for a short product hero; transform-based card entrances would overwrite the
cards' perspective; filtering the daylight image cannot create the reference's
directional amber light or shadow detail.

## 2026-09-16 — Meeting Notes clears the notebook; scene lettering stays photographic

**Why:** The user identified two fidelity problems in the rendered `/banner`:
Meeting Notes sat on the notebook, and the background photo omitted the
reference's mug and notebook lettering.

**How it works:** Meeting Notes now sits at `25.2vw` on desktop and follows the
notebook direction with a slightly stronger positive resting rotation, leaving
a visible gap above the book at the verified viewport. The background edit adds
only gold “Better Workdays” on the notebook and cream handwritten “Good Notes
Brighter Days” on the mug. The photo uses a versioned filename so Next Image
cannot continue serving its cached blank-prop rendition.

**Alternatives rejected:** Baking the cards into the photo would remove their
real content and interactions; placing text as HTML over the mug/book would not
follow their surfaces or perspective.

## 2026-09-16 — `/banner` motion replays on viewport entry without flattening cards

**Superseded on 2026-09-17:** the user explicitly replaced this behavior with a
GSAP page-load sequence; see the newer decision above.

**Why:** The user removed the social-proof claim and asked every remaining hero
component to animate both on page load and while scrolling. The cards already
use `transform` for their resting perspective and hover lift, so another
transform animation would flatten or override that depth.

**How it works:** `banner-motion.tsx` progressively enhances elements marked
with `data-bn-reveal` through one `IntersectionObserver`. CSS uses opacity and
the individual `translate` property for staggered nav, copy, card and benefit
reveals; the scene adds a restrained scale settle. Elements reset after leaving
the viewport and replay on re-entry. Content stays visible before hydration,
and `prefers-reduced-motion` renders the final state with no reveal transition.

**Alternatives rejected:** GSAP and scroll-jacking add unnecessary weight and
forced movement; one parent-level animation would not give each component its
own entrance; transform-based card reveals conflict with the 3D card system.

## 2026-09-16 — Marketing pages run their own visual world, separate from the app

**Why:** The user asked for a complete redesign of the homepage layout with a
brand-new palette, and installed the `impeccable` skill to drive it. The teal /
Plus Jakarta Sans system is shared with every authenticated screen, so a new
marketing palette could not simply replace the tokens without repainting the
whole product — which nobody asked for.

**How it works:** `.marketing-document` REDEFINES the `--c-*` raw tokens
(and `.dark .marketing-document` for the dark rendition). Because `@theme inline`
resolves `var()` at the use site, every existing token utility — `bg-bg`,
`text-text`, `bg-primary`, `border-border` — renders the marketing world inside
that wrapper and the incumbent teal everywhere else. Two complete systems live in
one stylesheet on purpose. Do not "harmonise" them.

**The world is "The Commit Graph"** (seed `c0fbca57`): the working day rendered
as version-control history. A single spine runs the page; the append-only
mechanism is DEMONSTRATED by a runnable amend attempt rather than claimed in a
feature card. Ink ground with a violet cast, plotter-lime addition accent, and a
deletion red that appears exactly once, struck, and resolves — because the
product has no delete.

**Type is three faces, marketing-only:** Bricolage Grotesque (display), Archivo
(prose), Martian Mono (real data ONLY — ids, dates, counts, git-ref labels, diff
notation). Display is deliberately not the monospace: mono as a costume for
"technical" is a craft-floor refusal, and a build that claims that exemption then
spends it on nav links has failed its own argument.

**Process note worth keeping:** the skill's finish review caught two product-truth
violations I had shipped — the words "for the team" in a product whose defining
constraint is that it is single-user, and a "free" pricing claim PRODUCT.md does
not supply. Neither was a visual defect and neither would have been caught by
looking at the page. A fresh reviewer with PRODUCT.md in hand is worth the round.

**Trap that cost a full review round:** `vector-effect: non-scaling-stroke`
measures a stroke's DASH PATTERN in screen space, so `pathLength` normalization
never reaches it. An SVG dash-draw on a stretched (`preserveAspectRatio="none"`)
path renders as a fixed-pixel ladder no matter what number you put in
`stroke-dasharray`. A straight rail is now drawn in layout space instead —
`scaleY(0 -> 1)` from `transform-origin: top` on a `view()` timeline. Keep dash
animation for real curves at 1:1 scale only, and drop `vectorEffect` there.

## 2026-09-16 — `/banner` sizes everything as a fraction of the comp's 1648px canvas

**Why:** The first pass sized the page the ordinary responsive way — fixed type steps, cards at a
percentage width with a pixel MINIMUM so their text stayed legible. On the user's own ~1100px
window that minimum won: the cards stopped being 23%/21%/21% of the canvas, overflowed their slots
and stacked on top of each other. The comp is not a fluid layout, it is a **drawing at one size**;
it only holds if every part shrinks together.

**The rule now:** from lg up, every size on this page is
`clamp(floor, <comp px> / 1648 * 100vw, ceiling)`. At 1648px wide the page IS the comp. Card tops
are vw as well (9.7 / 23.7 / 32), not percentages of section height, so the collage keeps its
internal proportions whatever the window's aspect ratio. Below lg the layout stacks and the sizes
go back to fixed px — a 1.09vw card title is 4px on a phone.

**Consequence:** do NOT put a `min-width` back on the floating cards, and do not convert these vw
clamps to Tailwind's type steps. The floors and ceilings in `banner.css` are the only guards.

**One deliberate deviation:** the copy measure is 56%, not the comp's 51%. Plus Jakarta Sans sets
wider than the comp's face, and at 51% "down. Keep the thread." breaks to a third line — the
two-line headline is more of the design than the exact measure is.

## 2026-09-16 — The banner uses one background-only photo, never a full-page screenshot

**Why:** The screenshot-sprite prototype baked navigation, copy, cards and controls into one huge
bitmap, so it could not reflow, remain sharp, expose real links, or animate individual elements.
The previous vector-room fallback also looked visibly flatter than the supplied photographic comp.

**How it works:** `banner-scene.tsx` uses Next Image for
`public/Images/banner/scene-workspace-v2.png`, which contains only the room and desk. Navigation,
headline, CTA controls, three product cards, feature icons and the theme control are
independent DOM/SVG layers. Dark mode is a scoped teal/amber wash and photo filter; it does not
swap in a screenshot with duplicated UI.

**Motion:** the scene, navigation, copy groups, cards and benefits reveal on load and viewport
re-entry; cards, search, CTAs and feature icons respond on hover/focus. All non-essential motion
stops under `prefers-reduced-motion`.

## 2026-09-16 — `/banner` scopes its own palette instead of using the app tokens

**Why:** The user supplied two reference comps (light + dark) of a work-log hero and asked for the
same layout on a new `/banner` page. The comp's colour story — warm ivory daylight, terracotta,
emerald — is not the product's slate + teal app palette and not the marketing page's ink + violet
either. Three choices existed: bend the comp to the app tokens (it stops being the comp), add a
third global theme (two palettes already fight in `globals.css`), or scope a page-local set.

**What it is:** `app/src/app/banner/banner.css` declares ~70 `--bn-*` variables on `.banner-page`
and overrides them under `.dark .banner-page`. The page imports it directly. Nothing global moves,
and the app's existing class-based theme toggle drives the banner for free. The house rule is
"tokens only, no raw hex in components" — this keeps it: the hex lives in one stylesheet, and the
markup only ever names a token.

**The scene is an SVG, not an image.** The reference is a photograph. A bitmap could not have
re-lit itself for dark mode, so the room is vector art in the comp's own 1648x928 coordinate space
with token fills. That is what makes dark mode a night version of the same room rather than a
`brightness()` filter — the explicit thing the reference prompt forbade.

**Alternatives rejected:** (1) Cropping the screenshots in as a background image — no dark variant,
no theming, and it would have baked the card text into a raster. (2) Adding the banner's display
sizes to the global type scale — the app stops at 30px and marketing at 60px for reasons; the
banner's ~72px headline is a `clamp()` inside `.bn-h1` and goes no further. (3) Photographic
avatars — there are none in the repo, and inventing stock faces for a social-proof row is a
borrowed claim, so they are flat SVG portraits.

**Consequence:** `/banner` is in `PUBLIC_ROUTES`. The comp's own greys failed AA on the cream ground
at 13px (3.6:1 and 3.3:1) and were darkened to ~4.9:1 — the banner is not pixel-identical there,
deliberately.

## 2026-09-16 — Homepage hero is a full-bleed banner with a serif accent line

**Why:** The user supplied the CreativaX studio hero as a reference and asked for its
*design* on their own content and colours, for the hero only. The old hero was a
two-column grid inside `Container` — copy left, illustration right, both boxed to
72rem. That reads as a page section; the reference reads as a banner, and the whole
difference is that the artwork bleeds off the frame instead of sitting inside it.

**What it is now:** an edge-to-edge `min-h-dvh` section with its own gutters (no
`Container`), copy in a left column capped at 38rem, and the existing illustration
anchored bottom-right, oversized, running off the right and bottom edges. Three
gradient masks in `--c-bg` do the work the reference does over video: a left wedge
(lg:58% — wide enough to clear the copy measure, not the reference's 42%), a top
band that frames the floating nav pill, and a bottom band that seats the banner on
the section below. Because the masks are `--c-bg` and not a hex, the whole thing
themes; a cream-hex version would have been a light-mode island.

**The accent line is Jakarta, not a serif.** The reference sets its second headline
line in italic Instrument Serif; that was built, put on screen, and then rejected.
The break survives — `font-extrabold` roman over `font-light` italic at
`primary-strong` — but it is one family doing it, which is enough contrast at
headline size and keeps the product at two faces (Jakarta + JetBrains Mono). What
the change DID require is loading Jakarta's italic file in `layout.tsx`
(`style: ["normal", "italic"]`): a synthetic oblique is plainly a shear at 52-72px.

**What was NOT copied from the reference:** the cream/orange palette (teal tokens
instead), the in-hero navigation (the existing `MarketingNav` pill already sits
above it), the background video, the display serif, and the "trusted by 200+
brands" avatar row —
this is a single-user workspace, so that became the M/T/W/T working week with
"Five days a week, yours alone." A borrowed layout is fine; borrowed claims are not.

**Rejected:** the reference's own video URL. It was chosen first, built, and
verified — then dropped once it was on screen: a third-party CDN clip of designers
holding colour swatches has nothing to do with a work log, and it cost a client
component (playbackRate, showreel modal, Escape handling) for decoration. The
illustration already on disk, drifting 12s in CSS, does the same job with no
hydration and no external dependency.

**Trap worth remembering:** this project sets `--breakpoint-*: initial` and defines
only `xs/md/lg/xl`. There is no `sm`. `sm:` utilities compile to NOTHING and fail
silently — the first pass shipped nine of them and the CTA row simply never became
a row. Check the emitted CSS for the `@media (min-width: ...)` you expect, not just
the class name in the markup.

## 2026-09-16 — Dashboard rebuilt as four bands with one accented panel

**Why:** Six equal-weight bordered boxes had no hierarchy. "Today" — the only card
you are meant to *act* on — carried exactly the same visual weight as "Library", a list of
link counts that merely restated the top nav. Two of the six cards ("This sprint",
"Tickets by stage") were both passive aggregate counters, and the page's loudest element was
whichever card happened to have the most rows.

**What it is now:** four bands — Today (full width, the only accented panel, holds the one
CTA), then act-on-it (Needs you + Recent ticket work), then measure-it (This sprint + Tickets
by stage), then a Library link strip that is no longer a card. A single local `Card` component
owns padding, radius, border and heading treatment so the panels cannot drift apart.

**Hierarchy is width + padding + type, not decoration.** Today is full-width at `p-5` with a
`border-t-2 border-t-primary` rule (the same device the marketing step cards use); every other
card is `p-4` with a `text-sm` title. Card titles got *smaller*, not larger — at this density
the title is a label and the content should carry the weight.

**Alternatives rejected:** (1) Shadows or elevation to separate the hero — the palette's Flat
Design profile specifies no shadows and every other card in the app is flat and bordered, so
this page would have become the odd one out. (2) Tinting Today with `bg-primary-subtle`
(`#ccfbf1`) — a full-width mint panel is loud in app chrome, and colour is the one thing the
2026-09-14 decision took away from this page. (3) Merging "This sprint" into "Tickets by
stage" — they measure different things (activity in a period vs. current state of all
tickets), and a card holding both would need a title that lies about one of them. Keeping them
adjacent in one band gets the grouping benefit without the false label.

**Consequence:** `Library` is a `<nav>`, so it is no longer announced as a titled region;
that is correct, it is navigation, not content. The skill-recommended landing pattern
("Product Demo + Features") was disregarded — it is a marketing-page pattern and does not
apply to an authenticated dashboard.

## 2026-09-16 — Seed "today" must come from LOCAL calendar components

**Why:** `seed.ts` and `seed-bulk.ts` both derived their day boundary with
`Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())`. The app does the
opposite — `src/lib/dashboard.ts` and `src/lib/worklogs.ts` key a work log on
`Date.UTC(getFullYear(), getMonth(), getDate())`, i.e. UTC midnight of the **local** calendar
day. At UTC+5:30 anything run between midnight and 05:30 local is still "yesterday" in UTC, so
the seeds' newest work log landed a day early and the dashboard's Today card was empty on the day
the seed was run. This is what made the dashboard look dead, not the dashboard.

**Fixed in the seeds, not the app.** `src/lib/worklogs.ts:37` (`toDateOnly`) also reads UTC
components, but correctly: it normalizes an already-constructed date, and the dashboard comment
says so explicitly. Do not "fix" that one.

**Consequence:** `prisma/seed-fill.ts` tops up the trailing gap including today
(`npm run db:seed:fill [email] [days]`), and unlike `seed-bulk.ts` it advances a ticket's stage
forward only — it reads each ticket's current status first. `seed-bulk.ts` restarts its status
arcs from step 0 on every run, so re-running it can regress a Released ticket to InProgress;
prefer `db:seed:fill` for topping up an existing workspace.

## 2026-09-16 — Dashboard "Tickets by stage" drops its bars for counts + share

**Why:** The bars were the weakest element on the page and failed twice over. Visually, the only
tones the palette allows for a non-brand graphic put the fill (`surface-3`) on the track
(`surface-2`) at **1.13:1** — indistinguishable, so five rows of it read as unloaded skeleton
content. Structurally, the width was `count / busiestStage`, normalized to the largest stage
rather than the total, so whichever stage held the most tickets always rendered as a *full* bar:
"Sent to QA" at 4-of-13 looked complete. It also spent ~900px of track encoding the range 1-5.

**What it is now:** one row per stage — label, share of total as a percent, and the count. Zero
stages drop to `text-subtle` so the occupied stages carry the eye. Rows are separated by
`divide-border` instead of each being a bordered box.

**Alternatives rejected:** (1) Recoloring the fill to a brand tone — that puts teal on a passive
breakdown, which is the exact mistake the 2026-09-14 "one hue was carrying seven jobs" decision
corrected. (2) A single 5-segment stacked bar, which is the better chart for share-of-total but
needs five distinguishable tones; this palette deliberately has no such ramp, and inventing one
reintroduces the retired `OLD_SPRINT_TONES` problem. If a chart is ever wanted here, that is the
shape to build, and it needs a neutral ramp defined in `design.md` first.

**Consequence:** There is now no graphic on the dashboard at all — it is entirely type and
number. That is intentional, not an omission.

## 2026-09-16 — Dashboard empty states are unframed; the card is the frame

**Why:** Every empty state was a dashed, tinted box sitting inside an already-bordered card —
two frames around one sentence. The Today card was the worst case because its dashed box also
held the page's primary action, so the button sat inside two nested containers.

**Consequence:** Applied to all four empty states (Today, Needs you, Tickets by stage, Recent
ticket work), not just the one reviewed, so the page stays internally consistent. `border-dashed`
no longer appears on this page; if a new empty state is added, it should not reintroduce it.

## 2026-09-16 — Homepage step illustrations moved to the teal ramp; the checklist PNG became an SVG

**Why:** The three "how it works" illustrations were the last place the rejected brand blue
`#017EFD` was still visible. Blue was rejected twice by the user and the tokens moved to the
teal ramp (`#0D9488` / `#0F766E`), but these assets are referenced through `next/image` and so
never picked up the token change — they are files, not styled markup.

**What changed:** In the two SVGs, brand blue -> `#0D9488`, the blue-tinted active-card fill
`#F8FBFF` -> `#F4FCFA`, the pre-token navy `#0A1B33` -> the real text token `#0F172A`, and the
blue-grey timeline spine/dot (`#DBE5F1` / `#C9D6E6`) -> `#E2E8F0` / `#CBD5E1`. The timeline's
status tints (`#FDE9E9`, `#FDF0D8`, `#F1F5F9`) were left exactly as they were: they are already
the `status-*-bg` tokens, and they are semantic, not brand.

**`checklist-cards.png` was replaced, not recolored.** It was a 709KB soft-3D raster with blue
baked into the checkmarks, the offset cards and the shadows — there is no honest way to recolor
that, and a CSS `hue-rotate` would have dragged the neutrals with it. It was also the only
soft-3D asset among three flat ones, so it never matched the other two steps anyway. It is now a
hand-drawn flat `checklist-cards.svg` on the teal ramp, same subject, ~1.6KB.

**Alternatives rejected:** (1) CSS filter on the PNG — shifts every hue, not just the blue, and
leaves the style mismatch. (2) Inlining the SVGs as components so they could read CSS variables
and follow the theme — a real improvement, but it means giving up `next/image` and touching the
marketing primitives; not worth it for three decorative assets.

**Consequence:** The teal in these three files is hardcoded to the **light-theme** token, so it
does not flip in dark mode. That is unchanged behaviour (the blue was hardcoded too) and the
section reads acceptably on the dark ground, but if these ever need to be theme-aware they must
be inlined as components first.


## 2026-09-14 — Resources joins Work Logs as an active workspace tool
**Why:** The user needs one place for links, websites, apps, tools, commands, snippets, and references. Resources is now a first-class shell route with secured server actions, additive resource types, a type-aware inline composer, and a flat indexed list that avoids nested dashboard panels.
**Alternatives rejected:** Reusing the old dashboard-style card grid; storing resources only in browser state; exposing the other deferred modules in navigation.

## 2026-09-13 — Ticket workflow migration preserves legacy enum values
**Why:** The live database still contains legacy ticket statuses while the UI now uses five sprint stages. Dropping the old PostgreSQL enum and rewriting every historical row would make deployment destructive and erase the original status vocabulary. The schema therefore accepts both sets, the migration only adds missing values, and `workflow-status.ts` normalizes legacy values into the current five-stage UI at read boundaries. New writes use only the current workflow.
**Alternatives rejected:** Destructively renaming/replacing the enum and bulk-rewriting history; hiding the error with dashboard fallbacks; keeping Prisma filters that mention only values unsupported by one side of the mismatch.

## 2026-09-13 — App shell uses a neutral slate ladder with accessible blue actions
**Why:** The UI/UX Pro Max Flat Design and dark-mode SaaS searches both point to
flat, layered surfaces for productivity dashboards. The previous near-black dark
mode and pale-blue light mode made hierarchy difficult to read. The refreshed
tokens keep the existing blue identity while moving elevation into `bg → surface
→ surface-2 → surface-3`; normal-size labels use `primary-strong` for contrast.
**Alternatives rejected:** The query's teal/orange palette (conflicts with the
product's existing blue and status language), gradients/glows (poor fit for dense
work logs), and stacked shadows in dark mode (muddy on long sessions).

## 2026-09-12 — Homepage uses native document snap scrolling and replayable observer reveals
**Why:** A nested scrollport broke top navigation from the final section and fought browser anchor behavior. Continuous CSS view timelines and animated blur also made scrolling feel scrubbed and costly. The document is now the only vertical scroller with three snap targets; a scoped IntersectionObserver toggles compositor-only reveal states on entry and exit, while the no-JS baseline stays visible.
**Alternatives rejected:** Keeping the nested `<main>` scroller; continuous `animation-timeline: view()` motion; looping blurred decoration; one-shot load animations that do not replay.

## 2026-09-12 — Theme persists in localStorage; sidebar collapse persists in a cookie
**Why:** Two different flash problems. The theme must be right before the first paint, which only an inline `<head>` script can do — so it reads `localStorage["pw-theme"]` synchronously. The sidebar's rail width is *layout*, and a server component can read a cookie, so the correct width is in the SSR HTML with no script and no hydration gap.
**Alternatives rejected:** localStorage for both (sidebar would flash expanded on every load, or need a second inline script mutating layout); a cookie for the theme too (works, but sends the theme on every request and still needs the script for `system` tracking).
**Consequence:** `(app)/layout.tsx` calls `cookies()`, so authenticated routes render dynamically. They were already dynamic because of `auth()`.

## 2026-09-12 — `cn()` lives in `src/components/cn.ts`, not `src/lib/utils.ts`
**Why:** `src/lib/**` is the backend's directory. Putting a UI helper there invites edit collisions between agents.
**Consequence:** import `@/components/cn` everywhere.

## 2026-09-12 — Dialogs and the ⌘K palette are built on the native `<dialog>` element
**Why:** Focus trapping, Escape-to-close, page inertness and top-layer stacking come from the platform, correctly, for free. Hand-rolled versions of all four are where a11y bugs live, and the spec calls for a keyboard-first app.
**Alternatives rejected:** Radix / Headless UI (another dependency for behaviour the platform now ships); a hand-rolled focus trap (more code, worse).

## 2026-09-12 — The sidebar rail width snaps; it does not animate
**Why:** design.md §7 says never animate `width`/`height` — use `transform` and `opacity`. Collapsing a docked rail is inherently a width change, so the honest reading of the rule is an instant snap. The mobile drawer, which *can* be a transform, is animated (200ms).
**Note for the UI Designer:** if a 200ms width transition on the rail is wanted after all, that is a deliberate exception to §7 and should be written into design.md rather than assumed.

## 2026-09-12 — Every sidebar destination got a stub page
**Why:** The shell is unusable — and untestable — if eight of ten nav items 404. Each stub is four lines around a shared `SectionPlaceholder` that says the module is not built yet.
**Consequence:** delete `app/src/app/(app)/<section>/page.tsx` as each real module lands; nothing else imports `SectionPlaceholder`.

## 2026-09-12 — TicketWorkUpdate is keyed `@@unique([ticketId, workLogId])`
**Why:** This is how spec 21 ("never overwrite") and spec 22 ("autosave must not duplicate")
are reconciled, and it is the single most important decision in the schema.
Append-only history and in-place autosave sound contradictory. They are not, once you notice
the real unit is *one update per ticket per work log*. So the DB enforces exactly that, and every
write goes through `prisma.ticketWorkUpdate.upsert({ where: { ticketId_workLogId } })`:
- same work log      -> the row is rewritten in place  (debounced autosave, idempotent)
- different work log -> a NEW row                      (history, immutable)
There is no code path that can blind-create a duplicate, and none that can "update the latest"
and clobber yesterday. Getting it wrong becomes a constraint violation, not a silent data loss bug.
**Alternatives rejected:**
- *Blind create on every save* — a row per keystroke. The thing the spec explicitly forbids.
- *Update the most recent update row* — works until midnight, then silently overwrites yesterday.
- *A `finalized` boolean + "edit while draft"* — needs a finalize step the UX doesn't have, and
  leaves the "what if they reopen yesterday's log" case undefined. The work log IS the boundary.

## 2026-09-12 — Removing a ticket from a work log deletes only that log's update row
**Why:** Spec 9 is explicit that it must not delete the Ticket. Implemented in
`detachTicketFromWorkLog` as a `deleteMany({ ticketId, workLogId, userId })` — scoped to one
pair — after which the ticket's current status is recomputed from the newest *surviving* update.
So undoing today's entry also undoes today's status change, instead of leaving the ticket
stuck on a status whose evidence was just deleted.

## 2026-09-12 — Ownership is enforced by the WHERE clause, not by a check-then-act
**Why:** Every mutation is `updateMany`/`deleteMany` with `{ id, userId }`, or a `findFirst`
ownership guard whose result is required before the write. A hostile id from the client matches
zero rows and returns NOT_FOUND. No query in `src/lib` or `src/actions` takes a userId from the
caller's payload — it always comes from `requireUser()`.
**Verified:** a throwaway harness ran 22 assertions against the live DB, including four
cross-user attacks (read another user's ticket, write to their work log, write to their ticket,
detach from their log) — all returned null and left the victim's rows byte-identical.
**Note:** the harness was deleted afterwards; `agents/_shared.md` forbids test files in the repo.

## 2026-09-12 — JWT sessions, not database sessions
**Why:** Route protection runs before render on every navigation. A DB session strategy means a
Postgres round trip per request just to answer "is this signed in?". The JWT carries `userId`, so
the check is local; every data query still scopes by that id. The NextAuth adapter tables
(Account/Session/VerificationToken) exist anyway so adding an OAuth provider later is a config change.
**Consequence:** credentials provider *requires* the JWT strategy in NextAuth v5, so this was also
the only option that works with email+password at all.

## 2026-09-12 — `middleware.ts` is now `src/proxy.ts` (Next 16)
**Why:** Next 16 deprecated the `middleware` file convention and renamed it to `proxy`.
Notably `proxy` runs on the **nodejs** runtime, not edge. Found in
`app/node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`.
**Consequence:** the edge-safe/node split in `auth.config.ts` vs `auth.ts` is no longer strictly
required, but it is kept — it kills the DB round trip per navigation and keeps the door open.

## 2026-09-12 — Prisma pinned to 7.10.0; Prisma 8 rc rejected
**Why:** `create-next-app` had left the CLI at `prisma@8.0.0-rc.13` (npm's `latest` tag is an RC)
against `@prisma/client@7.10.0` — a mismatched major. Pinned both to 7.10.0, the newest stable client.
The frontend dev builds on this; a release candidate is not a foundation.
**Consequences of Prisma 7 (these are real breaking changes, not optional):**
- `url` is **gone from the datasource block**. Connection config lives in `app/prisma.config.ts`.
- The client needs a **driver adapter** — hence `@prisma/adapter-pg`, wired in `src/lib/prisma.ts`.
- The CLI **no longer auto-loads `.env`**; `prisma.config.ts` imports `dotenv/config`.
- The generator is `prisma-client` (not `prisma-client-js`) and emits **TypeScript** to
  `src/generated/prisma`, which is gitignored and rebuilt by `postinstall`.
  Model types are exported as `TicketModel` etc., so `src/lib/prisma.ts` re-exports them under
  clean names. **Import enums and model types from `@/lib/prisma`.**

## 2026-09-12 — `WorkLog.date` is a `@db.Date` stored at UTC midnight
**Why:** `@@unique([userId, date])` only gives "one primary log per day" if every writer agrees on
what a day is. A timestamp would let 09:00 and 14:00 both be "today" and both be unique.
Helpers `todayUtc()` / `toDateOnly()` in `@/lib/worklogs` are the only sanctioned way to build one.

## 2026-09-12 — Installed ui-ux-pro-max skill bundle
**Why:** Gives the UI Designer a real dataset (192 palettes, 74 font pairings, 119 UX rules, 22 stacks) to choose from instead of inventing values. Shared by Claude and Codex.
**How:** Copied from github.com/nextlevelbuilder/ui-ux-pro-max-skill into `.claude/skills/`; `.codex/skills` symlinks to it so both tools read one copy.
**Alternatives rejected:** `npm i -g ui-ux-pro-max-cli` + `uipro init` — the documented path, but it installs a global npm package. Direct copy gives the same files with no machine-level change. Use the CLI later if you want automatic updates.
**Note:** `memory/design.md` remains the source of truth for the project's actual tokens. The skill supplies options; the decision gets recorded in memory.

## 2026-09-12 — Postgres on host port 5434, via Docker
**Why:** 5432 (`mt-pg`) and 5433 (`nexa-postgres`) are already allocated by other projects on this machine. 5434 is free.
**How:** `docker-compose.yml` at repo root, volume `workspace-pgdata`. Start with `docker compose up -d`.

## 2026-09-12 — Next.js 16 / React 19, not Next 15
**Why:** `create-next-app@latest` resolved to 16.3.5 with React 19.2.8 on Node 24. Spec said "Next.js" without pinning a version, so took current stable.
**Consequence:** App Router + Server Actions are the default. NextAuth v5 beta is the matching auth version.

## 2026-09-12 — Design direction: Flat Design + indigo on slate, Inter + JetBrains Mono
**Why:** Queried `ui-ux-pro-max`. `styles.csv` → **Flat Design** is the only active style whose Best For covers SaaS/dashboards/web apps AND supports both light and dark; its no-gradient/no-shadow/typography-led rules are the Linear-Notion feel. Palette synthesised from three `colors.csv` rows (Developer Tool/IDE dark ramp, SaaS General light ramp, Micro SaaS indigo brand) rather than one, because no single row had a usable light+dark pair. Fonts cross two `typography.csv` pairings: Inter (from "Modern Dark Cinema", Best For = developer tools/high-end productivity) for UI, JetBrains Mono (from "Developer Mono") for IDs/code.
**Consequence:** Orange is reserved for High priority and is NOT a global accent. Indigo carries all action. Mono ligatures off so `ASU-1234` never fuses. Full reasoning + rejected options in `memory/design.md` §0.

## 2026-09-12 — Dark mode is slate #0B1120, not OLED black
**Why:** The skill's `dark-mode-oled` style prescribes `#000000`. This app is used for 8-hour desktop sessions on LCD; pure black under white text causes halation. Deep slate keeps the deep-dark feel without the eye strain, and gives room for a 4-step surface elevation ladder (bg → surface → surface-2 → surface-3), which dark mode needs since shadows don't read on dark.
**Consequence:** Dark elevation is conveyed by lightness, not shadow. Don't stack drop shadows on dark panels.

## 2026-09-12 — Base font size is 14px, not 16px
**Why:** Dense desktop tool; 16px body costs roughly one table row per screen. 15px (`text-md`) is used for anything read as prose (meeting notes, work-done text, note bodies), so long-form reading is unaffected.
**Consequence:** `--text-base` = 0.875rem. Hard floor is 12px; 11px only for uppercase micro-labels.

## 2026-09-12 — Dark mode toggles via `.dark` class, no prefers-color-scheme media query
**Why:** The user needs a manual toggle that sticks. A media query would fight it.
**Consequence:** Frontend dev must read the system preference once, persist the choice, and apply the class in a pre-hydration inline script to avoid a flash. `@custom-variant dark` is already declared in globals.css.

## 2026-09-12 — Tailwind `sm` and `2xl` breakpoints deleted
**Why:** Spec pins 360/768/1024/1440. Leaving Tailwind's defaults in invites drift to 640px and 1536px.
**Consequence:** `@theme` does `--breakpoint-*: initial` then defines only `xs`(360) `md`(768) `lg`(1024) `xl`(1440). `sm:` and `2xl:` utilities no longer compile — this is intentional, not a bug.

## Agent Office reads transcripts instead of agents reporting status (2026-09-12)
Agents could have written their own status into a shared file, but that only works if every
agent remembers to, and it goes stale the moment one crashes. Claude Code already writes a
per-subagent JSONL transcript with a meta file — that is ground truth, costs the agents nothing,
and needs no change to any role definition. Liveness is inferred from file mtime (90s window)
rather than an explicit "finished" marker, since backgrounded agents don't always write one.

## Agent Office lives in `office/`, not in `app/` (2026-09-12)
`app/` is the work-management product. The monitor is tooling for building it, has no auth, no DB,
and no relationship to the product's routes — folding it into the Next.js app would put a
dev-only page behind the product's middleware and pollute its route map. Separate zero-dep server.


## 2026-09-12 — Blue removed from the product entirely
**Why:** User rejected the indigo brand accent AND the blue-slate dark background ("not blue colors", "i dont want blue as bg"). The original palette was blue-slate ground + indigo accent + blue "In Progress" badge — the default SaaS look.
**What changed:**
- Ground → true neutral zinc, zero hue (`#FAFAFA`/`#FFFFFF` light, `#09090B`/`#131316` dark).
- Accent → teal (`#0F766E` / `#2DD4BF`). Picked because it was the only hue NOT already claimed by a status or priority color — an accent that reuses a status hue makes the UI ambiguous.
- Status set re-hued to eliminate blue: In Progress blue → **amber**, Waiting amber → **violet**, Testing violet → **magenta**. Open/Blocked/Completed/Closed unchanged.
- Priority → warm heat ramp (grey → gold → orange → rose), which also reads as escalation.
**Verified:** all pairs re-computed. Worst badge 5.46:1, border-strong 3.03:1, body text 17.7:1. Confirmed live in the running app (`bodyBg: rgb(9,9,11)`).
**Cost of this change: near zero** — everything is token-based, so the swap was central. No component needed editing.

## 2026-09-12 — Palette + font taken from reference site optlify.vercel.app
**Why:** User supplied the URL and asked for its color combination across the whole product, and for the homepage to match its layout.
**How:** Extracted from the live DOM (computed styles), not estimated. Ground `#F8FBFF`/white, headings `#0A1B33`, body `#44546B`, borders `#E2E8F0`, brand `#017EFD`, font **Manrope**.
**Deliberate deviation:** `#017EFD` is 3.89:1 on white and FAILS WCAG AA for normal text and for white-on-blue button labels. The reference site ships that failure. We added `--primary-strong` `#0166D0` (5.51:1) for text-size use and reserved `#017EFD` for large text/fills only. Same hue, same identity, accessible.
**Consequence:** Light is now the primary theme; dark retained as a variant of the same identity. Status colors stay off blue (In Progress amber, Waiting violet, Testing magenta) so they never read as the brand color.
**Note:** this reverses the earlier neutral-zinc + teal decision. Cost was again near zero — token-based, no component edits.

## 2026-09-12 — `/` becomes the public marketing homepage, dashboard moves to `/dashboard`
**Decided by:** frontend-dev (task from lead).

- `/` is now `app/src/app/(marketing)/page.tsx`, in its own route group **outside** the app
  shell. The dashboard moved verbatim to `(app)/dashboard/page.tsx`.
- `/` was added to `PUBLIC_ROUTES` in `src/lib/auth.config.ts` rather than branching in
  `src/proxy.ts`. Two reasons: proxy.ts delegates entirely to the `authorized` callback, so
  a second source of truth there would rot; and `"/"` is provably safe in that matcher —
  the exact test catches only root, and the subtree test degrades to `startsWith("//")`,
  which no real pathname satisfies.
- **Signed-in users are NOT redirected off `/`.** They see the same page with the nav and
  closing CTA swapped to "Go to dashboard". A silent bounce would make the homepage
  unreachable for the only person who uses the app.
- Redirect strings repointed to `/dashboard`: `actions/auth.ts` `login()` default,
  `safeCallbackUrl()` fallback, `register-form.tsx`, `auth.config.ts` already-signed-in
  bounce, `nav-items.ts` Dashboard entry.

## 2026-09-12 — Marketing page: three deliberate deviations from the reference site
The user's reference (optlify.vercel.app) was mirrored for **layout and rhythm only**. Three
places where copying it would have broken our own rules:

1. **Filled CTAs use `--primary-strong`, not `--primary`.** The reference puts white ~15px
   labels on `#017EFD` (3.89:1, fails AA 4.5:1). Our filled pills are `bg-primary-strong`
   (5.51:1). `--primary` is kept for the things the rule allows: the hero accent word, check
   circles, dots, icons and the offset card edge.
2. **Outline CTAs use `--border-strong`.** The reference outlines its secondary button in a
   decorative hairline (`#DBE5F1`, under 3:1). A button boundary is functional, so it must
   clear 3:1 — design.md §2.
3. **Card radius capped at 16px (`rounded-2xl`).** The reference uses 28px. design.md says
   "16 — max; nothing rounder"; the nav pill is `rounded-full`, which is a shape, not a radius.

Also: the reference's "offset blue shadow" is not a shadow at all — it is asymmetric border
widths (`1px 8px 8px 1px`) with the bottom/right sides in brand blue. Reproduced the same way
(`OffsetCard`), which keeps it correct in dark mode and forced-colors where a box-shadow would
vanish. Its heading font is Bricolage Grotesque; we keep **Manrope** per design.md.

## 2026-09-12 — Marketing product shots are DOM, not images
There is no real screenshot yet and a PNG would go stale on the first dashboard change, so
`components/marketing/app-mock.tsx` draws the dashboard / work log / ticket timeline / tasks
in DOM using the same tokens as the real app. Each mock is a single `role="img"` +
`aria-label` node, so none of the invented numbers are announced as content. Swap point is
documented in the file header: replace a component body with `<Image>`, keep the wrapper.

## 2026-09-12 — Marketing pages are pinned to LIGHT (`.force-light`)
**Why:** The user's reference (optlify.vercel.app) is light-only and they explicitly said the homepage should look like it. A dark marketing page cannot match a light reference, so inheriting the app theme defeated the requirement. The user reported the dark homepage as a bug.
**How:** `.force-light` in `globals.css` re-declares the light raw tokens on a subtree; applied to `(marketing)/layout.tsx`. Pure CSS — no flash, no effect hook, no hardcoded colors in components.
**Scope:** PUBLIC/marketing routes only. The authenticated app shell keeps its full light/dark toggle. This is a deliberate, narrow exception to "keep dark mode working" — not a retreat from dark mode.
**Arbitrated by:** lead, in response to direct user feedback.

## 2026-09-12 — `revalidatePath("/")` repointed to `/dashboard`
**Why:** Those calls were written when `/` WAS the dashboard. After the marketing move they invalidated the public homepage instead, so dashboard data would have gone stale after every mutation — a silent bug with no error.
**Fixed in:** `src/actions/worklog.ts`, `tickets.ts`, `content.ts` (5 call sites).
**Lesson for future route moves:** grep for `revalidatePath`, `redirect`, and `router.push` — not just links.

## 2026-09-12 — Auth pages: split layout, auth-scoped form primitives, CSS-only motion
**Context:** the user called `/login` and `/register` "too simple" (a 384px card on a plain
ground) and asked for animation across the product. Direction was queried from
`.claude/skills/ui-ux-pro-max/` — `motion.csv`, `app-interface.csv` (Forms) and
`ux-guidelines.csv` — not invented. Rows used are listed in the header of
`app/src/app/(auth)/auth-motion.css` and in the component headers.

1. **The split layout lives in `components/auth/auth-shell.tsx`, not in `(auth)/layout.tsx`.**
   The layout stayed thin (it owns `.force-light` + the motion stylesheet) because the brand
   panel's copy differs per page, and a layout cannot see which route rendered it. Pages pass
   `panel={<AuthPanel …/>}`. One CSS grid: single column at 360, two at `lg`.
2. **`AuthPanel` returns BOTH the wide `<aside>` and a compact `lg:hidden` strip.** Both land
   as grid children; the strip is `display:none` at `lg` so it occupies no grid cell. That is
   how the small screen still says something without duplicating the copy in two places.
3. **The brand panel is filled with `primary-active` (#0152ab), not `primary` (#017EFD).**
   `primary` is 3.89:1 and may only carry large text/large fills, and this panel holds real
   sentences: white body copy on `primary-active` is 7.5:1, and `primary-fg/85` subcopy ~5.9:1.
   `primary` is still used for the decorative shapes, which carry no text. Submit buttons use
   `bg-primary-strong` for the same reason (a 15px white label on `primary` fails AA).
4. **Auth gets its own field/input, `components/auth/auth-field.tsx` — `ui/field.tsx` and
   `ui/input.tsx` are untouched.** The app is a dense tool (32-36px controls, 14px base); a
   sign-in screen wants 44px targets and 15px type. Widening the shared primitives would have
   loosened every in-app form. The auth versions also add a **reserved message slot**
   (`min-h-5`) so showing an inline error does not shove the submit button down the page
   (ux-guidelines #19) — the dense in-app forms do not need that and pay no cost for it.
5. **No animation library.** The skill's GSAP snippets were used as a timing/easing spec and
   reimplemented as CSS keyframes in `(auth)/auth-motion.css`: GSAP `power1.out` →
   `cubic-bezier(0.25, 0.46, 0.45, 0.94)`, `power2.out` → `cubic-bezier(0.22, 0.61, 0.36, 1)`.
   Zero new dependencies, zero bundle cost. Only `transform` and `opacity` animate.
6. **`prefers-reduced-motion` is asserted locally, not left to the global reset.** The global
   block in `globals.css` collapses durations, but `.auth-rise` starts at `opacity: 0` — with
   the animation cancelled, the form would be invisible. The auth block sets
   `opacity: 1 !important; transform: none !important` explicitly. Verified in the browser by
   reading the parsed CSSOM rule, not by assuming the file shipped.
7. **Mismatch feedback has exactly one owner.** The live "Passwords match / do not match" line
   owns it; the confirm field's own error slot carries only what the server said, and the live
   line is suppressed while a server message is on screen. Otherwise a failed submit printed
   the same sentence twice, one line apart.
8. **Live validation timing is a deliberate compromise.** app-interface.csv #16 and
   ux-guidelines #56 say validate on blur, never per keystroke; the user asked for an instant
   match check. So: the *positive* "Passwords match" appears the moment it is true, the
   *negative* only after the field has been blurred. Nobody is told they are wrong mid-word.
9. **Testimonial copy is an explicit placeholder**, matching the convention already set in
   `(marketing)/page.tsx` — no invented named customer.
10. **No "Forgot password?" link.** There is no such route; a dead link is worse than its
    absence. Add it with the feature.

## Dashboard: scope cut and how it was interpreted (2026-09-12, frontend-dev)

1. **Only four things on the page, not seven.** The spec §3 listed Today's Work Log, Today's
   Meetings, Active Tickets, Tasks, Recent Notes, Quick Links and Recent Activity. The user
   overrode that ("keep the colors only remove section which are not required i don't want all
   those") and, asked what they wanted instead, said "just general info about my sites what are
   the things present". Built: greeting + date, the Today's Work Log hero, six count tiles,
   Active Tickets. **Not built: Today's Meetings, Recent Notes, Quick Links, Recent Activity.**
   Their stub components were deleted rather than left dead in the tree. Do not re-add without
   the user asking.
2. **Today's Meetings is the one omission worth defending.** It is redundant, not merely
   trimmed: meetings only exist *inside* a work log, and the hero already shows "N of 4 meetings
   noted" and drops you into the editor where the meeting cards are. A separate card would have
   been a second door to the same room.
3. **Tasks became a count, not a list.** The user asked for "what things are present". A task
   list is an activity feed; `14 tasks / 12 open` linking to `/tasks` answers the question asked.
4. **Counts are real `COUNT`s, in a dashboard-local `queries.ts`.** Taking `.length` off the
   `list*` actions was the obvious route, but every one of them is paginated (`listTasks` caps at
   100), so the headline number on a page whose entire job is "how many things are in here"
   would silently start under-reporting. The helper lives in `app/(app)/dashboard/queries.ts`
   because `src/lib/**` is backend-owned; it still starts at `requireUserId()` and puts the id
   in the WHERE clause, so user isolation is unchanged.
5. **The page probes for today's work log, it does not open it.** `listWorkLogs({from,to:today})`
   is read-only; `openTodayWorkLog()` is find-or-CREATE. Calling the latter from a page render
   would mean that merely looking at the dashboard creates a work log for the day — which would
   then make the hero permanently say "Continue" and quietly fill the work-log list with empty
   days. Creation belongs to the CTA only.
6. **Active Tickets is capped at 5 rows.** "Keep it tight — a handful of rows, not a full table."
   `listActiveTickets(12)` is still fetched so the status-dot counts in the header are honest,
   and the footer link says `+N more` when rows are held back.
7. **Motion: CSS module, `motion.csv` as a timing spec only.** No GSAP, no animation dependency.
   Rows used — #7 Stagger List/Subtle, #1 Hover Micro-interaction/Subtle, #4 Scroll Reveal/Subtle.
   GSAP `power1.out` is quad-out → `cubic-bezier(0.25, 0.46, 0.45, 0.94)`.
8. **Where the skill and design.md disagreed, design.md won — once, with one exception.** Row #7
   offers 250-350ms; design.md §7 caps everything at 250ms, so the stagger is 250ms, the
   intersection of the two. The **one** deliberate overshoot is the metric count-up at 320ms
   (row #4's 300-400ms band): at 250ms a count-up doesn't read as counting, it reads as a
   glitch. Nothing else on the page exceeds 250ms.
9. **The count-up renders its final value on the server.** No-JS and pre-hydration both show the
   real number; the reset to 0 happens in a layout effect, before paint, so there is no
   final→0 flash. Under `prefers-reduced-motion` it never runs at all. The animating digits are
   `aria-hidden` and the value is exposed once as `sr-only` text — a number changing twenty
   times in 320ms is noise in a screen reader.
10. **The bezier is written out literally in the CSS module, not hoisted to a custom property.**
    A CSS Module compiles in `pure` mode, where a global `:root` block is a build error.
11. **Every blue at normal text size is `primary-strong`.** That includes overriding the shared
    `Button` primary fill on the two hero CTAs (`bg-primary-strong`): a 15px white label on
    `--primary` `#017EFD` is 3.89:1 and fails AA. Same override the marketing `ctaVariants.filled`
    already makes. `ui/button.tsx` itself was left alone — it is a shared primitive and not in
    this task's scope, but **it is still shipping a 3.89:1 label everywhere else it is used at
    14-15px.** That is a real, open accessibility bug for whoever owns `ui/`.

## 2026-09-12 — Button `primary` variant uses `--primary-strong`, not `--primary`
**Why:** `bg-primary` (#017EFD) against a white label is **3.89:1** — it FAILS WCAG AA for button labels at 13-14px. The shared `ui/button.tsx` was shipping that failure everywhere it was used. Three separate agents had each worked around it locally (marketing, auth, dashboard CTAs), which is the tell that the primitive was wrong, not the callers.
**Fixed at the source:** `primary` variant is now `bg-primary-strong` (#0166D0) → **5.51:1** light, **9.37:1** dark. Same hue, so the brand reads identically.
**Standing rule:** raw `--primary` #017EFD is reserved for LARGE text (≥24px, or ≥18.66px bold) and decorative fills — hero accent words, icons, rules, shapes. Anything with a normal-size label uses `--primary-strong`.
**Note:** the local `bg-primary-strong` overrides in marketing/auth/dashboard CTAs are now redundant but harmless — they set the same value. Left in place rather than touching files other agents own.

## 2026-09-12 — Session cookie self-heal in `src/proxy.ts`
**Why:** A session cookie encrypted with a different AUTH_SECRET makes Auth.js throw `JWTSessionError: no matching decryption secret` on EVERY request. It degraded to "signed out" correctly, but the browser kept resending the dead cookie, so the error repeated forever and the user had to clear site data by hand to recover.
**Fix:** `proxy.ts` now wraps the auth middleware; if a request carries a session cookie and still gets bounced to `/login`, that cookie is provably useless, so it is cleared with `Max-Age=0`. Paired with a try/catch in `getCurrentUser()` (`src/lib/session.ts`) so a bad cookie can never throw out of a layout — which previously broke the marketing page too, leaving no route back to `/login`.
**Verified:** `/` 200, `/login` 200, `/dashboard` and `/tickets` 307 → `/login?callbackUrl=…`, and a garbage cookie returns `set-cookie: authjs.session-token=; Max-Age=0`.

## 2026-09-12 — Homepage cut to THREE sections, all product screenshots removed
**User instruction, verbatim:** *"too much information on homepage also i dont want screenshot of my inside pages on homepage as images"* / *"keep only 3 sections"* / *"Remove all screenshot phots from homepage"*
**Now:** 1. Hero · 2. How it works (three numbered steps, text only) · 3. Close. Plus nav and a links-only footer.
**Removed:** the bento product grid, pricing, testimonials, FAQ, the stats row, and all four hand-built mock panels (`DashboardMock` / `WorkLogMock` / `TicketMock` / `TasksNotesMock`). Verified live: `document.querySelectorAll('img').length === 0` and no mock components are imported anywhere.
**`components/marketing/app-mock.tsx` is left on disk but unreferenced** — 347 lines, may be wanted later. Delete it if not.
**Also removed the footer's big closing CTA.** The page already ends on "Start with today."; two stacked calls to action saying the same thing is exactly the clutter being trimmed. `MarketingFooter` no longer takes a `signedIn` prop.
**Dead anchors fixed:** nav advertised `#product` / `#pricing` / `#faq` and the footer `#product` / `#pricing` / `#faq`; all those sections are gone, so the links scrolled nowhere. Nav and footer now link only `#how-it-works`, the one in-page anchor that exists. Verified every `a[href^="#"]` resolves to a real id.
**Title fix:** the page title was rendering "… written down · Personal Workspace" because the root layout applies a `%s · Personal Workspace` template. Homepage now uses `title: { absolute: … }`.

## 2026-09-12 — Reveal observer moved AFTER hydration (real bug fixed)
**Symptom:** React error in the console — *"A tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up."*
**Cause:** `MOTION_INIT_SCRIPT` wired its IntersectionObserver on `DOMContentLoaded` and stamped `data-revealed=""` onto elements **before React hydrated**. React diffs attributes on elements it owns, so every reveal target mismatched.
**Fix:** the inline pre-paint script now does exactly one thing — set `data-reveal-ready` on `<html>`, which is outside React's tree and therefore safe. Observer wiring, the no-IntersectionObserver fallback and the 2.5s failsafe all moved into `RevealObserver`'s `useEffect`, i.e. post-hydration. Correctness beats winning a few hundred ms on the first reveal.
**Verified:** served HTML contains zero `data-revealed` attributes; 11 of 13 reveal targets at `opacity: 1` after load, the 2 unrevealed being below-fold footer elements (correct — they reveal on scroll).

## 2026-09-12 — KNOWN OPEN ISSUE: lint errors in `src/components/work-log/**`
Pre-existing, from the partially-completed work-log editor. `npm run build` passes; these are React Compiler lint errors only:
- `save-status.tsx:148,151` — "Cannot access refs during render" (`eq.current = equals ?? Object.is` at render time, the latest-ref pattern)
- `save-status.tsx:244` — "Cannot call impure function during render"
- `ticket-search.tsx:144`, `ticket-work-card.tsx:85`
**Not fixed here** — out of scope for the homepage work, and the work-log editor is still incomplete. Whoever finishes that module must resolve these.

## 2026-09-12 — CRITICAL FIX: reveal animation was stranding content invisible
**Symptom the user reported (with screenshots):** the homepage rendered a headline and a footer and nothing else. The hero copy, buttons and the entire "How it works" section were blank.
**Cause:** the reveal system set a PERSISTENT `opacity: 0` on every `[data-reveal]` element under `[data-reveal-ready]`, and relied on JS adding `[data-revealed]` to undo it. Any path where the observer did not run — the hydration error that was live at the time, a JS failure, a client-nav edge case — left the page permanently blank. The "safety model" was inverted: it treated *hidden* as the default and *visible* as the thing JS had to earn.
**Fix:** reveals are now a **CSS animation**, not a JS-toggled state. `@keyframes pw-reveal-in` runs `opacity 0 → 1`; the browser always reaches the final frame, so content is visible at rest with no JS, with a JS error, with a dead observer, or under reduced motion. The whole rule set sits inside `@media (prefers-reduced-motion: no-preference)`, so reduced motion means no animation at all rather than a reset fighting an inline style.
**Consequence accepted:** reveals fire on load, not on scroll. For a three-section page that is the right trade — the animation is decoration, the content is the point.
**Deleted:** `components/marketing/motion.tsx` (the inline script + IntersectionObserver) and its references in `(marketing)/layout.tsx`. Nothing depends on `data-reveal-ready` any more.
**Verified live:** 13 reveal targets and 8 headline word-spans, **zero** below `opacity: 0.99`.
**Lesson:** never make visibility conditional on JS succeeding. Animate *from* hidden with CSS; never *rest* at hidden.

## 2026-09-12 — Homepage illustrations (no screenshots), images renamed
**User instruction:** *"there is no content add something but not screenshot / Check in images folder use those images also create those similar images and add if requried / also rename those images"*
**Renamed** (were upload UUIDs, in `app/public/Images/`):
- `17d35cf7-7d55-4ef0-b671-37173f906cd7.png` → **`person-writing-work-log.png`**
- `fc62f3b3-da25-49c8-a536-16767150a704.png` → **`checklist-cards.png`**
**Created** two more in the same flat brand-blue style, as SVG (~2KB each vs ~700KB for the PNGs), so they are crisp at any size:
- **`ticket-history-timeline.svg`** — dated updates with status pills, newest at top. Illustrates the append-only history, the product's core idea.
- **`meeting-notes-cards.svg`** — stacked note cards, front one being written in. Illustrates the four standing meeting cards.
**Used:** person illustration in the hero; the three step cards carry meeting-notes → ticket-timeline → checklist, matching each step's meaning.
**Both PNGs go through `next/image`** — they are ~700KB originals; verified being served resized (`w=828&q=75`). Hero image has `priority` (LCP candidate); the rest lazy-load. All four have real descriptive `alt` text; the SVGs also carry `<title>`/`<desc>`.
**Content added to the hero** beyond the headline: a three-item value list, the reassurance line, and both CTAs — the previous version was headline-only, which is what "there is no content" was about.

## 2026-09-12 — Homepage: full-viewport sections, real scroll animation, background layer
All at the user's request, in one pass.

**1. Three full-viewport sections.** `#top` uses `min-h-[calc(100dvh-5rem)]` so the hero PLUS the (non-sticky) nav sum to exactly one screen. `#how-it-works` is `min-h-dvh`.

**2. Bottom gap removed.** `#start` is deliberately NOT `min-h-dvh`: the footer follows it immediately, and a full viewport there pushed the footer onto a fourth, mostly-empty screen — the "space at the bottom" that was reported. It now reserves `--footer-reserve: 22.5rem`, so section + footer together measure **766px against a 768px viewport (1.00)**. Total page is 3.06 screens.
*If the footer's content ever changes height, that reserve needs re-measuring — it is the one hardcoded magic number on the page and it is commented as such.*

**3. Scroll animation is back — but CSS-native, not JS.** `@supports (animation-timeline: view())` upgrades `[data-reveal]` to a real scroll-linked timeline (`animation-range: entry 5% entry 55%`). Browsers without support keep the plain on-load animation. **This is the key point: a JS observer is what stranded the page blank before; a CSS timeline cannot fail open.** Stagger on a timeline can't use `animation-delay`, so `data-stagger="1|2|3"` shifts each card's range instead.
Verified in-browser: `animationTimeline: "view()"`, `animationRange: "entry 5% entry 55%"`, `CSS.supports(...) === true`.

**4. Text animation** — `WordRise` now runs on the h1 and BOTH h2s ("Three steps, every working day", "Start with today."). 16 word spans, zero below full opacity.

**5. Menu filled out.** Was one lonely centred link. Now three, left-aligned beside the logo: Overview (`#top`), How it works (`#how-it-works`), Get started (`#start`). Every entry resolves to a real id — verified.

**6. Nav is NOT sticky** — `position: relative`, scrolls away with the page.

**7. Background layer** — three soft brand-blue orbs on 22s/28s drift plus a masked dot grid that reads as ruled paper. `aria-hidden` + `pointer-events-none`, transform/opacity only, and all of it inside `prefers-reduced-motion: no-preference`.

**Verified after:** 13 reveal targets and 16 word spans all at full opacity; 4 images loaded, 0 broken; no horizontal scroll; footer fully in view at the bottom with `opacity: 1`.
## 2026-09-12 — Homepage motion, three-step scrolling, and auth repair plan
**Goal:** make the three-section homepage feel intentional and responsive, centre the desktop menu, animate section navigation and major components, simplify and differentiate login/register, and stop credentials being submitted in the URL.
**Order / ownership:** (1) UI Designer defines token-based motion, active-nav, section-transition, and distinct auth content direction; (2) Backend Dev diagnoses and repairs the credentials submission contract in parallel; (3) Frontend Dev implements the homepage/menu/scroll and auth presentation using those decisions and the backend contract; (4) Sanity Checker verifies the rendered homepage at 360/768/1024/1440 plus real login/register submission and URL privacy.
**UX basis:** smooth anchor navigation and visible active-section state are required; component reveals use short 300–400ms transform/opacity motion with small offsets; all motion must have a `prefers-reduced-motion` final-state path. The page remains exactly three content sections.

## 2026-09-12 — Homepage/auth motion and content direction is tokenized
**UI/UX Pro Max basis:** `nav-state-active` requires a visible current-location treatment; Scroll Reveal/Subtle specifies 300–400ms, `power1.out`, and an 8–16px offset; Stagger List/Subtle specifies 250–350ms with a short 20–40ms interval. The implementation uses the conservative end: 350ms reveal, 12px maximum offset, 40ms stagger, transform/opacity only.
**Homepage:** the three section hashes remain real deep links. Scrolling snaps only between Hero, How it works, and Get started, with native smooth anchor movement and an `auto` reduced-motion override. Desktop navigation is a true `1fr auto 1fr` grid so its link group is centred in the full pill. The active link uses text colour plus a 2px shape indicator and `aria-current`; state is not communicated by colour alone.
**Colour:** no new hues. Sections alternate `--bg`, `--surface`, and `--primary-subtle`; normal-size blue text remains `--primary-strong`.
**Auth:** remove the testimonial, placeholder names/roles, long panel paragraph, and duplicated benefit bullets. Login is the minimal returning-user form. Registration is a distinct setup form with only a compact onboarding accent. Both preserve visible labels, 44px controls, password-manager/paste support, inline errors, and focus management.

## 2026-09-12 — LAN development origin is explicitly trusted; auth stays strict
**Root cause:** the app is opened at `http://192.168.31.130:3000`, while the Next dev server is
initialised on localhost. Next 16 logged that it blocked dev resources from `192.168.31.130`.
That prevented the client/server-action path from running reliably; an unbound HTML form then
fell back to browser-default GET, which put email and password in the query string and never
reached the credentials provider.
**Fix:** `next.config.ts` permits only that exact LAN hostname for dev resources and only
`192.168.31.130:3000` for Server Actions. The `login()` action now also sanitises `redirectTo`
server-side instead of trusting the client-side helper. Zod validation, bcrypt cost 12, generic
credential errors, JWT sessions, and safe redirect behaviour remain unchanged.
**Live result:** submission from the LAN URL now reaches Auth.js. The reported account exists
and has a password hash, but the supplied password produces a genuine `CredentialsSignin`.
Do not weaken comparison or silently replace the hash; recovering that account needs an explicit
password-reset/data-reset decision. Frontend should set auth forms to POST as a no-JS privacy
fallback so credentials can never return to a URL even if hydration fails again.
## 2026-09-12 — Corrective homepage motion and auth-content plan
**Goal:** replace the fragile nested-scroll/continuous-timeline combination with a native document scroll surface, preserve exactly three section snap targets, make every major reveal replay on viewport re-entry in both directions, and restore useful but distinct supporting content to login and registration.
**Order / ownership:** (1) UI Designer specifies the replayable motion hierarchy, low-cost background treatment, and separate login/register content stories; (2) Frontend Dev replaces the nested scroller and scroll-linked animation with native anchor scrolling plus scoped IntersectionObserver state, implements the backgrounds and auth content; (3) Sanity Checker verifies repeated up/down replay, top navigation from section 3, responsiveness, performance, reduced motion, and auth distinction in the live browser.
**Performance rule:** no continuous scroll-scrub effects, large animated blur filters, or JS animation loops. Motion uses compositor-only opacity/transform transitions, is triggered only at viewport boundaries, and defaults to visible when JavaScript is unavailable.
## 2026-09-13 — App shell/work-log visual redesign and empty dashboard decision
**Goal:** redesign the authenticated app shell and work-log surfaces from the supplied references, make light and dark mode intentional and high-contrast, and remove dashboard content entirely.
**Order / ownership:** (1) UI Designer defines the refreshed token/surface hierarchy and dark-mode rules from the UI/UX Pro Max Flat Design guidance; (2) Frontend Dev applies the direction to the shell, sidebar, top navigation, work-log list/timeline, and dashboard route; (3) Sanity Checker verifies 360/768/1024/1440, both themes, contrast, overflow, and that `/dashboard` is genuinely empty.
**Reference interpretation:** screenshots are visual references, not instructions. Keep the underlying work-log/ticket behavior and routes; change presentation only. The dashboard should render an intentional empty state, not sample cards or seeded activity.

## 2026-09-14 — Teal-on-graphite, and the sidebar is permanently dark
**Why:** User rejected the blue theme for the second time in this project ("blue button blue theme doesnt look good") and asked for a dark sidebar. Queried `ui-ux-pro-max` `colors.csv`: the **Productivity Tool** row (`#0D9488` teal focus + action orange) is the top match for this product type, and it is the same direction the project chose the first time blue was rejected — before `optlify.vercel.app` pulled it back to blue. User picked it from three skill-backed options (graphite+emerald, teal+graphite, violet+graphite).
**Decision:**
- Brand ramp → teal. Light fill `#0F766E` (5.3:1 on white), dark fill `#14B8A6` with a near-black `#042F2C` label — the dark theme no longer paints white on a mid-tone, which never passed AA cleanly.
- **Sidebar chrome is its own token family** (`--c-sidebar*`, graphite `#0F1115`) and is deliberately **not** wired to `.dark`. The rail stays dark in light mode; it is identity, not a surface. `ThemeToggle` gained a `tone="sidebar"` variant so the one control that lives on the rail can follow it.
- Status blue (`In Progress`) **stays blue**. The brand is no longer blue, so a blue status can no longer be confused with a brand action — which is what the "accent must not reuse a status hue" rule was protecting.
**Alternatives rejected:** graphite+emerald (green is already "Done"/success, so the action colour would collide with the completion signal), violet+graphite (violet is the Testing status hue; would have forced a status re-hue for no gain).

## 2026-09-14 — Scroll reveals are CSS scroll-timeline, not IntersectionObserver
**Why:** The app already had entrance animations that only ran once, on mount. The user asked for motion "for even scroll as well". `animation-timeline: view()` ties the animation to scroll position, so it plays in both directions, needs no observer, no layout reads, and no client component — it works on server-rendered pages as a plain class.
**Consequence:** The rules live inside `@supports (animation-timeline: view())` + `prefers-reduced-motion: no-preference`. Browsers without support render the element at its resting state, so content is never stuck invisible — **never move these rules outside that guard.** Keyframes animate `translate`/`scale`, not `transform`, so `.motion-lift`'s hover `transform` still composes on the same element.

## 2026-09-14 — Notes replaced with Nexa's notebook model (Note → Section → Page)
**Why:** User asked for "same thing, same fields" as the Notes feature in the sibling `Nexa` project (`~/Work/Claude/Nexa`). Nexa shapes a note like OneNote: a note holds sections, a section holds pages, and only a page carries body text (a TipTap document). This app's own `Note` was a flat title/content/tags/pinned row with no live UI — `/notes` was a Coming Soon page.
**Decision:** Dropped the old `Note` model and its 9 seeded rows (user approved explicitly) and put Nexa's three models in its place, keeping every Nexa field: `description`, `iconName` + `iconLibrary` (react-icons), `favorite`, `deletedAt` (trash), and per-page `content` JSON + `order`.
**Ported as-is** (~3,800 lines from Nexa): `RichTextEditor`, `NoteViewer`, `NoteForm`, `SectionEditor`, `PageEditor`, `NoteIconPicker`, `NoteIcon`, `NoteTableOfContents`, `CodeBlock`, `editor-extensions`, `lib/note-icons`. New deps: `@tiptap/*`, `lowlight`, `react-icons`, `framer-motion`.
**Adapted, not rewritten:** Nexa's `Field` takes `errors: string[]` + `optional`; this app's takes `error: string` + `required`. Rather than rewrite ~1,500 lines of editor, `components/notes/note-field.tsx` keeps Nexa's contract and renders it with THIS app's tokens. Same idea for `@/lib/utils` → `@/components/cn`. That keeps the editor easy to re-sync with Nexa later.
**Consequence:** notes actions use `useActionState` form state (`NoteFormState`), NOT the app's `ActionResult` shape — the editor posts its whole tree as one hidden JSON field and needs per-path field errors back. Everything else still uses `ActionResult`. Trash exists in the model and actions (`deletedAt`, restore, destroy) but has **no UI yet** — there is no `/notes/trash` route.

## 2026-09-14 — Sidebar removed; navigation is a dark pill across the top
**Why:** User asked for the sidebar gone and the menu on top, in the same design as the homepage, then for it centred on a dark ground.
**Decision:** `shell/app-nav.tsx` replaces `app-sidebar.tsx` + `top-navigation.tsx`, reusing the homepage pill exactly (`marketing/marketing-nav.tsx`): fully rounded, hairline top/left edge, 4px brand bottom/right edge. It is **graphite in both themes**, on the same `--c-sidebar*` family the rail used — the chrome stays the app's identity, it just moved. `#app-nav` now carries the scoped `--c-ring` override the rail had, for the same 3:1 reason.
**Consequences:**
- The pill is a 3-column grid from `md` (`[1fr_auto_1fr]`) so sections sit dead centre whatever the brand and account blocks measure. **Brand + back button are ONE grid item** — a fourth top-level child wraps onto a second row, which is exactly what happened first time.
- It is `sticky`, not `fixed` like the homepage's: fixed would overlay the content well and every page would need its own top padding. `scroll-padding-top` went 80px → 96px to clear it (WCAG 2.2 AA 2.4.11).
- Deleted with the sidebar: `shell-context.tsx` (collapse state), `constants.ts` (`SIDEBAR_COOKIE`), and the cookie read in the authenticated layout. The `pw-sidebar` cookie may linger in browsers; it is inert.
- The mobile sheet and back button were re-toned for the dark ground.

## 2026-09-14 — Teal is for actions and current state only
**Why:** With the teal palette in, one hue was carrying seven jobs on a single screen — brand badge, active nav, primary button, decorative icon tiles, section eyebrow labels, the sprint panel's background wash, its border and every timeline marker. When one colour marks everything it marks nothing: the primary button read with no more weight than a decorative tile, and the loudest element on Work Logs was a passive list of past logs while the form the user came to use receded. The hierarchy was inverted.
**Decision — the accent is spent on exactly two things:**
1. **Actions** — buttons, links, the focus ring.
2. **Current state** — the active nav item, today's marker.
Everything else is neutral: decorative icon tiles are `bg-surface-3 text-text-muted`, section eyebrow labels are `text-text-subtle`.
**Consequence:** `OLD_SPRINT_TONES` is gone. Sprint panels used to carry a tinted shell — teal for the current sprint, a deterministic violet/green/amber/stone rotation for older ones (a decision from 2026-09-13). They are now a plain `border-border bg-surface`, and the only colour in the panel is **today's marker**. Sprints are told apart by their date headers, which is what a reader actually reads. This reverses the earlier "rotate colours by sprint" decision deliberately.
**Not changed:** status and priority ramps (those ARE semantic), and `KIND_META` in the tracker, where the tone is a genuine category signal on a small chip.

## 2026-09-14 — The dashboard is real, and the sprint calendar has ONE definition
**Why:** User asked for a dashboard. This reverses the 2026-09-12/13 decision to keep `/dashboard` deliberately empty.
**What it shows** — real reads only, no invented metrics and no chart library: today's log (meetings captured, ticket updates, a Continue/Start action), what needs you (overdue + due-today tracker entries), this sprint's counts, tickets by workflow stage as proportional rows with the number written beside each bar, recent ticket work, and library counts. `lib/dashboard.ts` uses counts and short `take`s — the first screen of the day must stay cheap as history grows.
**Two bugs the build surfaced, both worth remembering:**
1. **The sprint calendar existed twice.** The dashboard and the Work Logs page each derived it, and immediately disagreed by a day — one worked in local days, the other in UTC. It now lives once in `lib/sprint.ts` (`getSprint`), imported by both. **Do not re-derive it.**
2. **`toDateOnly` reads UTC components.** Feeding it a local-midnight Date shifts it a day west of here (IST is UTC+5:30). Work log dates are stored as UTC midnight of a LOCAL calendar day, so the dashboard needs `utcDayOf` for queries and keeps the local window for display.
**And one consistency rule:** the dashboard's "work logs this sprint" filters weekends, because the Work Logs page renders weekday logs only. A plain count read 10 where the page showed 8. **A dashboard that disagrees with the page it links to is worse than no dashboard** — when adding a metric, match how the destination page counts it.

## 2026-09-19 — The public homepage is “The Quiet Studio”
**Why:** The user supplied a complete personal-workspace portfolio composition and a folder of matched light/dark photography, explicitly asking for that full layout in both themes.
**Decision:** `/` and `/banner` share one semantic `PortfolioHome`. Photography ships as separate paired assets, never as a flattened page screenshot. The visual system is scoped to `.portfolio-page` with `--pf-*` tokens so the authenticated teal/graphite application is untouched. Plus Jakarta Sans carries UI/display, Bricolage the environmental note, and official self-hosted Cormorant Garamond the coast quote.
**Responsive rule:** desktop keeps the asymmetric cinematic composition; mobile uses a visible four-link navigation, 44px theme toggle, single-column cards and wrapped copy. Validate true 375px and 1440px viewports in both themes with `scrollWidth === innerWidth`.
**Truth rule:** use only live internal destinations. Contact and social links are omitted until the user supplies real addresses; placeholder email and generic platform homepages are not acceptable.

## 2026-09-19 — Dark portfolio photography is canonical
**Why:** The first light set used separate scenes, so people, landscape features, crops and object placement visibly jumped when the theme changed.
**Decision:** `hero-dark.png`, `mountain-dark.png`, `headphones-dark.png`, `about-dark.png` and `coast-dark.png` are the canonical compositions. Their `*-light-v2.png` partners are generated lighting-only daylight edits. Subject identity, pose, crop, geometry and focal point stay fixed; only light, exposure, atmosphere and time of day change. The coast daylight edit also removes the source's baked overlay marks so semantic HTML remains the only quote layer.
**UI consequence:** Both theme layers share one responsive container and object position. Theme changes use opacity only, cards reserve their aspect ratio, keyboard focus receives the same image response as hover, and focus outlines never alter component radius.

## 2026-09-19 — Homepage motion is state-led, not navigation choreography
**Why:** The user requested Motion and Skiper UI 40 after the matched day/night assets shipped. Skiper 40 is a CSS-only animated-link set, while Motion is suitable for an interruptible theme-state exchange.
**Decision:** Keep the menu static. Use `motion/react` for the 180ms Sun/Moon icon change, preserving the existing CSS image cross-fade; use Skiper UI `Link000` only on secondary hero/dashboard links, with focus and reduced-motion equivalents. Attribute the free Skiper component in the footer. Do not import the registry demo with its placeholder email links into the page.

## 2026-09-19 — Full-viewport portfolio hero and replayable content motion

**Why:** The user asked for a full-screen home banner and animation that works while scrolling down and back up, not a one-time entrance.

**Decision:** The homepage hero uses `min-height: 100dvh` (`100vh` fallback), expanding when needed. A shared `PortfolioReveal` observes text and card boundaries and uses Motion for restrained opacity/transform reveals. It resets on viewport exit, so re-entry in either direction replays. The menu remains static. The first observer report begins from a visible SSR/no-JS baseline, and reduced-motion users see the final state without spatial travel.

## 2026-09-19 — About image blends into its page ground

**Why:** The split About photograph had a visible vertical seam and an explicit inset 1px divider against the copy panel.

**Decision:** Remove the divider and mask the actual paired photographs from transparent to opaque across the desktop left edge; switch the same mask to a top-edge fade in the stacked mobile layout. The existing `--pf-bg` ground shows through, so both themes blend without a separate overlay color or new image asset.

## 2026-09-19 — Keep the coast visible behind the quote

**Why:** The coast photograph was nearly black because `brightness(.52)` compounded with two dark overlays; the horizon and rocks disappeared in dark mode.

**Decision:** Crop the paired photographs toward the horizon. Use scoped quote filter/shade tokens so the dusk frame gets a mild brightness lift and a lighter overlay, while the daylight frame keeps enough shading for white text. No new image or page-wide palette change.
## 2026-09-20 — Public auth matches the Quiet Studio
**Why:** The teal auth canvases diverged from the homepage, and tall registration content was being vertically centered below the visible viewport.

**Decision:** Public auth uses the homepage's warm-paper/graphite tokens and the same paired day/night photography, with the sam. wordmark and single theme toggle. Login and registration keep distinct copy and image compositions, while their existing server actions, field labels, validation, and error behavior are unchanged. Desktop form columns start within the available viewport and scroll internally only when content exceeds it.

## 2026-09-20 — Section-aware public navigation
**Why:** A permanently underlined Home link gave no feedback while scrolling, and the latest request asked for a moving menu state.

**Decision:** PortfolioNav tracks the visible public sections and animates one active indicator with Motion. The indicator is semantic-adjacent decoration; current location is also exposed through aria-current. Notes remains a route link without pretending to be a page section.
## 2026-09-20 — Session-aware public CTA and scroll navbar
**Why:** Public auth should stay focused, while homepage visitors need a clear account entry point and visible scroll feedback.

**Decision:** Auth routes keep only the sam. home link and theme control, with no marketing navigation. The homepage header CTA uses getCurrentUser: signed-out users see Sign in and signed-in users see Open dashboard. The navbar gains a compact surface/lift state after scroll, and its active section indicator remains animated.
## 2026-09-20 — Contact leads into the coast quote
**Why:** The contact panel was appearing after the landscape, and the dark landscape frame looked muted beneath its text treatment.

**Decision:** Render the contact/footer block before the coast quote. Keep the photographic asset unchanged, but apply a scoped dark-mode lift (brightness, contrast, saturation) and reduce the quote shade so the image remains crisp and legible.

## 2026-09-20 — Opaque authenticated header and restrained dashboard cards
**Why:** A transparent sticky nav obscured content while scrolling, and a thick warm edge on the dashboard Today card read as an accidental outline instead of the homepage's restrained style.

**Decision:** Give the shared app nav an opaque theme surface and solid separator, retain its underline and visible focus ring, and keep the Today card flat graphite with a token border and inverse CTA. Animate dashboard cards only through small opacity/translation entry with a visible initial state and reduced-motion fallback; do not add dramatic blur or hidden-on-load content.

## 2026-09-20 — One photographic dashboard card on white
**Why:** The dashboard's paper tint and repeated outlined boxes still looked dull and disconnected from the homepage; the user explicitly wanted a white canvas, less border, and one matched background image.

**Decision:** Scope pure-white daylight ground to `/dashboard`, remove full outlines from its panels, and reuse the existing Work Log day/night photograph in Today only. Keep imagery clear by placing text on its own solid surface instead of under a dark overlay. Add one real sprint-day SVG visualization rather than decorative illustration, and retain semantic text for all status information.

## 2026-09-20 — Dashboard image and layout replaced after rendered feedback
**Why:** The Work Log image compressed into a narrow card crop and the repeated warm gray panels read dusty, even with white page background.

**Decision:** Make Today a full-width split feature with a newly generated cool-daylight workspace photo showing the laptop screen. Keep it the only photographic card and leave the image free of text overlays. Place Focus in one subtle slate-blue panel; render Sprint and Recent as open, ruled content sections. Use dashboard-only cool slate/blue tokens in light/dark modes so the user's other authenticated pages and homepage remain unaffected. Preserve every real metric and destination.

## 2026-09-20 — Dashboard shortcut actions and graphite dark canvas
**Why:** The shortcut dock looked like an unstructured hover block, the greeting lacked the homepage's editorial scale, and dark mode was too blue for the requested `#101012` canvas.

**Decision:** Show Notes, Resources, and Sprint logs as bordered actions with live counts and arrow SVG icons. Increase the dashboard greeting to a 5xl/6xl editorial scale and keep Work Logs on the same route-scoped cool tokens. Set the dark canvas to `#101012` and use nearby graphite shades for cards instead of brown or teal surfaces.

## 2026-09-21 — Clear notebook Today feature and single-user demo reset
**Why:** The prior laptop/calendar photograph exposed an unwanted date label and did not fit the dashboard. The user also requested a complete local-data reset with one known dummy account.

**Decision:** Use the existing paired Work Logs notebook photographs for the dashboard Today feature, remove its date label and outer card border, and keep the icon, copy, metrics, and actions on one left edge. `npm run db:seed` now deletes every local user and cascade-owned record before creating exactly one dummy user; treat it as a destructive local-development command, not an additive seed.

## 2026-09-21 — Work-log timeline joins the scoped product theme
**Why:** The read-only timeline route did not carry the `work-logs-page` scope, so it fell back to the older warm palette and amplified the mismatch with a gold rule, shadows, and multiple layers of bordered cards.

**Decision:** Scope the detail route to the existing Work Logs palette, remove decorative eyebrow labels and the gold rule, render timeline groups as open ruled sections, and consolidate glance information into one tonal sticky rail. Keep all content, collapse behavior, ticket anchors, and edit/navigation actions unchanged.

## 2026-09-21 — One palette for every authenticated route
**Why:** Tracker, Notes, Resources, editors, and deferred routes still inherited the older cream/brown shell while Dashboard and Work Logs used the approved cool daylight/graphite system. This made navigation between product pages feel like switching products and left hardcoded white Notes surfaces broken in dark mode.

**Decision:** Promote the cool white/blue-slate and `#101012` graphite tokens to `.app-shell` so every authenticated page inherits them. Keep marketing and public auth palettes scoped and unchanged. Replace Notes-only hardcoded white/ink colors with semantic surface/sidebar tokens and use theme-aware foregrounds for filled navigation states.

## 2026-09-22 — Work-log fields use WYSIWYG Markdown without a data migration
**Why:** Plain textareas did not support the requested `* ` list conversion or selection shortcuts such as Ctrl/Cmd+B, and the outlined teal card grid no longer matched the authenticated product theme.

**Decision:** Use one compact TipTap Markdown field for meeting notes and ticket-work descriptions. Input rules convert Markdown syntax into visible formatting while a small serializer writes Markdown back into the existing string fields, preserving autosave actions and database schema. Render the same Markdown through the read-only timeline/history component. Restructure the editor as open ruled sections with one summary rail, and communicate ticket status with text-labelled controls instead of thick colored card edges.

## 2026-09-22 — Work-log editor becomes a focused master-detail workspace
**Why:** The first redesign still showed four equally large tinted editors at once. Their low-contrast fills read as read-only output, repeated toolbars dominated the page, and the separate summary rail preserved the old layout rather than changing the task flow.

**Decision:** Show four meetings as compact selectable states and mount one clearly labelled, strongly bounded editor for the selected meeting. Integrate live counts and autosave into a graphite command header, remove the editor summary sidebar, and let ticket work follow at full width. On mobile the meeting choices become a two-column grid before the editor, preserving DOM and focus order.

## 2026-09-24 — MUI for form fields (user request)
User asked for MUI (Autocomplete page as the reference) on all fields. `@mui/material` v9 + emotion + `@mui/material-nextjs` (v16-appRouter) installed.
- `components/ui/mui-provider.tsx` — theme + `AppRouterCacheProvider` with `enableCssLayer`; wraps only `(app)/layout.tsx` (marketing/auth untouched). `globals.css` declares `@layer theme, base, mui, components, utilities;` so Tailwind utilities still override MUI.
- Theme palette = hexes (#3c6e71 / #284b63 / #353535) for MUI's alpha math; all visible colours in styleOverrides read `var(--c-*)` tokens so dark mode and page scopes (e.g. `.wl-hero`) still work.
- `Input` / `Select` / `Textarea` in `components/ui/` are now MUI-backed but keep the native prop surface (Select maps `<option>` children to MenuItem and returns `{target:{value}}`). `Input` adds `bare` (InputBase, for custom containers) and `startIcon`/`endIcon` adornments. `Field` label gets `id={htmlFor}-label` for Select's aria-labelledby.
- Ticket search (`work-log/ticket-search.tsx`) is an MUI Autocomplete (freeSolo) over `listTickets({take:200})`; pick = lookup, Enter = old find/attach/create flow.
- Global focus outline suppressed on `.MuiInputBase-input/.MuiSelect-select/.MuiAutocomplete-input` (MUI's 2px teal border is the indicator).
- Deliberately NOT converted: notes move-to-section pill select and code-block language chip (inline micro-controls).
