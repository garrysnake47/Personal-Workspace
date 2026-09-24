import Link from "next/link";

import { Container } from "@/components/marketing/primitives";

/**
 * Footer. A hairline panel in the marketing world's own chrome — elevation is
 * declared once, as a border, with no shadow under it.
 */

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      // Only #how-it-works exists on the homepage now — see the note in
      // marketing-nav.tsx.
      { href: "#how-it-works", label: "How it works" },
      { href: "/work-logs", label: "Work Logs" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create an account" },
    ],
  },
] as const;

// No `signedIn` prop any more: the footer is links only since the closing CTA
// moved into the page itself. Callers pass nothing.
export function MarketingFooter() {
  return (
    <footer className="w-full pb-4 md:pb-6">
      <Container>
        <div className="rounded-xl border border-border bg-surface px-5 py-5 md:px-8 md:py-6">
          {/* Asymmetric closing CTA: headline left, action right. The old
              version was another centred stack, which made the page end on the
              same shape it used to open on. */}
          {/* The big closing CTA that used to live here was removed: the page
              already ends on a "Start with today." section, and two stacked
              calls to action saying the same thing is the exact clutter the
              homepage was trimmed to avoid. The footer is now links only. */}
          <div className="grid gap-5 md:grid-cols-[1.4fr_1fr_1fr] md:gap-8">
            <div className="flex flex-col gap-3">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-[var(--c-primary)]"
                >
                  <span className="size-2 rounded-full bg-[var(--c-primary)]" />
                </span>
                <span className="m-display text-lg text-text">
                  WorkNest
                </span>
              </span>
              <p className="max-w-xs text-sm text-text-muted">
                Daily work logs, meeting notes, and ticket updates — one focused
                place for everything you did at work.
              </p>
            </div>

            {FOOTER_COLUMNS.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <h3 className="text-2xs font-semibold tracking-[0.14em] text-text-subtle uppercase">
                  {column.heading}
                </h3>
                <ul className="mt-2 flex flex-row flex-wrap gap-x-4 gap-y-2 md:flex-col">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-block rounded-md text-md text-text-muted transition-[color,transform] duration-150 ease-power1-out hover:-translate-y-px hover:text-accent-text"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <p className="mt-4 border-t border-border pt-3 text-xs text-text-subtle">
            WorkNest — a focused single-user work management app.
          </p>
        </div>
      </Container>
    </footer>
  );
}
