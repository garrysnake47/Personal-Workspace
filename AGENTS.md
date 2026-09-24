# Project instructions (shared by Claude Code and Codex)

## Shared memory — read this before anything else
`memory/` is the shared brain for both Claude and Codex. Read it at the start of every session:

- `memory/project.md`   — what we're building, stack, goals
- `memory/map.md`       — codebase map; read this INSTEAD of re-scanning the repo
- `memory/design.md`    — colors, typography, spacing tokens
- `memory/decisions.md` — decisions already made, and why
- `memory/worklog.md`   — what changed recently

Update memory when you finish work. Details in `agents/_shared.md`.

## Agent team
Role definitions live in `agents/` and are used by both tools:

| Role | File | Owns |
|---|---|---|
| Lead | `agents/lead.md` | Planning, splitting work, final call |
| UI Designer | `agents/ui-designer.md` | Colors, typography, spacing, visual consistency |
| Frontend Dev | `agents/frontend-dev.md` | Components, pages, routing, client state |
| Backend Dev | `agents/backend-dev.md` | API, data models, auth, validation |
| Sanity Checker | `agents/sanity-checker.md` | Responsive, a11y, correctness — last pass |

**Claude Code:** these are real subagents in `.claude/agents/`. Invoke by name.
**Codex:** these are slash commands — `/lead`, `/ui-designer`, `/frontend-dev`, `/backend-dev`, `/sanity-checker`.

## House rules
- Vibe coding: working code fast, readable, not over-engineered.
- No test files, no test suites. The Sanity Checker verifies the real rendered thing.
- Frontend uses design tokens only — no hardcoded colors, font sizes, or spacing.
- Stay in your lane; hand off rather than reaching into another role's area.

## Installed skill: UI/UX Pro Max
`.claude/skills/` (Codex: `.codex/skills/`, same files via symlink) holds the **ui-ux-pro-max** skill bundle — 79 UI styles, 192 color palettes, 74 font pairings, 119 UX guidelines, 25 chart types, 22 stacks.

Skills: `ui-ux-pro-max`, `design`, `design-system`, `ui-styling`, `brand`, `banner-design`, `slides`.

**Use it for every visual decision.** Don't invent palettes or font pairings from scratch — query the skill's data first, then record the chosen result in `memory/design.md`.

Its search scripts need Python 3 (present: 3.14). The scripts are local-only — no network calls, no installs.

**Claude:** the skills load automatically.
**Codex:** read `.codex/skills/ui-ux-pro-max/SKILL.md` and run its scripts directly.
