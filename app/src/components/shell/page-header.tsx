import type { ReactNode } from "react";

import { cn } from "@/components/cn";

/**
 * Page title row (Design-System.md §5). The h1 is 24px → 30px from lg, SemiBold
 * (600), tracked -0.03em: hierarchy comes from weight and colour, not raw scale
 * (Linear headline ≈ 28/600). 32px (`mb-8`) separates it from the page body.
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
        "mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="t-reveal min-w-0">
        <h1 className="text-3xl font-semibold tracking-[-0.03em] text-text lg:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-[65ch] text-base leading-relaxed text-text-muted">{description}</p>
        ) : null}
      </div>
      {action ? <div className="motion-page-enter shrink-0">{action}</div> : null}
    </div>
  );
}
