"use client";

import { ArrowLeft, Building2, CalendarDays, Eye, PencilLine, Save } from "lucide-react";
import { format } from "date-fns";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { detachTicketFromWorkLog, saveTicketWorkUpdate, upsertTicketForWorkLog } from "@/actions/tickets";
import { updateWorkLog } from "@/actions/worklog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MeetingSection } from "@/components/work-log/meeting-section";
import { SaveStatusIndicator, SaveStatusProvider, type SaveResult } from "@/components/work-log/save-status";
import { SectionHeading } from "@/components/work-log/section-heading";
import { TicketSearch } from "@/components/work-log/ticket-search";
import { TicketWorkCard } from "@/components/work-log/ticket-work-card";
import { toHistory, type EditorTicket, type EditorWorkLog, type HistoryEntry } from "@/components/work-log/types";
import { toast } from "@/components/ui/toast";
import type { WorkflowStatus } from "@/lib/workflow-status";

type TicketPayload = {
  id: string;
  ticketId: string;
  title: string;
  status: WorkflowStatus;
  updatedAt: Date | string;
  currentUpdate?: { description: string; status: WorkflowStatus } | null;
  updates?: Array<{ id: string; description: string; status: WorkflowStatus; createdAt: Date | string; updatedAt: Date | string; workLog?: { id: string; title: string; date: Date | string } | null }>;
};

function toEditorTicket(input: TicketPayload): EditorTicket {
  return { id: input.id, ticketKey: input.ticketId, title: input.title, status: input.status, updatedAt: new Date(input.updatedAt), draft: input.currentUpdate ?? { description: "", status: input.status }, history: input.updates ? toHistory(input.updates) : null };
}

