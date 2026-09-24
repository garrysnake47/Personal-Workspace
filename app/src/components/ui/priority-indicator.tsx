import * as React from "react";

import { cn } from "@/components/cn";
import type { TaskPriority } from "@/lib/prisma";

/**
 * Task priority — design.md §5.
 *
 * **A dot plus a text label. Never a filled pill.** Priority deliberately uses a
 * different visual language from ticket status so the two never compete inside
 * the same table row.
 *
 * The ramp rises in temperature (grey → cyan → orange → rose) so it reads as an
 * ordinal scale at a glance. Urgent is rose, not the Blocked red, so an urgent
 * task and a blocked ticket never look identical side by side.
 */

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  Low: "Low",
  Medium: "Medium",
  High: "High",
  Urgent: "Urgent",
};

export const TASK_PRIORITY_ORDER: TaskPriority[] = [
  "Urgent",
  "High",
  "Medium",
  "Low",
];

const DOT: Record<TaskPriority, string> = {
  Low: "bg-priority-low",
  Medium: "bg-priority-medium",
  High: "bg-priority-high",
  Urgent: "bg-priority-urgent",
};

const LABEL: Record<TaskPriority, string> = {
  Low: "text-priority-low",
  Medium: "text-priority-medium",
  High: "text-priority-high",
  Urgent: "text-priority-urgent",
};

/** Only Urgent may tint a whole row (design.md §5). */
export const TASK_PRIORITY_ROW_TINT: Record<TaskPriority, string> = {
  Low: "",
  Medium: "",
  High: "",
  Urgent: "bg-priority-urgent-bg",
};

export function PriorityIndicator({
  priority,
  className,
  labelled = true,
}: {
  priority: TaskPriority;
  className?: string;
  /**
   * Hide the visible label only inside a row that repeats it in an adjacent
   * column; the accessible name is kept either way.
   */
  labelled?: boolean;
}) {
  const label = TASK_PRIORITY_LABELS[priority];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm font-medium whitespace-nowrap",
        LABEL[priority],
        className,
      )}
      title={labelled ? undefined : label}
    >
      <span
        aria-hidden="true"
        className={cn("inline-block size-1.5 shrink-0 rounded-full", DOT[priority])}
      />
      {labelled ? label : <span className="sr-only">{label}</span>}
    </span>
  );
}
