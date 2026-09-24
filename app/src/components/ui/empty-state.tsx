import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/components/cn";

/**
 * Empty state — design.md §10: 24px padding, a 20px muted Lucide icon, one line
 * of `text-md text-text-muted`, and one primary action.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-8 text-center",
        className,
      )}
    >
      <Icon className="size-5 text-text-subtle" aria-hidden="true" />
      <p className="text-md font-medium text-text">{title}</p>
      {description ? (
        <p className="max-w-[60ch] text-md text-text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
