"use client";

import { format } from "date-fns";
import { LogOut, Menu as MenuIcon, SquareStack, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";

import { logout } from "@/actions/auth";
import { cn } from "@/components/cn";
import { BackButton } from "@/components/shell/back-button";
import { Menu, MenuSeparator, menuItemClass } from "@/components/shell/menu";
import { PRIMARY_NAV, isActivePath } from "@/components/shell/nav-items";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export type ShellUser = {
  id: string;
  name: string | null;
  email: string | null;
};

/**
 * The authenticated navigation — a floating pill, the same shape the homepage
 * uses (`marketing/marketing-nav.tsx`): surface fill, hairline top/left edge,
 * thick brand bottom/right edge, fully rounded.
 *
 * This replaced the sidebar outright. Sections live in the centre of the pill
 * on md+, and collapse into a dropdown sheet below it on phones.
 *
 * It is `sticky`, not `fixed`: fixed would sit over the content well and every
 * page would need its own top padding to compensate. `scroll-padding-top` in
 * globals.css is tuned to this height — change one, change the other
 * (WCAG 2.2 AA 2.4.11).
 */
export function AppNav({
  user,
  /** Rendered on the server; the client re-reads its own clock on hydration. */
  todayLabel,
}: {
  user: ShellUser;
  todayLabel: string;
}) {
  const pathname = usePathname();

  // The sheet is open FOR a route, not open in the abstract. Navigating changes
  // `pathname`, so it closes itself during render — no effect, no cascading
  // re-render, and no way to land on a page with the menu still covering it.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const setOpen = (next: boolean) => setOpenFor(next ? pathname : null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenFor(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // The server's timezone is not necessarily the user's, so the date is read as
  // an external store: server snapshot is what was rendered, client snapshot is
  // the browser's own clock. No effect, no cascading render.
  const today = useSyncExternalStore(
    subscribeNever,
    () => format(new Date(), "EEE, d MMM yyyy"),
    () => todayLabel,
  );

  return (
    <header className="app-header sticky top-0 z-40 border-b border-border bg-bg px-3 md:px-5 lg:px-8">
      <div className="mx-auto w-full max-w-[85rem]">
        <div
          id="app-nav"
          className={cn(
            "flex h-16 items-center gap-3 bg-bg text-text",
            "px-0 md:h-[5.5rem] md:gap-4",
            // Three columns from md so the sections sit dead centre regardless
            // of how wide the brand or the account block happen to be.
            "md:grid md:grid-cols-[1fr_auto_1fr]",
          )}
        >
          {/* Brand + back are ONE grid item. The pill is a 3-column grid from
              md, so a fourth top-level child would wrap onto a second row. */}
          <div className="flex shrink-0 items-center gap-1 md:justify-self-start">
            <Link
              href="/dashboard"
              className="flex shrink-0 items-center gap-2 rounded-md"
              aria-label="WorkNest — home"
            >
              <span
                aria-hidden="true"
                className="grid size-8 place-items-center rounded-md bg-text text-text-inverse"
              >
                <SquareStack className="size-4" />
              </span>
              <span className="hidden text-lg font-extrabold tracking-tight text-text xs:inline">
                WorkNest
              </span>
            </Link>

            <BackButton />
          </div>

          {/* Sections — desktop only; the sheet below carries them on phones. */}
          <nav aria-label="Sections" className="hidden min-w-0 md:block md:justify-self-center">
            <ul className="flex items-center gap-1 lg:gap-2">
              {PRIMARY_NAV.map((item) => {
                const active = isActivePath(pathname, item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold",
                        "transition-colors duration-150 ease-standard",
                        // The current section is marked by a rule under the
                        // label, not a filled chip. The rule is always in the
                        // DOM and only fades, so nothing reflows on navigation.
                        "after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:rounded-full",
                        "after:bg-text after:transition-opacity after:duration-150",
                        active
                          ? "text-text after:opacity-100"
                          : "text-text-muted hover:text-text after:opacity-0",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0 md:justify-self-end">
            <time
              dateTime={new Date().toISOString().slice(0, 10)}
              className="hidden text-sm font-medium text-text-subtle lg:block"
              suppressHydrationWarning
            >
              {today}
            </time>

            <Menu
              label="Account"
              trigger={(props) => (
                <button
                  {...props}
                  type="button"
                  aria-label="Account menu"
                  className="flex h-10 cursor-pointer items-center gap-2 rounded-full pr-2 pl-1 transition-colors duration-150 ease-standard hover:bg-surface-2 active:bg-surface-3"
                >
                  <Avatar name={user.name} email={user.email} />
                  <span className="hidden max-w-32 truncate text-sm font-medium text-text lg:block">
                    {user.name ?? user.email ?? "Account"}
                  </span>
                </button>
              )}
            >
              <div className="px-2 pt-1 pb-2">
                <p className="truncate text-sm font-semibold text-text">
                  {user.name ?? "Signed in"}
                </p>
                {user.email ? (
                  <p className="truncate text-xs text-text-subtle">{user.email}</p>
                ) : null}
              </div>

              <MenuSeparator />

              <div
                className="flex items-center justify-between gap-2 px-2 py-1"
                // Choosing a theme shouldn't dismiss the menu.
                onClick={(event) => event.stopPropagation()}
              >
                <span className="text-sm font-medium text-text-muted">Theme</span>
                <ThemeToggle />
              </div>

              <MenuSeparator />

              <form action={logout}>
                <button type="submit" role="menuitem" className={menuItemClass}>
                  <LogOut aria-hidden="true" />
                  Logout
                </button>
              </form>
            </Menu>

            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="app-mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="relative grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-border-strong text-text transition-colors duration-150 ease-standard hover:bg-surface-2 md:hidden"
            >
              <MenuIcon
                aria-hidden="true"
                className={cn(
                  "absolute size-4 transition-[opacity,transform] duration-200",
                  open && "rotate-90 opacity-0",
                )}
              />
              <X
                aria-hidden="true"
                className={cn(
                  "absolute size-4 -rotate-90 opacity-0 transition-[opacity,transform] duration-200",
                  open && "rotate-0 opacity-100",
                )}
              />
            </button>
          </div>
        </div>

        {open ? (
          <nav
            id="app-mobile-menu"
            aria-label="Sections"
            className="mt-2 rounded-2xl border border-border bg-surface p-2 shadow-md md:hidden"
          >
            <ul className="flex flex-col">
              {PRIMARY_NAV.map((item) => {
                const active = isActivePath(pathname, item);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-md font-semibold",
                        "transition-colors duration-150 ease-standard hover:bg-surface-2",
                        active
                          ? "text-text underline decoration-2 underline-offset-4"
                          : "text-text-muted",
                      )}
                    >
                      <item.icon className="size-5 shrink-0" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li className="flex items-center justify-between gap-3 border-t border-border px-3 py-2">
                <span className="text-sm font-semibold text-text-muted">Theme</span>
                <ThemeToggle />
              </li>
            </ul>
          </nav>
        ) : null}
      </div>
    </header>
  );
}

/** The clock never notifies us; a re-render is close enough for a date. */
function subscribeNever() {
  return () => {};
}

/** Initials avatar. No image uploads in this build, so no `<img>` fallback dance. */
function Avatar({ name, email }: { name: string | null; email: string | null }) {
  const source = (name ?? email ?? "?").trim();
  const initials =
    source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <span
      aria-hidden="true"
      className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-semibold text-text"
    >
      {initials}
    </span>
  );
}
