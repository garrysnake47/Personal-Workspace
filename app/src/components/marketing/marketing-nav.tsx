"use client";

import { useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { cn } from "@/components/cn";
import { Container } from "@/components/marketing/primitives";
import { ThemeToggle } from "@/components/theme/theme-toggle";

/**
 * Floating pill nav, modelled on the reference site: white fill,
 * hairline top/left edge, thick brand-blue bottom/right edge, fully rounded.
 *
 * Client-side state owns the mobile menu and the active section indicator.
 * IntersectionObserver watches only the three homepage sections; content
 * visibility never depends on it.
 */

const NAV_LINKS = [
  // Every entry here MUST resolve to a real id on the homepage — the previous
  // version advertised #product / #pricing / #faq, which scrolled nowhere.
  // These three are the three sections.
  { href: "#top", label: "Overview" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#start", label: "Get started" },
] as const;

type SectionHref = (typeof NAV_LINKS)[number]["href"];

/** Keep real hashes for deep links while making the exact motion explicit. */
function scrollToSection(href: SectionHref) {
  const target = document.querySelector<HTMLElement>(href);
  if (!target) return;

  target.scrollIntoView({
    block: "start",
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
}

export function MarketingNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("#top");
  const close = () => setOpen(false);

  function navigateToSection(
    event: MouseEvent<HTMLAnchorElement>,
    href: SectionHref,
  ) {
    event.preventDefault();
    window.history.pushState(null, "", href);
    setActiveHref(href);
    scrollToSection(href);
  }

  useEffect(() => {
    const sections = NAV_LINKS.map(({ href }) =>
      document.querySelector<HTMLElement>(href),
    ).filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveHref(`#${visible.target.id}`);
      },
      { root: null, threshold: [0.45, 0.6, 0.75] },
    );

    sections.forEach((section) => observer.observe(section));

    const syncHash = () => {
      const href = window.location.hash as SectionHref;
      if (NAV_LINKS.some((link) => link.href === href)) {
        setActiveHref(href);
        scrollToSection(href);
      }
    };
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    if (window.location.hash) requestAnimationFrame(syncHash);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-20 pt-3 md:pt-4">
      <Container>
        <div
          className={cn(
            "pointer-events-auto",
            // Elevation is declared ONCE — a hairline, no shadow under it.
            "rounded-2xl border border-border bg-surface/85 backdrop-blur-md",
            "flex h-14 items-center gap-4 px-4 md:grid md:h-16 md:grid-cols-[1fr_auto_1fr] md:px-5",
          )}
        >
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 rounded-md"
            aria-label="WorkNest — home"
          >
            <span
              aria-hidden="true"
              className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-[var(--c-primary)]"
            >
              <span className="size-2 rounded-full bg-[var(--c-primary)]" />
            </span>
            <span className="m-display text-lg text-text">WorkNest</span>
          </Link>

          {/* Centre links — desktop only. */}
          <nav aria-label="Sections" className="hidden justify-self-center md:block">
            <ul className="flex items-center gap-6 lg:gap-7">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={(event) => navigateToSection(event, link.href)}
                    aria-current={activeHref === link.href ? "location" : undefined}
                    data-active={activeHref === link.href ? "true" : "false"}
                    className="marketing-nav-link relative inline-flex min-h-11 items-center rounded-md px-1 text-md font-semibold text-text-muted hover:text-accent-text"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-0 md:justify-self-end md:gap-4">
            <ThemeToggle className="hidden bg-surface md:inline-flex" />
            {signedIn ? (
              <Link
                href="/work-logs"
                className={"inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-bold whitespace-nowrap text-[var(--c-primary-fg)] transition-colors duration-150 hover:bg-primary-hover md:px-5"}
              >
                {/* The full label does not fit the pill at 360px. */}
                <span className="md:hidden">Work Logs</span>
                <span className="hidden md:inline">Open Work Logs</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden rounded-md text-md font-semibold text-text hover:text-accent-text md:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className={"inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-bold whitespace-nowrap text-[var(--c-primary-fg)] transition-colors duration-150 hover:bg-primary-hover md:px-5"}
                >
                  Get started
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="marketing-mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-border-strong text-text transition-colors duration-150 ease-power1-out hover:bg-surface-2 md:hidden"
            >
              <Menu aria-hidden="true" className={cn("absolute size-4 transition-[opacity,transform] duration-200", open && "rotate-90 opacity-0")} />
              <X aria-hidden="true" className={cn("absolute size-4 -rotate-90 opacity-0 transition-[opacity,transform] duration-200", open && "rotate-0 opacity-100")} />
            </button>
          </div>
        </div>

        {open ? (
          <nav
            id="marketing-mobile-menu"
            aria-label="Sections"
            className="marketing-mobile-menu pointer-events-auto mt-2 rounded-2xl border border-border bg-surface p-2 md:hidden"
          >
            <ul className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={(event) => {
                      navigateToSection(event, link.href);
                      close();
                    }}
                    aria-current={activeHref === link.href ? "location" : undefined}
                    className={cn("block rounded-md px-3 py-2.5 text-md font-semibold transition-colors duration-200 hover:bg-surface-2", activeHref === link.href ? "bg-primary-subtle text-accent-text" : "text-text")}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={signedIn ? "/work-logs" : "/login"}
                  onClick={close}
                  className="block rounded-md px-3 py-2.5 text-md font-semibold text-accent-text hover:bg-surface-2"
                >
                  {signedIn ? "Open Work Logs" : "Sign in"}
                </Link>
              </li>
              <li className="flex items-center justify-between gap-3 border-t border-border px-3 py-2">
                <span className="text-sm font-semibold text-text-muted">Theme</span>
                <ThemeToggle />
              </li>
            </ul>
          </nav>
        ) : null}
      </Container>
    </header>
  );
}
