import { format } from "date-fns";
import { Building2, CalendarDays, CheckCircle2, MessageSquareText, Ticket } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/components/cn";
import { TicketId } from "@/components/ui/badge";
import { TICKET_STATUS_DOT, TicketStatusBadge } from "@/components/ui/ticket-status-badge";
import { MarkdownContent } from "@/components/work-log/markdown-editor";
import type { EditorWorkLog } from "@/components/work-log/types";

/**
 * Read-only log body. Deliberately NOT cards: a meta line, a ruled list of
 * meetings (name column + notes column) and table-style ticket rows.
 */
export function WorkLogTimeline({ workLog }: { workLog: EditorWorkLog }) {
  const meetings = workLog.meetings.filter((meeting) => meeting.notes.trim()).sort((a, b) => a.order - b.order);
  const tickets = workLog.tickets.filter((ticket) => ticket.draft.description.trim()).sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
  const total = meetings.length + tickets.length;

  return (
    <section className="motion-page-enter min-w-0" aria-label="Work log timeline">
      <p className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-border py-3 text-sm text-text-muted">
        <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-primary" aria-hidden="true" />{format(workLog.date, "EEEE, d MMM yyyy")}</span>
        {workLog.projectName ? <span className="inline-flex min-w-0 items-center gap-2"><Building2 className="size-4 shrink-0 text-primary" aria-hidden="true" /><span className="truncate">{workLog.projectName}</span></span> : null}
        <span className="inline-flex items-center gap-2 font-medium text-accent-text">{total} {total === 1 ? "update" : "updates"}</span>
      </p>

      {total === 0 ? (
        <div className="flex flex-col items-start gap-2 py-10"><CheckCircle2 className="size-6 text-primary" aria-hidden="true" /><p className="text-md font-semibold text-text">This log is empty so far.</p><p className="text-sm text-text-subtle">Add meeting notes or ticket work from the edit view.</p></div>
      ) : (
        <div className="mt-8 flex flex-col gap-10">
          <Block id="meetings-heading" icon={<MessageSquareText className="size-4" aria-hidden="true" />} title="Meetings" count={meetings.length} empty="No meeting notes were captured.">
            <ol className="divide-y divide-border border-b border-border">
              {meetings.map((meeting, index) => (
                <li key={meeting.id} className="grid gap-2 py-4 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-6">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-xs font-semibold text-primary tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                    <h3 className="text-base font-semibold text-text">{meeting.name}</h3>
                  </div>
                  <MarkdownContent value={meeting.notes} className="text-text-muted" />
                </li>
              ))}
            </ol>
          </Block>

          <Block id="tickets-heading" icon={<Ticket className="size-4" aria-hidden="true" />} title="Ticket work" count={tickets.length} empty="No ticket work was captured.">
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="hidden grid-cols-[8rem_minmax(0,1fr)_11rem] gap-4 bg-sidebar px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-sidebar-fg md:grid">
                <span>Ticket</span><span>Work done</span><span>Status in this log</span>
              </div>
              <ol className="divide-y divide-border">
                {tickets.map((ticket) => (
                  <li key={ticket.id} id={`ticket-card-${ticket.ticketKey}`} className="grid gap-2 px-4 py-4 md:grid-cols-[8rem_minmax(0,1fr)_11rem] md:gap-4">
                    <div className="flex items-center gap-2 md:items-start">
                      <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full md:mt-2", TICKET_STATUS_DOT[ticket.draft.status])} />
                      <TicketId>{ticket.ticketKey}</TicketId>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-text">{ticket.title}</h3>
                      <MarkdownContent value={ticket.draft.description} className="mt-1 text-text-muted" />
                    </div>
                    <div><TicketStatusBadge status={ticket.draft.status} /></div>
                  </li>
                ))}
              </ol>
            </div>
          </Block>
        </div>
      )}
    </section>
  );
}

function Block({ id, icon, title, count, empty, children }: { id: string; icon: ReactNode; title: string; count: number; empty: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-3 flex items-center gap-2 text-lg font-bold text-text">
        <span className="text-primary">{icon}</span>
        {title}
        <span className="text-sm font-medium text-text-subtle tabular-nums">({count})</span>
      </h2>
      {count ? children : <p className="border-y border-border py-4 text-sm text-text-muted">{empty}</p>}
    </section>
  );
}
