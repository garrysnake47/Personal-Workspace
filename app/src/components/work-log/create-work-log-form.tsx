"use client";

import { ArrowRight, CalendarPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { openWorkLogForDate, updateWorkLog } from "@/actions/worklog";
import { DAY_LABEL, type DayType } from "@/components/work-log/day-type";
import { DayTypeToggle } from "@/components/work-log/day-type-toggle";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

/** Today's date as YYYY-MM-DD (local), the latest date that can be logged. */
function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function localDateKey() {
  const date = new Date();
  const day = date.getDay();
  if (day === 0) date.setDate(date.getDate() - 2);
  if (day === 6) date.setDate(date.getDate() - 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isWeekend(dateKey: string) {
  if (!dateKey) return false;
  const day = new Date(`${dateKey}T00:00:00.000Z`).getUTCDay();
  return day === 0 || day === 6;
}

const TITLE_PLACEHOLDER: Record<DayType, string> = {
  Work: "What's the focus today? e.g. Catalogue migration fixes",
  Holiday: "e.g. Diwali",
  Leave: "e.g. Doctor's appointment",
};

export function CreateWorkLogForm({
  existingLogs = [],
  today,
}: {
  existingLogs?: Array<{ id: string; date: string }>;
  /** Pre-formatted on the server so the labels can't drift on hydration. */
  today: { day: string; weekday: string; monthYear: string };
}) {
  const router = useRouter();
  const [date, setDate] = useState(localDateKey);
  const [title, setTitle] = useState("");
  const [dayType, setDayType] = useState<DayType>("Work");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const existingLog = existingLogs.find((log) => log.date === date);
  const weekend = isWeekend(date);
  const future = date > todayKey();

  function create() {
    if (!date) {
      setError("Choose a date");
      return;
    }
    if (existingLog) {
      // Marking an already-logged day as Holiday / Leave updates that log.
      if (dayType !== "Work") {
        startTransition(async () => {
          const result = await updateWorkLog({ workLogId: existingLog.id, dayType });
          if (!result.ok) { setError(result.error.message); return; }
          toast.success(`${DAY_LABEL[dayType]} marked for ${date}`);
          router.refresh();
        });
        return;
      }
      router.push(`/work-logs/${existingLog.id}/edit`);
      toast.success("Opening existing work log");
      return;
    }
    if (future) {
      setError("You can't log a future date");
      return;
    }
    if (weekend) {
      setError("Work logs can only be created on weekdays");
      return;
    }
    setError(undefined);
    startTransition(async () => {
      const result = await openWorkLogForDate({ date, title: title.trim() || undefined, dayType });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      if (dayType !== "Work") {
        // Nothing to fill in for a day off — record it and stay on the list.
        toast.success(`${DAY_LABEL[dayType]} marked for ${date}`);
        setTitle("");
        setDayType("Work");
        router.refresh();
        return;
      }
      toast.success("Work log ready");
      router.push(`/work-logs/${result.data.id}/edit`);
    });
  }

  return (
    <section id="create-work-log" aria-labelledby="create-work-log-heading" className="wl-card motion-page-enter scroll-mt-20 grid overflow-hidden md:grid-cols-[17rem_minmax(0,1fr)] lg:grid-cols-[19rem_minmax(0,1fr)]">
      {/* Navy "today" panel — same recipe as the editor's header. */}
      <div className="wl-hero flex flex-col justify-center gap-3 p-6 md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">Today</p>
        <p className="flex items-center gap-4">
          <span className="text-7xl font-bold leading-none tracking-[-0.05em] text-text tabular-nums">{today.day}</span>
          <span className="flex flex-col">
            <span className="text-2xl font-semibold tracking-[-0.02em] text-text">{today.weekday}</span>
            <span className="text-sm font-medium text-text-muted">{today.monthYear}</span>
          </span>
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-5 p-5 md:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-subtle text-accent-text">
            <CalendarPlus className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 id="create-work-log-heading" className="text-lg font-semibold tracking-[-0.015em] text-text">Create a work log</h2>
            <p className="text-sm text-text-muted">Pick a weekday. Log a work day, or mark it as a holiday or leave.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-end">
          <Field label="Date" htmlFor="new-work-log-date" required>
            <Input id="new-work-log-date" type="date" max={todayKey()} value={date} aria-invalid={error ? true : undefined} aria-describedby="new-work-log-date-help" onChange={(event) => { setDate(event.target.value); setError(undefined); }} />
          </Field>
          <div className="flex min-w-0 flex-col gap-2">
            <span id="new-work-log-day-type-label" className="text-sm font-semibold text-text">Day type</span>
            <DayTypeToggle name="new-work-log-day-type" labelledBy="new-work-log-day-type-label" value={dayType} onChange={setDayType} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Field label="Title" htmlFor="new-work-log-title" className="min-w-0">
            <Input id="new-work-log-title" value={title} placeholder={TITLE_PLACEHOLDER[dayType]} onChange={(event) => setTitle(event.target.value)} />
          </Field>
          <Button className="w-full whitespace-nowrap" onClick={create} loading={pending} disabled={future || (weekend && !existingLog)}>
            {dayType !== "Work" ? `Mark ${DAY_LABEL[dayType].toLowerCase()}` : existingLog ? "Open log" : "Create log"}
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>

        <div className="border-t border-border pt-3">
          <p id="new-work-log-date-help" className="text-xs text-text-subtle">Weekdays up to today — future dates can&apos;t be logged. Existing dates open the saved log.</p>
          {error ? <p className="mt-2 text-sm text-danger" role="alert">{error}</p> : null}
        </div>
      </div>
    </section>
  );
}
