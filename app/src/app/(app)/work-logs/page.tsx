import { Building2, CalendarDays, ChevronDown, History, Plus, Ticket } from "lucide-react";
import Link from "next/link";
import { addDays, format, isSameDay, isWeekend, startOfDay } from "date-fns";

import { listWorkLogs } from "@/actions/worklog";
import { SPRINT_CYCLE_ANCHOR, SPRINT_CYCLE_DAYS, getSprint } from "@/lib/sprint";
import { CreateWorkLogForm } from "@/components/work-log/create-work-log-form";
import { cn } from "@/components/cn";
import { PageHeader } from "@/components/shell/page-header";
import { buttonVariants } from "@/components/ui/button";

export const metadata = { title: "Work Logs" };

type Period = {
  offset: number;
  start: Date;
  end: Date;
  logs: WorkLogListItem[];
};

type WorkLogListItem = {
  id: string;
  title: string;
  projectName: string | null;
  date: Date;
  updatedAt: Date;
  _count: { meetings: number; ticketUpdates: number };
};

/** The sprint calendar lives in `lib/sprint.ts` — do not re-derive it here. */
const getPeriod = getSprint;

function buildPeriods(logs: WorkLogListItem[]) {
  const grouped = new Map<number, Period>();

  for (const log of logs) {
    const period = getPeriod(log.date);
    const existing = grouped.get(period.offset);
    grouped.set(period.offset, {
      offset: period.offset,
      start: period.start,
      end: period.end,
      logs: existing ? [...existing.logs, log] : [log],
    });
  }

  const offsets = [...grouped.keys()];
  const latestOffset = offsets.length ? Math.max(...offsets) : 0;
  const earliestOffset = offsets.length ? Math.min(...offsets) : 0;

  // Keep gaps visible so the sprint schedule stays truthful even when a period
  // had no work log. The extra final period keeps the next sprint calculated.
  for (let offset = earliestOffset; offset <= latestOffset + 1; offset += 1) {
    if (grouped.has(offset)) continue;
      const period = getPeriod(addDays(SPRINT_CYCLE_ANCHOR, offset * SPRINT_CYCLE_DAYS));
    grouped.set(offset, {
      offset,
      start: period.start,
      end: period.end,
      logs: [],
    });
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => b - a)
    .map(([, period]) => period);
}

export default async function WorkLogsPage() {
  const result = await listWorkLogs({ take: 50 });
  const logs = result.ok ? result.data.items : [];
  const weekdayLogs = logs.filter((log) => !isWeekend(log.date));
  const periods = buildPeriods(weekdayLogs);
  // One `today` for the whole render, so the accent marker cannot land on two
  // different days if the render straddles midnight.
  const today = startOfDay(new Date());
  const currentOffset = getPeriod(today).offset;
  const currentPeriod = periods.find((period) => period.offset === currentOffset);
  // Older sprints stay collapsed until asked for; only ones with logs are listed.
  const previousPeriods = periods.filter((period) => period.offset < currentOffset && period.logs.length > 0);

  return (
    <div className="work-logs-page">
      <PageHeader
        title="Work Logs"
        description="Capture the day once, then revisit it as a clean timeline."
        action={
          <Link href="#create-work-log" className={buttonVariants()}>
            <Plus aria-hidden="true" />
            New work log
          </Link>
        }
      />

      <div className="flex flex-col gap-6">
        <CreateWorkLogForm existingLogs={logs.map((log) => ({ id: log.id, date: format(log.date, "yyyy-MM-dd") }))} />

        <section aria-labelledby="work-log-periods-heading" className="flex min-w-0 flex-col gap-4">
          <h2 id="work-log-periods-heading" className="text-xl font-semibold text-text">Sprint timeline</h2>
          {currentPeriod ? <SprintTable period={currentPeriod} currentOffset={currentOffset} today={today} /> : null}

          {previousPeriods.length > 0 ? (
            <details className="motion-disclosure group mt-2 border-t border-border pt-4">
              <summary className="flex w-fit cursor-pointer list-none items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm font-semibold text-accent-text transition-colors hover:border-primary hover:bg-primary-subtle [&::-webkit-details-marker]:hidden">
                <History className="size-4" aria-hidden="true" />
                <span className="group-open:hidden">Show previous sprints</span>
                <span className="hidden group-open:inline">Hide previous sprints</span>
                <span className="rounded-full bg-sidebar px-2 py-0.5 text-xs text-sidebar-fg tabular-nums">{previousPeriods.length}</span>
                <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <div className="motion-disclosure-content mt-5 flex flex-col gap-8">
                {previousPeriods.map((period) => <SprintTable key={period.start.toISOString()} period={period} currentOffset={currentOffset} today={today} />)}
              </div>
            </details>
          ) : null}
        </section>
      </div>
    </div>
  );
}

