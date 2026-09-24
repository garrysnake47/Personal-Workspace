import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  ClipboardList,
  FileText,
  LibraryBig,
  ListChecks,
  NotebookPen,
  Plus,
  Target,
} from "lucide-react";
import Link from "next/link";
import { differenceInCalendarDays, format } from "date-fns";
import type { ComponentType } from "react";

import { cn } from "@/components/cn";
import { DashboardCardMotion } from "@/components/dashboard/dashboard-card-motion";
import { TicketId } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  TICKET_STATUS_LABELS,
  TICKET_STATUS_DOT,
  TicketStatusBadge,
} from "@/components/ui/ticket-status-badge";
import { getDashboard } from "@/lib/dashboard";
import { requireUserId } from "@/lib/session";
import { normalizeTicketStatus, WORKFLOW_STATUS_ORDER } from "@/lib/workflow-status";

export const metadata = { title: "Dashboard" };

/** A daily command centre: one dominant action, then context and momentum. */
export default async function DashboardPage() {
  const userId = await requireUserId();
  const now = new Date();
  const data = await getDashboard(userId, now);
  const needsYou = [...data.overdue, ...data.dueToday];
  const sprintActive = data.sprintLogCount || data.sprintTicketCount || data.sprintUpdateCount;

  return (
    <div className="dashboard-page flex min-w-0 flex-col gap-5 md:gap-6">
      <DashboardCardMotion />
      <section data-card-reveal aria-labelledby="dash-today" className="dashboard-today-card">
        <div role="img" aria-label="A sunlit desk with coffee, a plant and a planning notebook" className="dashboard-today-art" />
        <div className="dashboard-hero-inner relative z-10 mx-auto flex w-full max-w-[85rem] flex-col px-3 py-8 md:grid md:grid-rows-[1fr_auto_1fr] md:px-5 md:py-12 lg:px-8">
          <div className="flex min-w-0 flex-col gap-6 md:self-start lg:flex-row lg:items-start lg:justify-between lg:gap-8">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.14em] text-accent-text uppercase">{format(now, "EEEE, d MMMM")}</p>
              <h1 className="mt-2 text-5xl font-extrabold tracking-[-0.055em] text-text md:text-6xl">{greeting(now)}.</h1>
              <p className="mt-3 text-lg text-text-muted">One clear view of what matters next.</p>
            </div>
            <nav aria-label="Workspace shortcuts" className="grid min-w-0 grid-cols-3 gap-1 md:gap-2 lg:w-[46%] lg:max-w-2xl dashboard-hero-links">
              <QuickLink href="/notes" icon={FileText} label="Notes" count={data.noteCount} />
              <QuickLink href="/resources" icon={LibraryBig} label="Resources" count={data.resourceCount} />
              <QuickLink href="/work-logs" icon={ClipboardList} label="Sprint logs" count={data.sprintLogCount} />
            </nav>
          </div>

          <div className="w-full max-w-xl py-10 md:py-8">
            <span className="mb-5 grid size-11 place-items-center rounded-xl bg-sidebar text-sidebar-fg" aria-hidden="true"><NotebookPen className="size-5" /></span>
            {data.todayLog ? (
              <div className="flex w-full flex-col items-start">
                <h2 id="dash-today" className="max-w-[16ch] text-3xl font-extrabold tracking-[-0.035em] text-text md:text-4xl">Your workday already has a shape.</h2>
                {data.todayLog.projectName ? <p className="mt-3 inline-flex max-w-full min-w-0 items-center gap-2 text-sm font-semibold text-accent-text"><Building2 aria-hidden="true" className="size-4 shrink-0" /><span className="truncate">{data.todayLog.projectName}</span></p> : null}
                <dl className="mt-7 grid w-full max-w-2xl gap-3 xs:grid-cols-3">
                  <Metric label="Meetings captured" value={`${data.todayLog.meetingsFilled}/${data.todayLog.meetingsTotal}`} />
                  <Metric label="Ticket updates" value={data.todayLog.ticketUpdates} />
                  <Metric label="Record" value={data.todayLog.ticketUpdates || data.todayLog.meetingsFilled ? "Active" : "Ready"} />
                </dl>
                <div className="mt-7 flex flex-wrap justify-start gap-2">
                  <Link href={`/work-logs/${data.todayLog.id}/edit`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-sidebar px-5 text-sm font-semibold text-sidebar-fg transition-opacity hover:opacity-85 dark:bg-sidebar-fg dark:text-sidebar"><NotebookPen aria-hidden="true" className="size-4" /> Continue the log</Link>
                  <Link href={`/work-logs/${data.todayLog.id}`} className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-text transition-colors hover:text-accent-text">View timeline <ArrowRight aria-hidden="true" className="size-4" /></Link>
                </div>
              </div>
            ) : (
              <div className="flex max-w-2xl flex-col items-start">
                <h2 id="dash-today" className="max-w-[17ch] text-3xl font-extrabold tracking-[-0.035em] text-text md:text-4xl">Give today a place to land.</h2>
                <p className="mt-3 max-w-[48ch] text-sm leading-6 text-text-muted md:text-md">Open one log for meetings, ticket updates, and the details you will need tomorrow.</p>
                <Link href="/work-logs#create-work-log" className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-sidebar px-5 text-sm font-semibold text-sidebar-fg transition-opacity hover:opacity-85 dark:bg-sidebar-fg dark:text-sidebar"><Plus aria-hidden="true" className="size-4" /> Start today&apos;s log</Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid min-w-0 gap-5 lg:grid-cols-12 lg:gap-6">

        <section data-card-reveal aria-labelledby="dash-focus" className="flex min-w-0 flex-col rounded-2xl border border-border bg-card-navy p-6 md:p-8 lg:col-span-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 id="dash-focus" className="text-xl font-bold tracking-tight text-text">Needs you</h2>
              <p className="mt-1 text-sm text-text-muted">Your focus queue</p>
            </div>
            <span className="grid size-10 place-items-center rounded-xl bg-primary-subtle text-accent-text"><Target aria-hidden="true" className="size-5" /></span>
          </div>

          {needsYou.length === 0 ? (
            <div className="my-auto flex items-start gap-3 py-8">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-success-subtle text-success"><CalendarCheck2 aria-hidden="true" className="size-5" /></span>
              <div>
                <p className="text-lg font-bold text-text">The day is clear.</p>
                <p className="mt-1 text-sm leading-6 text-text-muted">Nothing is due today{data.undatedCount ? ` · ${data.undatedCount} open without a date` : ""}.</p>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex min-w-0 flex-col gap-2">
              {needsYou.slice(0, 4).map((entry) => {
                const overdue = entry.dueDate !== null && entry.dueDate.toISOString().slice(0, 10) < data.today.toISOString().slice(0, 10);
                return (
                  <Link key={entry.id} href="/tracker" className="group flex min-w-0 items-center gap-3 rounded-lg bg-surface p-3 transition-colors hover:bg-surface-3">
                    <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", overdue ? "bg-danger" : "bg-primary-strong")} />
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-text">{entry.subject}</span><span className="mt-0.5 block truncate text-xs text-text-muted">{overdue ? "Overdue · " : ""}{entry.kind === "Task" ? "Task" : entry.person ?? "Follow-up"}</span></span>
                    <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-text-subtle transition-transform group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </div>
          )}

          <Link href="/tracker" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-auto self-start")}><ListChecks aria-hidden="true" /> Open tracker</Link>
        </section>

        <section data-card-reveal aria-labelledby="dash-momentum" className="border-t border-border pt-6 md:pt-8 lg:col-span-7 lg:px-6">
          <p className="text-xs font-semibold tracking-[0.12em] text-text-subtle uppercase">{format(data.sprint.start, "d MMM")} – {format(data.sprint.end, "d MMM")}</p>
          <h2 id="dash-momentum" className="mt-1 text-xl font-bold tracking-tight text-text">Sprint momentum</h2>
          <SprintTimeline start={data.sprint.start} end={data.sprint.end} today={data.today} />
          {sprintActive ? (
            <dl className="mt-5 grid grid-cols-3 gap-2">
              <SmallMetric label="Logs" value={data.sprintLogCount} />
              <SmallMetric label="Tickets" value={data.sprintTicketCount} />
              <SmallMetric label="Updates" value={data.sprintUpdateCount} />
            </dl>
          ) : (
            <p className="mt-5 text-sm text-text-muted">Nothing logged in this sprint yet.</p>
          )}

          <div className="mt-7 border-t border-border pt-5">
            <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold text-text-muted">Workflow</p><p className="mt-1 text-3xl font-extrabold tracking-tight text-text tabular-nums">{data.ticketTotal}</p></div><Link href="/tickets" className="inline-flex min-h-11 items-center gap-2 px-2 text-sm font-semibold text-accent-text hover:underline">Manage tickets <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
              {WORKFLOW_STATUS_ORDER.map((stage) => (
                <div key={stage} className="flex min-w-0 items-center gap-2 text-xs"><span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", TICKET_STATUS_DOT[stage])} /><span className="min-w-0 flex-1 truncate text-text-muted">{TICKET_STATUS_LABELS[stage]}</span><strong className="text-text tabular-nums">{data.stageCounts[stage]}</strong></div>
              ))}
            </div>
          </div>
        </section>

        <section data-card-reveal aria-labelledby="dash-recent" className="border-t border-border pt-6 md:pt-8 lg:col-span-12">
          <div className="flex items-end justify-between gap-3"><div><h2 id="dash-recent" className="text-xl font-bold tracking-tight text-text">Recent ticket work</h2><p className="mt-1 text-sm text-text-muted">Your latest activity, in order</p></div><Link href="/work-logs" className="text-sm font-semibold text-accent-text hover:underline">All work logs</Link></div>

          {data.recentUpdates.length === 0 ? (
            <div className="mt-6 flex items-center gap-3 py-6"><ClipboardList aria-hidden="true" className="size-6 text-text-subtle" /><p className="text-sm text-text-muted">Your latest ticket updates will form a trail here.</p></div>
          ) : (
            <div className="mt-6 grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_8rem]">
              <div className="relative flex min-w-0 flex-col before:absolute before:top-3 before:bottom-3 before:left-2 before:w-px before:bg-border">
                {data.recentUpdates.slice(0, 5).map((update) => (
                  <Link key={update.id} href={`/work-logs/${update.workLog.id}`} className="group relative flex min-w-0 gap-4 rounded-lg py-3 pl-8 transition-colors hover:bg-surface-3">
                    <span aria-hidden="true" className="absolute left-0.5 top-5 size-3 rounded-full border-2 border-surface bg-primary-strong" />
                    <span className="min-w-0 flex-1"><span className="flex min-w-0 flex-wrap items-center gap-2"><TicketId>{update.ticket.ticketId}</TicketId><TicketStatusBadge status={normalizeTicketStatus(update.status)} /><time className="ml-auto text-xs text-text-subtle">{format(update.workLog.date, "d MMM")}</time></span><span className="mt-1 block truncate text-sm text-text-muted">{update.description.trim() || update.ticket.title}</span></span>
                  </Link>
                ))}
              </div>
              <div className="hidden flex-col items-end justify-end md:flex">
                <strong className="text-5xl font-extrabold tracking-tight text-text tabular-nums">{data.recentUpdates.length}</strong>
                <span className="mt-1 text-xs text-text-muted">recent updates</span>
              </div>
            </div>
          )}
        </section>
      </div>

    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="border-t border-border pt-3"><dt className="text-xs text-text-muted">{label}</dt><dd className="mt-1 text-2xl font-extrabold text-text tabular-nums">{value}</dd></div>;
}

function SmallMetric({ label, value }: { label: string; value: number }) {
  return <div className="border-t border-border pt-3"><dt className="text-xs text-text-muted">{label}</dt><dd className="mt-1 text-2xl font-extrabold text-text tabular-nums">{value}</dd></div>;
}

function QuickLink({ href, icon: Icon, label, count }: { href: string; icon: ComponentType<{ className?: string }>; label: string; count: number }) {
  return <Link href={href} className="group flex min-h-14 min-w-0 items-center gap-1.5 rounded-xl border border-border bg-surface px-2.5 text-xs font-semibold text-text transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-accent-text hover:bg-surface-2 hover:text-accent-text focus-visible:border-accent-text focus-visible:bg-surface-2 md:gap-2 md:px-3 md:text-sm"><Icon aria-hidden="true" className="size-4 shrink-0 text-accent-text md:size-5" /><span className="min-w-0 flex-1 truncate">{label}</span><span className="tabular-nums text-text-muted">{count}</span><ArrowRight aria-hidden="true" className="size-3.5 shrink-0 text-text-subtle transition-transform group-hover:translate-x-0.5 md:size-4" /></Link>;
}

function SprintTimeline({ start, end, today }: { start: Date; end: Date; today: Date }) {
  const days = Math.max(1, differenceInCalendarDays(end, start) + 1);
  const elapsed = Math.max(0, Math.min(days, differenceInCalendarDays(today, start) + 1));

  return (
    <div className="mt-5">
      <svg role="img" aria-label={`Day ${elapsed} of ${days} in the current sprint`} viewBox={`0 0 ${days * 18 - 8} 44`} preserveAspectRatio="none" className="h-11 w-full max-w-sm">
        {Array.from({ length: days }, (_, index) => (
          <rect
            key={index}
            x={index * 18}
            y={index === elapsed - 1 ? 3 : 11}
            width="10"
            height={index === elapsed - 1 ? 38 : 30}
            rx="5"
            fill={index < elapsed ? "var(--c-primary)" : "var(--c-surface-3)"}
          />
        ))}
      </svg>
      <p className="mt-1 text-xs font-semibold text-text-muted">Day {elapsed} of {days}</p>
    </div>
  );
}

function greeting(now: Date) {
  const hour = now.getHours();
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
