"use client";

import { ChevronDown, History, X } from "lucide-react";
import { useCallback, useState, useTransition } from "react";

import { getTicket } from "@/actions/tickets";
import { cn } from "@/components/cn";
import { TicketId } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Select } from "@/components/ui/select";
import { MarkdownEditor } from "@/components/work-log/markdown-editor";
import {
  TICKET_STATUS_LABELS,
  TICKET_STATUS_ORDER,
  TicketStatusBadge,
} from "@/components/ui/ticket-status-badge";
import { useAutosave, type SaveResult } from "@/components/work-log/save-status";
import { TicketHistory } from "@/components/work-log/ticket-history";
import { toHistory, type EditorTicket, type HistoryEntry } from "@/components/work-log/types";
import type { WorkflowStatus } from "@/lib/workflow-status";

/**
 * One attached ticket — spec §24.
 *
 * ID + status badge + title · "Work Done Today" · status select ·
 * "View Previous Updates" · remove.
 *
 * Status is communicated by the labelled badge and native select rather than
 * a decorative card edge, so it remains clear without relying on colour alone.
 *
 * Remove calls `detachTicketFromWorkLog` — it deletes THIS log's update row
 * only. The ticket and every other day's history survive.
 */

type Draft = { description: string; status: WorkflowStatus };

const draftEquals = (a: Draft, b: Draft) =>
  a.description === b.description && a.status === b.status;

export function TicketWorkCard({
  workLogId,
  ticket,
  onSaveWork,
  onDetach,
  onHistoryLoaded,
}: {
  workLogId: string;
  ticket: EditorTicket;
  onSaveWork: (input: { ticketId: string; draft: Draft }) => Promise<SaveResult>;
  onDetach: (ticketId: string) => Promise<boolean>;
  onHistoryLoaded: (ticketId: string, history: HistoryEntry[]) => void;
}) {
  const [draft, setDraft] = useState<Draft>(ticket.draft);
  const [open, setOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [detaching, startDetach] = useTransition();
  const { flush } = useAutosave<Draft>({
    id: `ticket:${ticket.id}`,
    value: draft,
    initial: ticket.draft,
    equals: draftEquals,
    save: (value) => onSaveWork({ ticketId: ticket.id, draft: value }),
  });

  // Previous updates = everything except this work log's own row.
  const previous = ticket.history
    ? ticket.history.filter((entry) => entry.workLog?.id !== workLogId)
    : null;

  const loadHistory = useCallback(async () => {
    if (ticket.history) return;
    setLoadingHistory(true);
    const result = await getTicket(ticket.id);
    setLoadingHistory(false);
    if (result.ok) onHistoryLoaded(ticket.id, toHistory(result.data.updates));
  }, [ticket.history, ticket.id, onHistoryLoaded]);

  const historyCount = previous?.length;

  return (
    <article
      id={`ticket-card-${ticket.ticketKey}`}
      aria-labelledby={`ticket-heading-${ticket.id}`}
      className="scroll-mt-20 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong/50"
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <TicketId>{ticket.ticketKey}</TicketId>
            <TicketStatusBadge status={draft.status} />
          </div>
          <h3
            id={`ticket-heading-${ticket.id}`}
            className="mt-1 max-w-[72ch] text-base font-semibold text-text"
          >
            {ticket.title}
          </h3>
        </div>

        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label={`Remove ${ticket.ticketKey} from this work log`}
          title={`Remove ${ticket.ticketKey} from this work log`}
          loading={detaching}
          onClick={() => {
            if (draft.description.trim()) setConfirming(true);
            else void detach();
          }}
        >
          <X aria-hidden="true" />
        </Button>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <label
            htmlFor={`work-${ticket.id}`}
            className="mb-2 block text-sm font-medium text-text"
          >
            What I did today
          </label>
          <MarkdownEditor
            id={`work-${ticket.id}`}
            value={draft.description}
            placeholder="What did you work on for this ticket today?"
            ariaLabel={`Work completed for ${ticket.ticketKey}`}
            minHeight="min-h-28"
            onChange={(description) =>
              setDraft((current) => ({ ...current, description }))
            }
            onBlur={() => flush()}
          />
        </div>

        <div className="lg:w-48">
          <label
            htmlFor={`status-${ticket.id}`}
            className="mb-2 block text-sm font-medium text-text"
          >
            Status
          </label>
          <Select
            id={`status-${ticket.id}`}
            value={draft.status}
            onChange={(event) => {
              const next: Draft = {
                ...draft,
                status: event.target.value as WorkflowStatus,
              };
              setDraft(next);
              // A status change is a decision, not a keystroke — save it now.
              flush(next);
            }}
          >
            {TICKET_STATUS_ORDER.map((status) => (
              <option key={status} value={status}>
                {TICKET_STATUS_LABELS[status]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-3 pt-1">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`history-${ticket.id}`}
          onClick={() => {
            if (!open) void loadHistory();
            setOpen((value) => !value);
          }}
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 rounded-sm text-sm font-semibold",
            "text-accent-text transition-colors duration-150 ease-standard hover:text-primary",
          )}
        >
          <History className="size-3.5" aria-hidden="true" />
          View Previous Updates
          {typeof historyCount === "number" ? ` (${historyCount})` : ""}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-3.5 transition-transform duration-200 ease-standard",
              open && "rotate-180",
            )}
          />
        </button>

        <div id={`history-${ticket.id}`} hidden={!open}>
          {open ? (
            <TicketHistory entries={previous} loading={loadingHistory} className="mt-3" />
          ) : null}
        </div>
      </div>

      <ConfirmationDialog
        open={confirming}
        title={`Remove ${ticket.ticketKey} from this work log?`}
        description="Today's work note for this ticket is deleted. The ticket itself and all of its previous updates are kept."
        confirmLabel="Remove from log"
        destructive
        onCancel={() => setConfirming(false)}
        onConfirm={async () => {
          setConfirming(false);
          await detach();
        }}
      />
    </article>
  );

  function detach() {
    return new Promise<void>((resolve) => {
      startDetach(async () => {
        await onDetach(ticket.id);
        resolve();
      });
    });
  }
}
