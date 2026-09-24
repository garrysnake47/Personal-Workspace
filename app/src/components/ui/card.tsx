import * as React from "react";

import { cn } from "@/components/cn";

/**
 * Card — flat. Border, never a shadow (design.md §7). 16px padding (§9);
 * `padding="lg"` (24px) is reserved for the work-log editor and empty states.
 */
export function Card({
  className,
  padding = "md",
  as: Tag = "div",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  padding?: "none" | "md" | "lg";
  as?: "div" | "section" | "article" | "aside";
}) {
  return (
    <Tag
      className={cn(
        "rounded-lg border border-border bg-card",
        padding === "md" && "p-4",
        padding === "lg" && "p-6",
        className,
      )}
      {...props}
    />
  );
}

/** Title row of a card. Keeps the 16px/600 heading consistent everywhere. */
export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold text-text">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs text-text-subtle">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
