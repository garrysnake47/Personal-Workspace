import { ArrowLeft, Edit3 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getTicket } from "@/actions/tickets";
import { getWorkLog } from "@/actions/worklog";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { WorkLogTimeline } from "@/components/work-log/work-log-timeline";
import { WorkLogGlance } from "@/components/work-log/work-log-glance";
import type { EditorWorkLog, HistoryEntry } from "@/components/work-log/types";

export const metadata = { title: "Work Log Timeline" };

export default async function WorkLogTimelinePage({ params }: { params: Promise<{ workLogId: string }> }) {
  const { workLogId } = await params;
  const result = await getWorkLog(workLogId);
  if (!result.ok) notFound();
  const data = result.data;

  // Full history per ticket (work-log updates + direct ticket updates), newest first.
  const histories = await Promise.all(data.ticketUpdates.map(async (update): Promise<HistoryEntry[]> => {
    const ticket = await getTicket(update.ticket.id);
    if (!ticket.ok) return [];
    return [
      ...ticket.data.updates.map((entry) => ({ id: entry.id, description: entry.description, status: entry.status, createdAt: new Date(entry.createdAt), updatedAt: new Date(entry.updatedAt), workLog: entry.workLog ? { id: entry.workLog.id, title: entry.workLog.title, date: new Date(entry.workLog.date) } : null })),
      ...ticket.data.historyEntries.map((entry) => ({ id: entry.id, description: entry.body, status: entry.status, createdAt: new Date(entry.createdAt), updatedAt: new Date(entry.createdAt), workLog: null })),
    ].sort((a, b) => (b.workLog?.date ?? b.createdAt).getTime() - (a.workLog?.date ?? a.createdAt).getTime() || b.createdAt.getTime() - a.createdAt.getTime());
  }));

  const workLog: EditorWorkLog = {
    id: data.id,
    title: data.title,
    projectName: data.projectName,
    date: new Date(data.date),
    updatedAt: new Date(data.updatedAt),
    meetings: data.meetings.map((meeting) => ({ id: meeting.id, name: meeting.name, notes: meeting.notes, order: meeting.order, isDefault: meeting.isDefault })),
    tickets: data.ticketUpdates.map((update, index) => ({
      id: update.ticket.id,
      ticketKey: update.ticket.ticketId,
      title: update.ticket.title,
      status: update.ticket.status,
      updatedAt: new Date(update.ticket.updatedAt),
      draft: { description: update.description, status: update.status },
      history: histories[index],
    })),
  };

  return (
    <div className="work-logs-page work-log-detail-page">
      <PageHeader
        title={workLog.title}
        description="A read-only timeline of the meetings and ticket work captured in this log."
        action={<div className="flex flex-wrap gap-2"><Link href="/work-logs"><Button variant="secondary"><ArrowLeft aria-hidden="true" />All logs</Button></Link><Link href={`/work-logs/${workLog.id}/edit`}><Button><Edit3 aria-hidden="true" />Edit work log</Button></Link></div>}
      />
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
        <WorkLogTimeline workLog={workLog} />
        <WorkLogGlance workLogId={workLog.id} tickets={workLog.tickets} />
      </div>
    </div>
  );
}
