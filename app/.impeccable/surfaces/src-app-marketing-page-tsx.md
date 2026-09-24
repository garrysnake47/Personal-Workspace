---
version: 1
slug: "src-app-marketing-page-tsx"
primary_target: "src/app/(marketing)/page.tsx"
related_targets: ["src/components/marketing"]
---

# Marketing homepage — `/`

Scope: the public marketing homepage only. Visitor mode: **Persuade**.

Audience: a working software professional who is regularly asked what happened
with a ticket and cannot answer from memory. Action: register. Proof available:
drawn product surfaces in DOM + tokens only — no screenshots, and no invented
users, customers, testimonials, logos, numbers, or pricing (PRODUCT.md, Evidence
on Hand). Constraint: single-user product; no team or sharing language, ever.

Released for this redesign: the incumbent teal / Plus Jakarta Sans system, the
three-section snap scroll, and the current copy. The user asked for a complete
new palette and new design; the old look is evidence, not authority.

## Direction contract

**THESIS:** The working day rendered as version-control history — the one
graphic this audience reads fluently — because a commit log is already the
proof that a record appends and never overwrites. It refuses the SaaS
arrangement the category ships: centred hero, gradient wash, three rounded
feature cards, browser-chrome product shot.

**OWN-WORLD:** Ink ground with a violet cast, drenched, owning the surface.
A continuous vertical commit spine with round nodes and branch lines in a small
categorical ramp. Diff-gutter marks (`+`) lead every list item. Martian Mono
carries display and every SHA, timestamp, and page citation, tabular; Archivo
carries prose. One addition-accent does all the work; the deletion red appears
exactly once on the page, struck through, to show what the product refuses to
do. Recognizable with all content removed by the spine, the gutter marks, and
that single struck red.

**STORY:** The visitor understands that this records the working day as it
happens; believes the history genuinely cannot be rewritten, because they watch
an amend attempt append instead of overwrite; and registers.

**FIRST VIEWPORT:** The commit spine enters top-left and runs the full page
height, continuous across every section. Its first node is today's log, dated.
To its right, the headline in Martian Mono at display scale, then a single
paragraph in Archivo. The three promises hang off the spine as child commits,
each led by a `+`. The primary action sits at the tip of the branch, labelled
as HEAD, with registration language; the secondary is a quiet text link. No
centring, no hero image.

**FORM:** The Commit Graph — version-control history as a graphic system.
Candidate 1 of my ordered grounded list, presented as IMPECCABLE'S PICK and
chosen by the user over the assigned direction. Seed key `c0fbca57`.

**SIGNATURE INTERACTION:** The amend attempt. A real entry with an "Amend this
entry" control; pressing it does not edit. The deletion red strikes once, then
resolves as a new dated node appended below with its own SHA, the original left
dimmed but fully legible. Runnable, keyboard-operable, and the whole
append-only claim is discharged in one gesture.

**MOTION GRAMMAR:** The spine draws itself by stroke-dashoffset as each section
enters; nodes land in sequence behind it. Under `prefers-reduced-motion` the
graph renders complete and static, and the amend attempt resolves without the
strike animation.

**HONEST RISK:** This is where most runs for a developer tool land, and it can
borrow authority from Git rather than earning its own. Mitigation is the palette
and type refusing GitHub's skin entirely, and the graph carrying a product-true
rule Git does not have: this log has no delete.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster carrying its
provenance
