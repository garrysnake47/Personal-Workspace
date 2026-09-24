# Shared rules — every agent reads this first

## Memory protocol (non-negotiable)
Before doing anything, read these files. They are the shared brain for BOTH Claude and Codex:

- `memory/project.md`      — what we're building, stack, goals
- `memory/map.md`          — codebase map: what lives where (read this INSTEAD of re-scanning the repo)
- `memory/design.md`       — colors, typography, spacing, component rules
- `memory/decisions.md`    — decisions already made, with the why
- `memory/worklog.md`      — running log of what changed, newest at top

After you finish a task, you MUST update memory:
- New/moved/deleted files or a new module → update `memory/map.md`
- A choice someone could later second-guess → append to `memory/decisions.md`
- Anything you did → append one line to `memory/worklog.md` as:
  `YYYY-MM-DD | <agent> | <what changed> | <files>`

Never re-explore the whole codebase if `memory/map.md` already answers the question.
If the map is wrong, fix the map as part of your task.

## Working style
- Vibe coding: ship working code fast, keep it readable, don't over-engineer.
- Stay in your lane. If a task belongs to another role, say so and stop.
- No test suites, no test files. Verification is done by the Sanity Checker by looking at the real thing.
- Small, focused changes. Don't refactor things nobody asked about.
