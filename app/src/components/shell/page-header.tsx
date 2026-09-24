import type { ReactNode } from "react";

import { cn } from "@/components/cn";

/**
 * Page title row. `text-3xl` / weight 700 is the h1 slot in design.md §6, and
 * 24px (`mb-6`) is the gap between page sections in §9.
 */
export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "motion-page-enter mb-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-text lg:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-[62ch] text-base leading-relaxed text-text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
