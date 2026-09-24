import { notFound } from "next/navigation";

import { getWorkLog } from "@/actions/worklog";
import { WorkLogEditor } from "@/components/work-log/work-log-editor";
import type { EditorWorkLog } from "@/components/work-log/types";

export const metadata = { title: "Edit Work Log" };

export default async function EditWorkLogPage({ params }: { params: Promise<{ workLogId: string }> }) {
  const { workLogId } = await params;
  const result = await getWorkLog(workLogId);
  if (!result.ok) notFound();
  const data = result.data;
  const workLog: EditorWorkLog = {
    id: data.id,
    title: data.title,
    projectName: data.projectName,
    date: new Date(data.date),
    updatedAt: new Date(data.updatedAt),
    meetings: data.meetings.map((meeting) => ({ id: meeting.id, name: meeting.name, notes: meeting.notes, order: meeting.order, isDefault: meeting.isDefault })),
    tickets: data.ticketUpdates.map((update) => ({
      id: update.ticket.id,
      ticketKey: update.ticket.ticketId,
      title: update.ticket.title,
      status: update.ticket.status,
      updatedAt: new Date(update.ticket.updatedAt),
      draft: { description: update.description, status: update.status },
      history: null,
    })),
  };

  return <WorkLogEditor workLog={workLog} />;
}
