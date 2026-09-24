import * as React from "react";

import { cn } from "@/components/cn";
import {
  WORKFLOW_STATUS_ORDER,
  type WorkflowStatus,
} from "@/lib/workflow-status";

/**
 * Ticket status badge — design.md §4.
 *
 * Status is always rendered as a labelled badge plus a semantic colour. The
 * five workflow stages are intentionally compact: In Progress → Sent to QA →
 * Ready for production → Released → Done.
 *
 * The label is always rendered — never signal state by colour alone (§12).
 *
 * Class strings are written out per status rather than built from a template,
 * because Tailwind only ships classes it can see as literal text.
 */

export const TICKET_STATUS_LABELS: Record<WorkflowStatus, string> = {
  InProgress: "In Progress",
  SentToQA: "Sent to QA",
  ReadyForProduction: "Ready for production",
  Released: "Released",
  Done: "Done",
};

/** Display order for dropdowns and filters — roughly the lifecycle order. */
export const TICKET_STATUS_ORDER: WorkflowStatus[] = [...WORKFLOW_STATUS_ORDER];

/**
 * Solid, high-contrast fills (white label, all >= 4.5:1). Teal and navy come
 * from the app palette; QA / release-ready / done keep distinct hues so the
 * five stages never read as the same colour.
 */
const BADGE_CLASS: Record<WorkflowStatus, string> = {
  InProgress: "bg-primary text-primary-fg",
  SentToQA: "bg-status-testing text-primary-fg",
  ReadyForProduction: "bg-status-waiting text-primary-fg",
  Released: "bg-sidebar text-sidebar-fg",
  Done: "bg-status-completed text-primary-fg",
};

/** The bare accent token — dots, a card's 3px left rule, timeline markers. */
export const TICKET_STATUS_DOT: Record<WorkflowStatus, string> = {
  InProgress: "bg-primary",
  SentToQA: "bg-status-testing",
  ReadyForProduction: "bg-status-waiting",
  Released: "bg-sidebar",
  Done: "bg-status-completed",
};

/** Same accents as a border colour, for the 3px left rule on a ticket card. */
export const TICKET_STATUS_RULE: Record<WorkflowStatus, string> = {
  InProgress: "border-l-primary",
  SentToQA: "border-l-status-testing",
  ReadyForProduction: "border-l-status-waiting",
  Released: "border-l-sidebar",
  Done: "border-l-status-completed",
};

export function TicketStatusBadge({
  status,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { status: WorkflowStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold whitespace-nowrap before:size-1.5 before:rounded-full before:bg-current before:opacity-80 before:content-['']",
        BADGE_CLASS[status],
        className,
      )}
      {...props}
    >
      {TICKET_STATUS_LABELS[status]}
    </span>
  );
}

/**
 * Status dot on its own. Only legal where the label is repeated in an adjacent
 * column — hence the required `aria-label` fallback baked in here.
 */
export function TicketStatusDot({
  status,
  className,
}: {
  status: WorkflowStatus;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={TICKET_STATUS_LABELS[status]}
      title={TICKET_STATUS_LABELS[status]}
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        TICKET_STATUS_DOT[status],
        className,
      )}
    />
  );
}