export function WorkLogEditor({ workLog }: { workLog: EditorWorkLog }) {
  const router = useRouter();
  const [title, setTitle] = useState(workLog.title);
  const [savedTitle, setSavedTitle] = useState(workLog.title);
  const [projectName, setProjectName] = useState(workLog.projectName ?? "");
  const [savedProjectName, setSavedProjectName] = useState(workLog.projectName ?? "");
  const [tickets, setTickets] = useState(workLog.tickets);
  const [renaming, startRename] = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);

  function saveTitle() {
    const next = title.trim();
    if (!next || next === savedTitle) return;
    startRename(async () => {
      const result = await updateWorkLog({ workLogId: workLog.id, title: next });
      if (!result.ok) { setTitle(savedTitle); toast.error(result.error.message); return; }
      setTitle(result.data.title);
      setSavedTitle(result.data.title);
      toast.success("Work log renamed");
    });
  }

  function saveProjectName() {
    const next = projectName.trim();
    if (next === savedProjectName) return;
    startRename(async () => {
      const result = await updateWorkLog({ workLogId: workLog.id, projectName: next });
      if (!result.ok) { setProjectName(savedProjectName); toast.error(result.error.message); return; }
      const saved = result.data.projectName ?? "";
      setProjectName(saved);
      setSavedProjectName(saved);
      toast.success(saved ? "Project saved" : "Project cleared");
    });
  }

  async function attach(input: { ticketKey: string; title?: string; status?: WorkflowStatus; description?: string }) {
    const result = await upsertTicketForWorkLog({ workLogId: workLog.id, ticketKey: input.ticketKey, title: input.title, status: input.status });
    if (!result.ok) { toast.error(result.error.message); return false; }
    const nextTicket = toEditorTicket({ ...result.data.ticket, currentUpdate: result.data.currentUpdate, updates: result.data.ticket.updates });
    setTickets((current) => current.some((ticket) => ticket.id === nextTicket.id) ? current.map((ticket) => ticket.id === nextTicket.id ? nextTicket : ticket) : [...current, nextTicket]);

    if (input.description?.trim()) {
      const saved = await saveTicketWorkUpdate({ workLogId: workLog.id, ticketId: nextTicket.id, description: input.description.trim(), status: nextTicket.draft.status });
      if (saved.ok) setTickets((current) => current.map((ticket) => ticket.id === nextTicket.id ? { ...ticket, draft: { description: input.description!.trim(), status: saved.data.ticket.status }, status: saved.data.ticket.status, updatedAt: new Date() } : ticket));
      else toast.error(saved.error.message);
    }
    toast.success(`${nextTicket.ticketKey} added to this log`);
    return true;
  }

  async function saveWork(input: { ticketId: string; draft: { description: string; status: WorkflowStatus } }): Promise<SaveResult> {
    const result = await saveTicketWorkUpdate({ workLogId: workLog.id, ticketId: input.ticketId, description: input.draft.description, status: input.draft.status });
    if (!result.ok) return { ok: false, message: result.error.message };
    setTickets((current) => current.map((ticket) => ticket.id === input.ticketId ? { ...ticket, status: result.data.ticket.status, draft: input.draft, updatedAt: new Date() } : ticket));
    return { ok: true };
  }

  async function detach(ticketId: string) {
    const result = await detachTicketFromWorkLog({ workLogId: workLog.id, ticketId });
    if (!result.ok) { toast.error(result.error.message); return false; }
    setTickets((current) => current.filter((ticket) => ticket.id !== ticketId));
    toast.success("Ticket removed from this log");
    return true;
  }

  function updateHistory(ticketId: string, history: HistoryEntry[]) {
    setTickets((current) => current.map((ticket) => ticket.id === ticketId ? { ...ticket, history } : ticket));
  }

  return (
    <SaveStatusProvider>
      <div className="work-logs-page work-log-edit-page mx-auto flex max-w-[75rem] flex-col gap-5">
        <header className="wl-card wl-hero motion-page-enter flex flex-col gap-4 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-accent-text">
              <CalendarDays className="size-4" aria-hidden="true" />
              <time dateTime={format(workLog.date, "yyyy-MM-dd")}>{format(workLog.date, "EEEE, d MMMM yyyy")}</time>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-muted"><SaveStatusIndicator /></span>
              <Button variant="secondary" size="sm" onClick={() => router.push(`/work-logs/${workLog.id}`)}><Eye aria-hidden="true" />View timeline</Button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_20rem] md:gap-4">
            <div className="min-w-0">
              <label id="work-log-title-heading" htmlFor="work-log-title" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Title</label>
              <div className="wl-field flex items-center gap-2 px-3">
                <Input bare id="work-log-title" ref={titleRef} value={title} disabled={renaming} onChange={(event) => setTitle(event.target.value)} onBlur={saveTitle} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); titleRef.current?.blur(); } }} className="h-11 min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 py-0 text-xl font-bold tracking-[-0.02em] text-text shadow-none focus:ring-0 md:text-2xl" />
                <PencilLine className="size-4 shrink-0 text-accent-text" aria-hidden="true" />
              </div>
            </div>
            <div className="min-w-0">
              <label htmlFor="work-log-project" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Project / site</label>
              <div className="wl-field flex items-center gap-2 px-3">
                <Building2 className="size-4 shrink-0 text-accent-text" aria-hidden="true" />
                <Input bare id="work-log-project" value={projectName} maxLength={160} disabled={renaming} placeholder="Add a project or site" onChange={(event) => setProjectName(event.target.value)} onBlur={saveProjectName} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); event.currentTarget.blur(); } }} className="h-11 min-w-0 flex-1 border-0 bg-transparent px-0 text-base shadow-none focus:ring-0" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex min-w-0 flex-col gap-5">
          <MeetingSection workLogId={workLog.id} meetings={workLog.meetings} />

          <section aria-labelledby="tickets-heading" className="wl-card">
            <SectionHeading id="tickets-heading" title="Ticket work" count={tickets.length} countLabel="in this log" />
            <div className="p-4 md:p-5">
              <TicketSearch attachedKeys={tickets.map((ticket) => ticket.ticketKey)} onAttach={attach} onFocusAttached={(ticketKey) => document.getElementById(`ticket-card-${ticketKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" })} />
            </div>
            {tickets.length > 0 ? <div className="flex flex-col gap-3 p-4 md:p-5">{tickets.map((ticket) => <TicketWorkCard key={ticket.id} workLogId={workLog.id} ticket={ticket} onSaveWork={saveWork} onDetach={detach} onHistoryLoaded={updateHistory} />)}</div> : <div className="m-4 rounded-xl border border-dashed border-border-strong px-6 py-6 text-center md:m-5"><p className="text-md font-semibold text-text">No ticket work yet</p><p className="mt-1 text-sm text-text-muted">Search above to attach a ticket and record what you did.</p></div>}
          </section>

          <div className="flex flex-wrap items-center gap-3"><Button variant="secondary" onClick={() => router.push("/work-logs")}><ArrowLeft aria-hidden="true" />All work logs</Button><span className="inline-flex items-center gap-2 text-xs text-text-subtle"><Save aria-hidden="true" className="size-3.5" />Changes save automatically.</span></div>
        </div>
      </div>
    </SaveStatusProvider>
  );
}
