import Link from "next/link";

import { ArrowRight, BrandCube, SearchIcon } from "@/components/banner/banner-icons";

const LINKS = [
  { label: "Home", href: "#banner", current: true },
  { label: "Features", href: "#toolkit", current: false },
  { label: "About", href: "#closing", current: false },
] as const;

/**
 * Floating glass pill. Its gutter (`lg:inset-x-[5.3%]`) is the comp's 88px of
 * 1648, so the pill's left edge lines up with the hero copy and its right edge
 * with the scene furniture. Height and type scale with the canvas — see the
 * `.bn-nav-*` rules in banner.css.
 *
 * Below lg the link list drops out rather than collapsing into a hamburger:
 * these three anchors are secondary to the primary CTA, so a menu button would
 * be a control that does nothing. Logo, search and the CTA stay.
 */
export function BannerNav() {
  return (
    <nav
      aria-label="Primary"
      className="absolute inset-x-4 top-4 z-30 md:inset-x-8 lg:inset-x-[5.3%] lg:top-[3.2%]"
    >
      <div className="bn-nav bn-nav-inner bn-glass flex items-center gap-3 rounded-full">
        <Link href="#banner" className="flex items-center gap-2.5 rounded-full pl-1 lg:gap-3">
          <BrandCube className="bn-brand-mark" />
          <span className="bn-brand">WorkNest</span>
        </Link>

        <ul className="hidden flex-1 items-center justify-center gap-[3vw] lg:flex">
          {LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                aria-current={link.current ? "page" : undefined}
                className="bn-navlink relative block py-1"
              >
                {link.label}
                {link.current && (
                  <span
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full"
                    style={{ background: "var(--bn-accent-1)" }}
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:gap-[0.9vw]">
          <button
            type="button"
            aria-label="Search"
            className="bn-search hidden shrink-0 items-center justify-center rounded-full md:flex"
          >
            <SearchIcon className="size-[45%]" />
          </button>
          <Link href="/register" className="bn-btn bn-cta bn-nav-cta">
            Get started
            <ArrowRight className="size-[1.1em]" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
