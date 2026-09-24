"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "@/components/cn";
import { useTheme } from "@/components/theme/theme-provider";
import type { Theme } from "@/components/theme/theme";

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
];

/**
 * Three-way theme control. A segmented control is a functional boundary, so the
 * frame uses `border-strong` (design.md §2).
 *
 * The selected segment comes from `useSyncExternalStore`, so the server renders
 * "System" and the client corrects to the persisted choice on hydration. The
 * colours themselves were already right from the first paint — the inline
 * script in <head> saw to that.
 */
export function ThemeToggle({
  className,
  tone = "surface",
}: {
  className?: string;
  /** `sidebar` renders on the permanently graphite rail, `surface` on a page. */
  tone?: "surface" | "sidebar";
}) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={cn(
        // Taller on touch: three 44px segments below md, 36px on pointer.
        "inline-flex h-12 items-center rounded-md border p-px md:h-9",
        // `sidebar-border` is 1.26:1 on the rail - invisible as a control
        // boundary. `sidebar-subtle` clears 3:1 (SC 1.4.11).
        tone === "sidebar" ? "border-sidebar-subtle" : "border-border-strong",
        className,
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex h-full w-11 cursor-pointer items-center justify-center rounded-sm md:w-8",
              "transition-colors duration-150 ease-standard",
              tone === "sidebar"
                ? "text-sidebar-subtle hover:bg-sidebar-2 hover:text-sidebar-fg active:bg-sidebar-3"
                : "text-text-subtle hover:bg-surface-2 hover:text-text active:bg-surface-3",
              selected &&
                (tone === "sidebar"
                  ? "bg-sidebar-accent-bg text-sidebar-accent hover:bg-sidebar-accent-bg hover:text-sidebar-accent"
                  : "bg-primary-subtle text-primary hover:bg-primary-subtle hover:text-primary"),
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
