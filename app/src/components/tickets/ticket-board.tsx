"use client";

import { format } from "date-fns";
import { ArrowRight, CalendarDays, FileText, History, Loader2, Search, ShieldCheck, Ticket as TicketIcon, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { appendTicketHistoryEntry, deleteTicketHistoryEntry, getTicket, updateTicket } from "@/actions/tickets";
import { cn } from "@/components/cn";
import { MarkdownContent, MarkdownEditor } from "@/components/work-log/markdown-editor";
import { TicketId } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TICKET_STATUS_LABELS, TICKET_STATUS_ORDER, TicketStatusBadge } from "@/components/ui/ticket-status-badge";
import { toast } from "@/components/ui/toast";
import type { WorkflowStatus } from "@/lib/workflow-status";

export type TicketBoardItem = {
  id: string;
  ticketId: string;
  title: string;
  status: WorkflowStatus;
  updatedAt: string;
  workLogCount: number;
  latestUpdate: {
    description: string;
    createdAt: string;
    workLog: { id: string; title: string; date: string } | null;
  } | null;
};

type TicketDetail = {
  historyEntries: Array<{ id: string; body: string; status: WorkflowStatus; createdAt: string }>;
  updates: Array<{
    id: string;
    description: string;
    status: WorkflowStatus;
    createdAt: string;
    workLog: { id: string; title: string; date: string } | null;
  }>;
};

type StatusFilter = "All" | WorkflowStatus;

