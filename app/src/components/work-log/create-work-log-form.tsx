"use client";

import { CalendarPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { openWorkLogForDate } from "@/actions/worklog";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

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

export function CreateWorkLogForm({ existingLogs = [] }: { existingLogs?: Array<{ id: string; date: string }> }) {
  const router = useRouter();
  const [date, setDate] = useState(localDateKey);
  const [title, setTitle] = useState("Daily Work Log");
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const existingLog = existingLogs.find((log) => log.date === date);
  const weekend = isWeekend(date);

  function create() {
    if (!date) {
      setError("Choose a date");
      return;
    }
    if (existingLog) {
      router.push(`/work-logs/${existingLog.id}/edit`);
      toast.success("Opening existing work log");
      return;
    }
    if (weekend) {
      setError("Work logs can only be created on weekdays");
      return;
    }
    setError(undefined);
    startTransition(async () => {
      const result = await openWorkLogForDate({ date, title: title.trim() || undefined, projectName });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      toast.success("Work log ready");
      router.push(`/work-logs/${result.data.id}/edit`);
    });
  }

  return (
    <section id="create-work-log" aria-labelledby="create-work-log-heading" className="wl-card scroll-mt-20 bg-card-navy">
      <div className="wl-card-head">
        <div className="flex items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-fg">
            <CalendarPlus className="size-4" aria-hidden="true" />
          </span>
          <div>
            <h2 id="create-work-log-heading" className="text-base font-semibold text-text">Create a work log</h2>
            <p className="text-xs text-text-muted">Pick a weekday. Meetings and ticket tracking open ready to use.</p>
          </div>
        </div>
      </div>
      <div className="p-5">
      <div className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
        <Field label="Date" htmlFor="new-work-log-date" required>
          <Input id="new-work-log-date" type="date" value={date} aria-invalid={error ? true : undefined} aria-describedby="new-work-log-date-help" onChange={(event) => { setDate(event.target.value); setError(undefined); }} />
        </Field>
        <Field label="Title" htmlFor="new-work-log-title" className="min-w-0">
          <Input id="new-work-log-title" value={title} placeholder="Daily Work Log" onChange={(event) => setTitle(event.target.value)} />
        </Field>
        <Field label="Project name / site" htmlFor="new-work-log-project" className="min-w-0">
          <Input id="new-work-log-project" value={projectName} maxLength={160} placeholder="e.g. ASU Online" onChange={(event) => setProjectName(event.target.value)} />
        </Field>
        <Button className="whitespace-nowrap" onClick={create} loading={pending} disabled={weekend && !existingLog}>{existingLog ? "Open log" : "Create log"}</Button>
      </div>
      <p id="new-work-log-date-help" className="mt-2 text-xs text-text-subtle">Weekdays only. Existing dates open the saved log.</p>
      {error ? <p className="mt-2 text-sm text-danger" role="alert">{error}</p> : null}
      </div>
    </section>
  );
}