/**
 * One sprint as a calendar: its ten weekdays in a 2 × 5 grid (the sprint
 * starts mid-week, so tiles carry their own weekday instead of column heads).
 * Logged days link to the log; today is filled teal; missed days are dashed;
 * days still ahead are faded.
 */
function SprintTable({ period, currentOffset, today }: { period: Period; currentOffset: number; today: Date }) {
  const isCurrent = period.offset === currentOffset;
  const byDay = new Map(period.logs.map((log) => [format(log.date, "yyyy-MM-dd"), log]));
  const days = Array.from({ length: SPRINT_CYCLE_DAYS }, (_, index) => addDays(period.start, index)).filter((day) => !isWeekend(day));
  const elapsed = days.filter((day) => day <= today).length;
  const logged = days.filter((day) => byDay.has(format(day, "yyyy-MM-dd"))).length;
  const progress = days.length ? Math.round((logged / days.length) * 100) : 0;

  return (
    <div className="motion-page-enter min-w-0">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold text-text">
          <CalendarDays className="size-4 text-primary" aria-hidden="true" />
          {format(period.start, "d MMM")} – {format(period.end, "d MMM yyyy")}
          {isCurrent ? <span className="rounded-full bg-sidebar px-2 py-0.5 text-xs font-semibold text-sidebar-fg">Current</span> : null}
        </h3>
        <div className="flex min-w-48 flex-col items-end gap-1.5">
          <span className="text-sm font-medium text-text-muted tabular-nums">
            <strong className="font-bold text-text">{logged}</strong> of {days.length} days logged{isCurrent ? ` · ${days.length - elapsed} to go` : ""}
          </span>
          <span className="h-1.5 w-48 overflow-hidden rounded-full bg-card-navy" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Sprint days logged">
            <span className="block h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </span>
        </div>
      </div>

      <ol className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {days.map((day) => {
          const log = byDay.get(format(day, "yyyy-MM-dd"));
          const isToday = isSameDay(day, today);
          const future = day > today && !isToday;
          const dateLabel = (
            <span className="flex items-baseline justify-between gap-2">
              <span className={cn("text-xs font-semibold uppercase tracking-[0.08em]", isToday && log ? "text-primary-fg" : "text-text-muted")}>{format(day, "EEE")}</span>
              <span className={cn("text-2xl font-bold leading-none tabular-nums", isToday && log ? "text-primary-fg" : future ? "text-text-subtle" : "text-text")}>{format(day, "d")}</span>
            </span>
          );

          if (log) {
            return (
              <li key={day.toISOString()} className="min-w-0">
                <Link
                  href={`/work-logs/${log.id}`}
                  aria-label={`${format(day, "EEEE d MMMM")}: ${log.title}`}
                  className={cn(
                    "group flex h-full min-h-32 flex-col gap-2 rounded-xl border p-3 transition-colors",
                    isToday ? "border-primary bg-primary text-primary-fg hover:bg-primary-hover" : "border-border bg-surface hover:border-primary hover:bg-surface-2",
                  )}
                >
                  {dateLabel}
                  <span className={cn("line-clamp-2 text-sm font-semibold", isToday ? "text-primary-fg" : "text-text group-hover:text-accent-text")}>{log.title}</span>
                  <span className={cn("mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs", isToday ? "text-primary-fg" : "text-text-muted")}>
                    {log.projectName ? <span className="inline-flex min-w-0 items-center gap-1"><Building2 className="size-3.5 shrink-0" aria-hidden="true" /><span className="truncate">{log.projectName}</span></span> : null}
                    <span className="inline-flex items-center gap-1 tabular-nums"><Ticket className="size-3.5" aria-hidden="true" />{log._count.ticketUpdates}</span>
                    {isToday ? <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-2xs font-bold text-accent-text">Today</span> : null}
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li
              key={day.toISOString()}
              className={cn(
                "flex min-h-32 flex-col gap-2 rounded-xl border p-3",
                future ? "border-border bg-surface-2 opacity-70" : isToday ? "border-2 border-dashed border-primary" : "border-dashed border-border-strong",
              )}
            >
              {dateLabel}
              <span className={cn("mt-auto text-xs font-medium", isToday ? "text-accent-text" : "text-text-muted")}>
                {future ? "Upcoming" : isToday ? "Not logged yet — create it above" : "No log"}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
