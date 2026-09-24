"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";

import { cn } from "@/components/cn";
import { PRIMARY_NAV } from "@/components/shell/nav-items";

/** History never notifies us; a re-render on navigation is close enough. */
function subscribeNever() {
  return () => {};
}

/** A nav root has nothing above it in the app, so there is nothing to go back to. */
function isNavRoot(pathname: string) {
  return PRIMARY_NAV.some((item) => item.href === pathname);
}

/**
 * Back control, first thing on the left of the top bar.
 *
 * `router.back()` rather than a hardcoded parent link: the useful "back" from a
 * work-log timeline is wherever you came from (the sprint list, a search, the
 * editor), not a fixed route.
 *
 * It renders only when both are true — we are not on a nav root, and the tab
 * actually has history to pop. `history.length` is read after mount because it
 * does not exist on the server; until then the slot is held open at a fixed
 * width so the header never reflows (design.md: reserve space, no CLS).
 */
export function BackButton() {
  const pathname = usePathname();
  const router = useRouter();
  // Server snapshot is `false`, client snapshot reads the real tab history, so
  // the button appears on hydration without an effect or a cascading render —
  // the same pattern the top bar uses for the clock.
  const hasHistory = useSyncExternalStore(
    subscribeNever,
    () => window.history.length > 1,
    () => false,
  );

  const show = hasHistory && !isNavRoot(pathname);

  return (
    <div className="flex h-10 w-10 shrink-0 items-center">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        title="Go back"
        tabIndex={show ? undefined : -1}
        className={cn(
          "group grid size-10 cursor-pointer place-items-center rounded-full text-text-muted",
          "transition-[color,background-color,opacity] duration-150 ease-standard",
          "hover:bg-surface-2 hover:text-text active:bg-surface-3",
          show ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <ArrowLeft
          className="size-5 transition-transform duration-150 ease-standard group-hover:-translate-x-0.5"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
