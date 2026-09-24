import { cn } from "@/components/cn";

/* ---------------------------------------------------------------------------
   The commit spine.

   One vertical rail runs the whole page. Every section renders its own segment
   into the same rail column, and because the sections stack with no gaps the
   segments read as a single continuous line. Each segment draws itself on
   entry (globals.css, `.m-spine-path`) — that scroll-linked draw is the page's
   ONE authored moment, which is why nothing else on the page has an entrance.

   This is geometry, not illustration: exact shapes a build can specify, drawn
   as crisp vector at every size.
--------------------------------------------------------------------------- */

/** Rail width. Also set as a CSS var so sections can pad past it. */
export const RAIL = "m-rail";

export type NodeKind = "head" | "commit" | "merge";

/**
 * A rail segment. `nodes` are vertical positions as a 0–1 fraction of the
 * segment, so a section can place its node against its own heading without
 * knowing its pixel height.
 */
export function Rail({
  nodes = [],
  branch = "a",
  className,
}: {
  nodes?: { at: number; kind?: NodeKind; label?: string }[];
  branch?: "a" | "b" | "c";
  className?: string;
}) {
  const stroke = `var(--m-branch-${branch})`;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-y-0 left-0 w-12 select-none lg:w-16",
        className,
      )}
    >
      {/* The hairline the whole page shares. Never animated, so the spine is
          continuous even before a segment has drawn. */}
      <div className="absolute inset-y-0 left-6 w-0.5 -translate-x-1/2 bg-[var(--m-spine)] lg:left-8" />

      {/* The segment that draws. Under reduced motion it simply renders at
          full height, because the untransformed state IS the finished state. */}
      <div
        className="m-spine-draw absolute inset-y-0 left-6 w-0.5 -translate-x-1/2 lg:left-8"
        style={{ background: stroke }}
      />

      {/* A real merge: the branch leaves the spine, bows out, and rejoins at
          the node. Drawn in its own fixed-size SVG rather than the stretched
          viewBox above, so the curve keeps its shape at any section height. */}
      {nodes
        .filter((node) => node.kind === "merge")
        .map(({ at }) => (
          <svg
            key={`merge-${at}`}
            width="48"
            height="132"
            viewBox="0 0 48 132"
            fill="none"
            className="absolute left-6 -translate-x-1/2 lg:left-8"
            style={{ top: `calc(${at * 100}% - 132px)` }}
          >
            <path
              className="m-spine-path"
              d="M24 130 C 7 108, 7 40, 24 14"
              pathLength={100}
              stroke={`var(--m-branch-${branch})`}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </svg>
        ))}

      {nodes.map(({ at, kind = "commit", label }) => (
        <span
          key={`${at}-${kind}`}
          className="absolute left-6 -translate-x-1/2 lg:left-8"
          style={{ top: `${at * 100}%` }}
        >
          <span
            className={cn(
              "m-node-pop grid size-3.5 place-items-center rounded-full border-2",
              kind === "head"
                ? "size-5 border-[var(--c-primary)] bg-[var(--c-primary)]"
                : kind === "merge"
                  ? "border-[var(--m-branch-b)] bg-[var(--c-bg)]"
                  : "border-[var(--m-branch-a)] bg-[var(--c-bg)]",
            )}
          >
            {kind === "head" ? (
              <span className="size-1.5 rounded-full bg-[var(--c-primary-fg)]" />
            ) : null}
          </span>
          {label ? (
            /* Set along the spine, the way a branch is labelled on a graph.
               Centring it under the node clipped it against the page edge. */
            <span
              className="m-data absolute top-7 left-1/2 hidden -translate-x-1/2 text-[0.5625rem] tracking-[0.12em] whitespace-nowrap text-text-subtle uppercase lg:block"
              style={{ writingMode: "vertical-rl" }}
            >
              {label}
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );
}

/** A diff-gutter `+`. Notation from the world, not an icon. */
export function AddMark() {
  return (
    <span
      aria-hidden="true"
      className="m-data mt-0.5 grid size-5 shrink-0 place-items-center rounded-[4px] bg-[var(--m-gutter-add-bg)] text-xs leading-none text-[var(--c-accent-text)]"
    >
      +
    </span>
  );
}