export function TicketBoard({ initialTickets, loadError }: { initialTickets: TicketBoardItem[]; loadError?: string }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");

  const visibleTickets = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return tickets.filter((ticket) => {
      const matchesStatus = status === "All" || ticket.status === status;
      const matchesQuery = !needle || ticket.ticketId.toLocaleLowerCase().includes(needle) || ticket.title.toLocaleLowerCase().includes(needle);
      return matchesStatus && matchesQuery;
    });
  }, [query, status, tickets]);

  const selectedTicket = visibleTickets.find((ticket) => ticket.id === selectedId) ?? null;

  function replaceTicket(ticketId: string, patch: Partial<Pick<TicketBoardItem, "title" | "status" | "updatedAt">>) {
    setTickets((current) => current.map((ticket) => ticket.id === ticketId ? { ...ticket, ...patch } : ticket));
  }

  return (
    <div className="mx-auto flex w-full max-w-[76rem] min-w-0 flex-col gap-6">
      <header className="motion-page-enter flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-text lg:text-5xl">Tickets</h1>
          <p className="mt-2 max-w-[62ch] text-base leading-relaxed text-text-muted">
            Keep each ticket current while preserving every update as a readable timeline.
          </p>
        </div>
        <span className="inline-flex min-h-10 shrink-0 items-center gap-2 self-start rounded-full border border-border bg-surface px-4 text-sm font-semibold text-text-muted">
          <TicketIcon className="size-4 text-accent-text" aria-hidden="true" />
          {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
        </span>
      </header>

      {loadError ? (
        <div role="alert" className="rounded-xl border border-danger bg-danger-subtle p-4 text-sm font-medium text-danger">
          Tickets could not be loaded. {loadError}
        </div>
      ) : null}

      <section aria-label="Ticket filters" className="grid gap-3 border-y border-border py-4 md:grid-cols-[minmax(0,1fr)_15rem]">
        <Field label="Search tickets" htmlFor="ticket-search">
          <Input id="ticket-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ticket ID or title" startIcon={<Search />} />
        </Field>
        <Field label="Filter by status" htmlFor="ticket-status-filter">
          <Select id="ticket-status-filter" value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)} className="h-10">
            <option value="All">All statuses</option>
            {TICKET_STATUS_ORDER.map((option) => <option key={option} value={option}>{TICKET_STATUS_LABELS[option]}</option>)}
          </Select>
        </Field>
      </section>

      {tickets.length === 0 && !loadError ? (
        <EmptyState
          icon={TicketIcon}
          title="No tickets yet"
          description="Create your first ticket from a work log, then manage its updates here."
          action={<Link href="/work-logs" className={buttonVariants({ variant: "primary" })}>Open work logs</Link>}
        />
      ) : visibleTickets.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching tickets"
          description="Try another ticket ID, title, or status."
          action={<Button variant="secondary" onClick={() => { setQuery(""); setStatus("All"); }}>Clear filters</Button>}
        />
      ) : (
        <>
          <div className="lg:hidden">
            <Field label="Selected ticket" htmlFor="mobile-ticket-picker">
              <Select id="mobile-ticket-picker" value={selectedTicket?.id ?? ""} onChange={(event) => setSelectedId(event.target.value)} className="h-11">
                <option value="" disabled>Choose a ticket</option>
                {visibleTickets.map((ticket) => <option key={ticket.id} value={ticket.id}>{ticket.ticketId} — {ticket.title}</option>)}
              </Select>
            </Field>
          </div>

          <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-6">
            <aside aria-label="Ticket list" className="sticky top-24 hidden overflow-hidden rounded-2xl border border-border bg-card lg:block">
              <div className="flex items-center justify-between px-4 pb-1 pt-4">
                <p className="text-sm font-semibold text-text">All tickets</p>
                <span className="text-xs text-text-subtle">{visibleTickets.length} shown</span>
              </div>
              <div className="max-h-[calc(100vh-15rem)] overflow-y-auto p-2">
                {visibleTickets.map((ticket) => (
                  <TicketListItem key={ticket.id} ticket={ticket} selected={ticket.id === selectedTicket?.id} onSelect={() => setSelectedId(ticket.id)} />
                ))}
              </div>
            </aside>

            {selectedTicket ? (
              <TicketDetailPanel key={selectedTicket.id} ticket={selectedTicket} onChange={replaceTicket} />
            ) : (
              <div className="hidden min-h-72 items-center justify-center rounded-2xl border border-border bg-card lg:flex">
                <EmptyState
                  icon={TicketIcon}
                  title="Select a ticket"
                  description="Choose a ticket from the list to view its details and history."
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function TicketListItem({ ticket, selected, onSelect }: { ticket: TicketBoardItem; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "group mb-1 flex w-full cursor-pointer flex-col gap-2 rounded-xl border px-3 py-3 text-left transition-colors duration-150 last:mb-0",
        selected ? "border-primary bg-primary-subtle" : "border-transparent hover:border-border hover:bg-surface",
      )}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <TicketId>{ticket.ticketId}</TicketId>
        <ArrowRight className={cn("size-4 shrink-0 text-text-subtle transition-transform duration-150", selected && "translate-x-0.5 text-accent-text")} aria-hidden="true" />
      </div>
      <span className="line-clamp-2 text-sm font-medium leading-5 text-text">{ticket.title}</span>
      <div className="flex flex-wrap items-center gap-2">
        <TicketStatusBadge status={ticket.status} />
        <span className="text-xs text-text-subtle">{ticket.workLogCount} {ticket.workLogCount === 1 ? "log" : "logs"}</span>
      </div>
    </button>
  );
}

function TicketDetailPanel({ ticket, onChange }: {
  ticket: TicketBoardItem;
  onChange: (ticketId: string, patch: Partial<Pick<TicketBoardItem, "title" | "status" | "updatedAt">>) => void;
}) {
  const [detail, setDetail] = useState<TicketDetail | null>(null);
  const [loadError, setLoadError] = useState("");
  const [title, setTitle] = useState(ticket.title);
  const [status, setStatus] = useState(ticket.status);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState<"title" | "status" | "body" | null>(null);
  const [message, setMessage] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const titleChanged = title.trim() !== ticket.title;

  useEffect(() => {
    let cancelled = false;
    void getTicket(ticket.id).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setLoadError(result.error.message);
        return;
      }
      setDetail({
        historyEntries: result.data.historyEntries.map((entry) => ({ id: entry.id, body: entry.body, status: entry.status, createdAt: entry.createdAt.toISOString() })),
        updates: result.data.updates.map((update) => ({
          id: update.id,
          description: update.description,
          status: update.status,
          createdAt: update.createdAt.toISOString(),
          workLog: update.workLog ? { id: update.workLog.id, title: update.workLog.title, date: update.workLog.date.toISOString() } : null,
        })),
      });
    });
    return () => { cancelled = true; };
  }, [ticket.id]);

  const timeline = useMemo(() => {
    if (!detail) return [];
    return [
      ...detail.historyEntries.map((entry) => ({ id: entry.id, kind: "ticket" as const, body: entry.body, status: entry.status, createdAt: entry.createdAt, workLog: null })),
      ...detail.updates.map((entry) => ({ id: entry.id, kind: "worklog" as const, body: entry.description, status: entry.status, createdAt: entry.createdAt, workLog: entry.workLog })),
    ].sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
  }, [detail]);

  async function saveTitle() {
    if (!titleChanged || saving) return;
    const nextTitle = title.trim();
    if (!nextTitle) { setMessage("Enter a ticket title before saving."); return; }
    setSaving("title");
    setMessage("Saving title…");
    const result = await updateTicket({ ticketId: ticket.id, title: nextTitle });
    setSaving(null);
    if (!result.ok) {
      setMessage(result.error.message);
      toast.error("Ticket title was not saved", { description: result.error.message });
      return;
    }
    setTitle(result.data.title);
    onChange(ticket.id, { title: result.data.title, updatedAt: result.data.updatedAt.toISOString() });
    setMessage("Title saved.");
  }

  async function saveStatus(nextStatus: WorkflowStatus) {
    if (nextStatus === status || saving) return;
    const previousStatus = status;
    setStatus(nextStatus);
    setSaving("status");
    setMessage("Saving status…");
    const result = await updateTicket({ ticketId: ticket.id, status: nextStatus });
    setSaving(null);
    if (!result.ok) {
      setStatus(previousStatus);
      setMessage(result.error.message);
      toast.error("Ticket status was not saved", { description: result.error.message });
      return;
    }
    setStatus(result.data.status);
    onChange(ticket.id, { status: result.data.status, updatedAt: result.data.updatedAt.toISOString() });
    setMessage("Status saved.");
  }

  async function addHistoryEntry() {
    const nextBody = body.trim();
    if (!nextBody || saving) {
      if (!nextBody) setMessage("Write an update before adding it to history.");
      return;
    }
    setSaving("body");
    setMessage("Adding update…");
    const result = await appendTicketHistoryEntry({ ticketId: ticket.id, body: nextBody, status });
    setSaving(null);
    if (!result.ok) {
      setMessage(result.error.message);
      toast.error("Ticket update was not added", { description: result.error.message });
      return;
    }
    const entry = result.data.entry;
    setDetail((current) => current ? {
      ...current,
      historyEntries: [{ id: entry.id, body: entry.body, status: entry.status, createdAt: entry.createdAt.toISOString() }, ...current.historyEntries],
    } : current);
    setBody("");
    setStatus(result.data.ticket.status);
    onChange(ticket.id, { status: result.data.ticket.status, updatedAt: result.data.ticket.updatedAt.toISOString() });
    setMessage("Update added to ticket history. Work logs are unchanged.");
    toast.success("Update added to history");
  }

  async function deleteHistoryEntry() {
    if (!deleteTargetId) return;
    const result = await deleteTicketHistoryEntry({ ticketId: ticket.id, entryId: deleteTargetId });
    if (!result.ok) {
      setMessage(result.error.message);
      toast.error("Ticket update was not deleted", { description: result.error.message });
      return;
    }
    setDetail((current) => current ? {
      ...current,
      historyEntries: current.historyEntries.filter((entry) => entry.id !== deleteTargetId),
    } : current);
    setDeleteTargetId(null);
    setMessage("Ticket update deleted. Work-log history is unchanged.");
    toast.success("Ticket update deleted");
  }

  return (
    <article aria-labelledby={`ticket-heading-${ticket.id}`} className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
      <header className="px-5 pt-5 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2"><TicketId>{ticket.ticketId}</TicketId><TicketStatusBadge status={status} /></div>
            <h2 id={`ticket-heading-${ticket.id}`} className="mt-2 text-2xl font-semibold tracking-tight text-text">{ticket.title}</h2>
          </div>
          <div className="shrink-0 text-sm text-text-subtle md:text-right">
            <p>{ticket.workLogCount} {ticket.workLogCount === 1 ? "work log" : "work logs"}</p>
            <time dateTime={ticket.updatedAt}>Updated {formatTicketDate(ticket.updatedAt)}</time>
          </div>
        </div>
      </header>

      <div className="flex min-w-0 flex-col gap-7 p-5 md:p-6">
        <section aria-labelledby={`details-heading-${ticket.id}`}>
          <div className="mb-4 flex items-center gap-2">
            <FileText className="size-4 text-accent-text" aria-hidden="true" />
            <h3 id={`details-heading-${ticket.id}`} className="text-md font-semibold text-text">Ticket details</h3>
          </div>
          <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_14rem] md:items-end">
            <Field label="Ticket title" htmlFor={`ticket-title-${ticket.id}`}>
              <div className="flex min-w-0 flex-col gap-2 md:flex-row">
                <Input
                  id={`ticket-title-${ticket.id}`}
                  value={title}
                  maxLength={300}
                  disabled={saving !== null}
                  onChange={(event) => { setTitle(event.target.value); setMessage(""); }}
                  onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void saveTitle(); } }}
                  className="h-10 min-w-0"
                />
                <Button variant="secondary" className="h-10 shrink-0" disabled={!titleChanged || saving !== null} loading={saving === "title"} onClick={() => void saveTitle()}>
                  Save title
                </Button>
              </div>
            </Field>
            <Field label="Current status" htmlFor={`ticket-status-${ticket.id}`}>
              <Select id={`ticket-status-${ticket.id}`} value={status} disabled={saving !== null} onChange={(event) => void saveStatus(event.target.value as WorkflowStatus)} className="h-10">
                {TICKET_STATUS_ORDER.map((option) => <option key={option} value={option}>{TICKET_STATUS_LABELS[option]}</option>)}
              </Select>
            </Field>
          </div>
          {message ? <p role="status" aria-live="polite" className="mt-3 text-xs text-text-subtle">{message}</p> : null}
        </section>

        <section aria-labelledby={`add-update-heading-${ticket.id}`} className="border-t border-border pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 id={`add-update-heading-${ticket.id}`} className="text-lg font-semibold text-text">Add a ticket update</h3>
              <p className="mt-1 max-w-[62ch] text-sm leading-6 text-text-muted">
                Each submission becomes a new history entry. Direct ticket updates can be deleted; work-log notes stay protected.
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-success-subtle px-3 py-1.5 text-xs font-semibold text-success">
              <ShieldCheck className="size-4" aria-hidden="true" />Protected work-log history
            </span>
          </div>
          <div className="mt-4">
            <Field label="Update details" htmlFor={`ticket-body-${ticket.id}`} required>
              <MarkdownEditor
                id={`ticket-body-${ticket.id}`}
                value={body}
                onChange={(value) => { setBody(value); setMessage(""); }}
                placeholder="Describe what changed, decisions made, or what should happen next…"
                ariaLabel="Ticket update details"
                minHeight="min-h-32"
              />
            </Field>
          </div>
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-text-subtle">Saved with status: {TICKET_STATUS_LABELS[status]}</p>
            <Button className="md:min-w-40" disabled={!body.trim() || saving !== null} loading={saving === "body"} onClick={() => void addHistoryEntry()}>
              Add to history
            </Button>
          </div>
        </section>

        <section aria-labelledby={`history-heading-${ticket.id}`} className="border-t border-border pt-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2"><History className="size-4 text-accent-text" aria-hidden="true" /><h3 id={`history-heading-${ticket.id}`} className="text-lg font-semibold text-text">Ticket history</h3></div>
            {detail ? <span className="text-xs text-text-subtle">{timeline.length} {timeline.length === 1 ? "entry" : "entries"}</span> : null}
          </div>

          {loadError ? (
            <div role="alert" className="mt-4 rounded-xl border border-danger bg-danger-subtle p-4 text-sm font-medium text-danger">History could not be loaded. {loadError}</div>
          ) : !detail ? (
            <div className="mt-4 flex min-h-32 items-center justify-center rounded-xl bg-surface text-sm text-text-muted"><Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />Loading history…</div>
          ) : timeline.length === 0 ? (
            <div className="mt-4 rounded-xl bg-surface p-5 text-sm text-text-muted">No history yet. Add the first update above.</div>
          ) : (
            <ol className="mt-5 space-y-5">
              {timeline.map((entry, index) => (
                <li key={`${entry.kind}-${entry.id}`} className="relative grid grid-cols-[1rem_minmax(0,1fr)] gap-3">
                  <div className="relative flex justify-center">
                    {index < timeline.length - 1 ? <span className="absolute top-4 bottom-[-1.25rem] w-px bg-border" aria-hidden="true" /> : null}
                    <span className={cn("relative mt-1.5 size-2.5 rounded-full ring-4 ring-surface", entry.kind === "ticket" ? "bg-primary" : "bg-text-subtle")} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 rounded-xl border border-border bg-surface p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">{entry.kind === "ticket" ? "Ticket update" : "Work log"}</span>
                        <TicketStatusBadge status={entry.status} />
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <time dateTime={entry.createdAt} className="text-xs text-text-subtle">{formatTimelineDate(entry.createdAt)}</time>
                        {entry.kind === "ticket" ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:bg-danger-subtle hover:text-danger"
                            aria-label={`Delete ticket update from ${formatTimelineDate(entry.createdAt)}`}
                            onClick={() => setDeleteTargetId(entry.id)}
                          >
                            <Trash2 aria-hidden="true" />
                            Delete
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    {entry.body.trim() ? <MarkdownContent value={entry.body} className="mt-3 text-sm leading-6 text-text" /> : <p className="mt-3 text-sm italic text-text-subtle">No written update.</p>}
                    {entry.workLog ? (
                      <Link href={`/work-logs/${entry.workLog.id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent-text hover:underline">
                        <CalendarDays className="size-4" aria-hidden="true" />
                        {entry.workLog.title} · {formatTicketDate(entry.workLog.date)}
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      <ConfirmationDialog
        open={deleteTargetId !== null}
        title="Delete this ticket update?"
        description="This direct ticket update will be permanently removed. The current ticket status and work-log entries will not change."
        confirmLabel="Delete update"
        destructive
        onConfirm={deleteHistoryEntry}
        onCancel={() => setDeleteTargetId(null)}
      />
    </article>
  );
}

function formatTicketDate(value: string) {
  return format(new Date(value), "d MMM yyyy");
}

function formatTimelineDate(value: string) {
  return format(new Date(value), "d MMM yyyy, h:mm a");
}
