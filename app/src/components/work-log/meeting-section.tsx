"use client";

import { CalendarDays, Check, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { updateMeeting } from "@/actions/worklog";
import { cn } from "@/components/cn";
import { MarkdownEditor } from "@/components/work-log/markdown-editor";
import { useAutosave } from "@/components/work-log/save-status";
import type { EditorMeeting } from "@/components/work-log/types";

function ActiveMeetingEditor({
  meeting,
  onChange,
}: {
  meeting: EditorMeeting;
  onChange: (notes: string) => void;
}) {
  const { flush } = useAutosave({
    id: `meeting:${meeting.id}`,
    value: meeting.notes,
    initial: meeting.notes,
    save: async (value) => {
      const result = await updateMeeting({ meetingId: meeting.id, notes: value });
      return result.ok ? { ok: true } : { ok: false, message: result.error.message };
    },
  });

  return (
    <div className="flex min-w-0 flex-col p-4 md:p-5">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-semibold tracking-[-0.015em] text-text">{meeting.name}</h3>
        <label htmlFor={`meeting-${meeting.id}`} className="text-xs text-text-subtle">Decisions, actions, anything to remember</label>
      </div>
      <MarkdownEditor
        id={`meeting-${meeting.id}`}
        value={meeting.notes}
        placeholder="Start typing your notes… Use * then Space for a bullet list."
        ariaLabel={`${meeting.name} notes`}
        onChange={onChange}
        onBlur={() => flush()}
        minHeight="min-h-44"
        className="worklog-writing-field flex-1"
      />
    </div>
  );
}

export function MeetingSection({
  meetings: initialMeetings,
  onCompletedChange,
}: {
  workLogId: string;
  meetings: EditorMeeting[];
  onCompletedChange?: (count: number) => void;
}) {
  const [meetings, setMeetings] = useState(initialMeetings);
  const [activeId, setActiveId] = useState(initialMeetings[0]?.id ?? "");
  const activeMeeting = meetings.find((meeting) => meeting.id === activeId) ?? meetings[0];
  const completed = meetings.filter((meeting) => meeting.notes.trim().length > 0).length;

  useEffect(() => onCompletedChange?.(completed), [completed, onCompletedChange]);

  if (!activeMeeting) return null;

  return (
    <section aria-labelledby="meetings-heading" className="wl-card overflow-hidden">
      <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
        <nav aria-label="Choose a meeting" className="border-b border-border p-4 md:p-5 lg:border-r lg:border-b-0">
          <h2 id="meetings-heading" className="mb-3 flex flex-wrap items-center gap-2 px-1 text-base font-semibold text-text">
            Meeting notes
            <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-medium text-text-muted tabular-nums">{completed} of {meetings.length}</span>
          </h2>
          <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-1">
            {meetings.map((meeting) => {
              const active = meeting.id === activeMeeting.id;
              const filled = meeting.notes.trim().length > 0;
              return (
                <button
                  key={meeting.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveId(meeting.id)}
                  className={cn(
                    "group flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors duration-150",
                    active ? "border border-primary bg-primary-subtle text-text" : "border border-transparent text-text hover:border-border hover:bg-surface",
                  )}
                >
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", active ? "bg-primary text-primary-fg" : filled ? "bg-primary-subtle text-accent-text" : "border border-border bg-surface text-text-muted")}>
                    {filled ? <Check className="size-4" aria-hidden="true" /> : <CalendarDays className="size-4" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-tight">{meeting.name}</span>
                    <span className={cn("mt-1 block text-xs", active ? "text-accent-text" : "text-text-subtle")}>{filled ? "Notes captured" : "Ready to write"}</span>
                  </span>
                  <ChevronRight className={cn("hidden size-4 shrink-0 lg:block", active ? "text-accent-text" : "text-text-subtle opacity-0 group-hover:opacity-100")} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </nav>

        <ActiveMeetingEditor
          key={activeMeeting.id}
          meeting={activeMeeting}
          onChange={(notes) => setMeetings((current) => current.map((meeting) => meeting.id === activeMeeting.id ? { ...meeting, notes } : meeting))}
        />
      </div>
    </section>
  );
}
