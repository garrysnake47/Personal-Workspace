import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { cn } from "@/components/cn";

/* ---------------------------------------------------------------------------
   Marketing primitives — PUBLIC PAGES ONLY.

   The app UI is dense (14px base, 8px radii, flat). A landing page needs a
   looser, larger scale, so these live apart from `components/ui/*` instead of
   bending those primitives. Tokens only — no hex, no raw colors.

   Colour rule (design.md, "PALETTE REVISED AGAIN"):
     --primary (#017EFD) = 3.89:1  -> LARGE text and large fills / icons only.
     --primary-strong    = 5.51:1  -> anything at normal text size.
   So: accent word, rules, check circles and the offset card edge use
   `primary`; every button label and link at ~15px uses `primary-strong`.
--------------------------------------------------------------------------- */

/** Page gutter + max width shared by every marketing section. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[72rem] px-4 md:px-6", className)}>
      {children}
    </div>
  );
}

/**
 * Small uppercase letter-spaced label above a headline.
 * 11px, so it must use `primary-strong`, never `primary`.
 */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-xs font-semibold tracking-[0.18em] text-accent-text uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

/**
 * The reference site's signature card: a hairline top/left edge and a thick
 * brand-blue bottom/right edge, which reads as a hard offset shadow without
 * being one. Implemented with per-side borders (not box-shadow) so it keeps
 * working in dark mode and in forced-colors mode.
 *
 * Radius is capped at `rounded-2xl` (16px) — design.md §"nothing rounder".
 */
export function OffsetCard({
  as: Tag = "div",
  className,
  children,
}: {
  as?: "div" | "figure" | "section";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag
      className={cn(
        "rounded-2xl bg-surface",
        "border-t border-l border-t-surface-3 border-l-surface-3",
        "border-r-4 border-b-4 border-r-primary border-b-primary",
        "md:border-r-8 md:border-b-8",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

/** Blue circular check bullet + copy. The circle is a large fill, so `primary`. */
export function CheckList({
  items,
  className,
}: {
  items: readonly string[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-fg"
          >
            <Check className="size-3" strokeWidth={3} />
          </span>
          <span className="text-md text-text-muted">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Hover micro-interaction, from `motion.csv` row 1 (Hover / Subtle):
 * 150-200ms, `power1.out`, and its "Do" note — keep displacement under 2px so
 * it reads as feedback, not motion. Transform + colour only; its "Don't" bans
 * animating anything layout-affecting.
 */
const ctaBase =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-md font-bold whitespace-nowrap transition-[transform,background-color,color,border-color] duration-150 ease-power1-out hover:-translate-y-px active:translate-y-0";

export const ctaVariants = {
  /**
   * Filled pill. Deliberately `primary-strong`, NOT `primary`: the label is
   * 15px, and white-on-#017EFD is 3.89:1, which fails AA. Same hue, readable.
   */
  filled: cn(ctaBase, "bg-primary-strong text-primary-fg hover:bg-primary-active"),
  /** Outline pill. A button edge is functional, so `border-strong`, not `border`. */
  outline: cn(
    ctaBase,
    "border border-border-strong bg-surface text-text hover:bg-surface-2",
  ),
} as const;

/** Pill CTA link. `arrow` appends the reference's trailing arrow glyph. */
export function CtaLink({
  href,
  variant = "filled",
  arrow = false,
  className,
  children,
}: {
  href: string;
  variant?: keyof typeof ctaVariants;
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(ctaVariants[variant], className)}>
      {children}
      {arrow ? <ArrowRight aria-hidden="true" className="size-4" /> : null}
    </Link>
  );
}

/** Inline "learn more" link at body size -> `primary-strong`. */
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-md text-md font-semibold text-accent-text hover:underline"
    >
      {children}
      <ArrowRight aria-hidden="true" className="size-4" />
    </Link>
  );
}

/* ---------------------------------------------------------------------------
   Redesign additions (2026-09-12) — see memory/decisions.md.
--------------------------------------------------------------------------- */

/**
 * Asymmetric section header. Replaces the old centred eyebrow + headline +
 * lead stack that made every section look like the same template: the
 * headline sits left on a 7-column measure, the supporting copy sits right
 * and lower. That offset is the page's structural signature — it is used by
 * every section, so the rhythm is consistent without being centred.
 *
 * Each part carries its own reveal (motion.csv row 4, Subtle fade) with a
 * small stagger, so the header assembles rather than popping in as one block.
 */
export function SectionHead({
  eyebrow,
  heading,
  lead,
  id,
  className,
  children,
}: {
  eyebrow: string;
  heading: React.ReactNode;
  lead?: React.ReactNode;
  /** id for the <h2>, so the section can be `aria-labelledby` it. */
  id?: string;
  className?: string;
  /** Optional trailing content under the lead (a link, a CTA). */
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid items-end gap-6 border-t border-border pt-8 md:grid-cols-12 md:gap-10 md:pt-10",
        className,
      )}
    >
      <div className="flex flex-col gap-4 md:col-span-7">
        <div data-reveal="fade">
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <h2
          id={id}
          data-reveal="fade"
          style={{ "--reveal-delay": "40ms" } as React.CSSProperties}
          className="max-w-[24ch] text-3xl font-extrabold tracking-tighter text-balance text-text md:text-6xl"
        >
          {heading}
        </h2>
      </div>

      {lead || children ? (
        <div
          data-reveal="fade"
          style={{ "--reveal-delay": "80ms" } as React.CSSProperties}
          className="flex flex-col gap-4 md:col-span-5 md:pb-1"
        >
          {lead ? <p className="text-md text-text-muted">{lead}</p> : null}
          {children}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Per-word staggered rise for the hero headline.
 * motion.csv row 9 (Stagger List / Complex) — expo.out, 400-700ms — split by
 * word rather than character (see the note in globals.css).
 *
 * The text stays one real text node per word in the DOM, so selection,
 * find-in-page and screen readers are unaffected. If the client controller
 * does not arm motion (no JS or reduced motion), the spans render statically.
 */
export function WordRise({
  text,
  /** ms between words. Row 9's own stagger is 0.015s per CHARACTER. */
  stagger = 40,
  delay = 0,
  accentFrom,
  className,
}: {
  text: string;
  stagger?: number;
  delay?: number;
  /** Zero-based word index from which the copy switches to the accent colour. */
  accentFrom?: number;
  className?: string;
}) {
  const words = text.split(" ");

  return (
    <span data-word-rise className={className}>
      {words.map((word, index) => (
        <span
          // Words repeat, so the index has to be part of the key.
          key={`${word}-${index}`}
          style={
            {
              "--word-delay": `${delay + index * stagger}ms`,
              display: "inline-block",
            } as React.CSSProperties
          }
          className={cn(
            accentFrom !== undefined && index >= accentFrom && "text-primary",
          )}
        >
          {word}
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

/**
 * Hover micro-interaction for cards, from `motion.csv` row 2
 * (Hover / Standard): 200-300ms, `power2.out`, y -4px, scale 1.02.
 *
 * The row's GSAP snippet also tweens a box-shadow; that part is dropped —
 * design.md is flat-first and gives cards a border, not a shadow. Lift plus
 * the blue edge already reads as raised. The reverse is free: it is a CSS
 * transition on the element itself, so a fast pointer-out can never leave the
 * card stuck mid-hover (row 2's "Don't").
 */
export const cardHover =
  "transition-transform duration-250 ease-power2-out hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none";
