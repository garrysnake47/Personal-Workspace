import {
  BookOpen,
  Check,
  FileBarChart,
  LayoutDashboard,
  Link2,
  ListTodo,
  NotebookPen,
  Search,
  SquareStack,
  StickyNote,
  Ticket,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/components/cn";

/* ---------------------------------------------------------------------------
   Product "screenshots", drawn in DOM + tokens rather than shipped as images.

   WHY: there is no real app screenshot yet, and a PNG would go stale the first
   time the dashboard changes. Everything here is decorative chrome — each mock
   is exposed to assistive tech as a single labelled image (role="img" +
   aria-label), so none of the fake numbers get read out as content.

   TO SWAP FOR A REAL SCREENSHOT: replace the body of the relevant component
   with <Image ... /> and keep the wrapper + aria-label. Nothing else on the
   page reaches inside these.
--------------------------------------------------------------------------- */

const SIDEBAR_ITEMS: readonly { icon: LucideIcon; label: string }[] = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: NotebookPen, label: "Work Logs" },
  { icon: Ticket, label: "Tickets" },
  { icon: ListTodo, label: "Tasks" },
  { icon: StickyNote, label: "Notes" },
  { icon: FileBarChart, label: "Reports" },
  { icon: Link2, label: "Links" },
  { icon: BookOpen, label: "Resources" },
];

const STATS = [
  { label: "Logs this month", value: "18" },
  { label: "Active tickets", value: "7" },
  { label: "Updates logged", value: "142" },
  { label: "Tasks due today", value: "4" },
] as const;

const TICKETS = [
  { id: "ASU-1234", title: "Payment retry job drops receipts", tone: "progress" },
  { id: "VER-2456", title: "Verify SSO rollout for finance team", tone: "testing" },
  { id: "ASU-1189", title: "Waiting on infra for the queue limit", tone: "waiting" },
  { id: "OPS-0042", title: "Nightly export runs twice on Sundays", tone: "blocked" },
] as const;

const TONE_CLASS = {
  progress: "bg-status-progress-bg text-status-progress-fg",
  testing: "bg-status-testing-bg text-status-testing-fg",
  waiting: "bg-status-waiting-bg text-status-waiting-fg",
  blocked: "bg-status-blocked-bg text-status-blocked-fg",
} as const;

const TONE_LABEL = {
  progress: "In Progress",
  testing: "Testing",
  waiting: "Waiting",
  blocked: "Blocked",
} as const;

function MockFrame({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("overflow-hidden bg-surface select-none", className)}
    >
      {children}
    </div>
  );
}

function MockTopBar() {
  return (
    <div className="flex h-8 items-center gap-2 border-b border-border px-3">
      <span className="flex flex-1 items-center gap-1.5 rounded-md bg-surface-2 px-2 py-1">
        <Search aria-hidden="true" className="size-2.5 text-text-subtle" />
        <span className="text-2xs text-text-subtle">Search everything</span>
      </span>
      <span className="hidden text-2xs text-text-subtle md:inline">Thu, 12 Sep</span>
      <span className="size-4 rounded-full bg-primary-subtle" />
    </div>
  );
}

/** Full dashboard mock — the hero band screenshot. */
export function DashboardMock() {
  return (
    <MockFrame label="A preview of the WorkNest dashboard: sidebar navigation, daily counters, active tickets and today's tasks.">
      <div className="flex">
        {/* Sidebar — dropped below md so the mock never forces a scrollbar. */}
        <div className="hidden w-36 shrink-0 flex-col border-r border-border bg-bg p-2 md:flex">
          <div className="mb-3 flex items-center gap-1.5 px-1 py-1">
            <span className="grid size-4 place-items-center rounded bg-primary text-primary-fg">
              <SquareStack className="size-2.5" />
            </span>
            <span className="text-2xs font-bold text-text">WorkNest</span>
          </div>
          {SIDEBAR_ITEMS.map((item, index) => (
            <span
              key={item.label}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-2xs",
                index === 0
                  ? "border-l-2 border-primary bg-primary-subtle font-semibold text-text"
                  : "text-text-muted",
              )}
            >
              <item.icon aria-hidden="true" className="size-3 shrink-0" />
              {item.label}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <MockTopBar />

          <div className="flex flex-col gap-3 p-3">
            <div>
              <p className="text-xs font-bold text-text">Good morning</p>
              <p className="text-2xs text-text-muted">
                Today&rsquo;s log is open. 3 meetings, 2 tickets touched.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-md border border-border bg-surface p-2"
                >
                  <p className="text-2xs text-text-subtle">{stat.label}</p>
                  <p className="text-lg leading-6 font-extrabold text-text">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-2 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-md border border-border p-2">
                <p className="mb-1.5 text-2xs font-bold text-text">Active tickets</p>
                <div className="flex flex-col gap-1.5">
                  {TICKETS.map((ticket) => (
                    <div key={ticket.id} className="flex items-center gap-2">
                      <span className="font-mono text-2xs font-medium text-text">
                        {ticket.id}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-2xs text-text-muted">
                        {ticket.title}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded-sm px-1.5 py-0.5 text-2xs font-semibold",
                          TONE_CLASS[ticket.tone],
                        )}
                      >
                        {TONE_LABEL[ticket.tone]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-border p-2">
                <p className="mb-1.5 text-2xs font-bold text-text">Today</p>
                <div className="flex flex-col gap-1.5">
                  {[
                    "Write up the release notes",
                    "Reply on ASU-1234",
                    "Prep stand-up summary",
                    "File the monthly report",
                  ].map((task, index) => (
                    <div key={task} className="flex items-center gap-2">
                      <span
                        className={cn(
                          "grid size-3 shrink-0 place-items-center rounded-full",
                          index === 0
                            ? "bg-primary text-primary-fg"
                            : "border border-border-strong",
                        )}
                      >
                        {index === 0 ? (
                          <Check className="size-2" strokeWidth={4} />
                        ) : null}
                      </span>
                      <span
                        className={cn(
                          "truncate text-2xs",
                          index === 0
                            ? "text-text-subtle line-through"
                            : "text-text-muted",
                        )}
                      >
                        {task}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MockFrame>
  );
}

/** Feature-block mock: the work log editor. */
export function WorkLogMock() {
  return (
    <MockFrame label="A preview of the daily work log editor, with a meeting note card and an autosave indicator.">
      <MockTopBar />
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-text">Thursday, 12 September</p>
          <span className="text-2xs text-success">Saved</span>
        </div>
        {[
          {
            name: "Morning stand-up",
            body: "Picked up the retry job. Flagged the duplicate export to infra.",
          },
          {
            name: "Design review",
            body: "Agreed the empty state copy. Follow-up note filed under Notes.",
          },
        ].map((meeting) => (
          <div key={meeting.name} className="rounded-md border border-border p-2">
            <p className="text-2xs font-bold text-text">{meeting.name}</p>
            <p className="mt-1 text-2xs leading-4 text-text-muted">{meeting.body}</p>
          </div>
        ))}
        <div className="rounded-md border border-dashed border-border-strong p-2 text-center text-2xs text-text-subtle">
          + Add meeting
        </div>
      </div>
    </MockFrame>
  );
}

/** Feature-block mock: a ticket's append-only timeline. */
export function TicketMock() {
  return (
    <MockFrame label="A preview of a ticket timeline, showing one appended work update per day with the status at that time.">
      <MockTopBar />
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-medium text-text">ASU-1234</span>
          <span className="rounded-sm bg-status-progress-bg px-1.5 py-0.5 text-2xs font-semibold text-status-progress-fg">
            In Progress
          </span>
        </div>
        <p className="text-2xs font-bold text-text">
          Payment retry job drops receipts
        </p>
        <ol className="flex flex-col gap-2 border-l border-border pl-3">
          {[
            { day: "12 Sep", body: "Patched the retry window. Waiting on a rerun.", status: "In Progress" },
            { day: "10 Sep", body: "Reproduced against the staging queue.", status: "In Progress" },
            { day: "08 Sep", body: "Picked up from triage. Logged first findings.", status: "Open" },
          ].map((entry) => (
            <li key={entry.day} className="relative">
              <span
                aria-hidden="true"
                className="absolute top-1 -left-[1.0625rem] size-2 rounded-full bg-primary"
              />
              <p className="text-2xs font-semibold text-text">
                {entry.day}
                <span className="ml-2 font-normal text-text-subtle">
                  {entry.status}
                </span>
              </p>
              <p className="text-2xs leading-4 text-text-muted">{entry.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </MockFrame>
  );
}

/** Feature-block mock: tasks and notes side by side. */
export function TasksNotesMock() {
  return (
    <MockFrame label="A preview of the tasks and notes views, with due dates, priorities and tagged notes.">
      <MockTopBar />
      <div className="grid gap-2 p-3 md:grid-cols-2">
        <div className="rounded-md border border-border p-2">
          <p className="mb-1.5 text-2xs font-bold text-text">Tasks</p>
          {[
            { title: "Write release notes", meta: "Today", tone: "priority-high" },
            { title: "Reply on ASU-1234", meta: "Today", tone: "priority-urgent" },
            { title: "Book 1:1", meta: "Fri", tone: "priority-medium" },
            { title: "Archive old links", meta: "Next week", tone: "priority-low" },
          ].map((task) => (
            <div key={task.title} className="flex items-center gap-1.5 py-1">
              <span
                className={cn("size-1.5 shrink-0 rounded-full", {
                  "bg-priority-high": task.tone === "priority-high",
                  "bg-priority-urgent": task.tone === "priority-urgent",
                  "bg-priority-medium": task.tone === "priority-medium",
                  "bg-priority-low": task.tone === "priority-low",
                })}
              />
              <span className="min-w-0 flex-1 truncate text-2xs text-text-muted">
                {task.title}
              </span>
              <span className="shrink-0 text-2xs text-text-subtle">{task.meta}</span>
            </div>
          ))}
        </div>
        <div className="rounded-md border border-border p-2">
          <p className="mb-1.5 text-2xs font-bold text-text">Notes</p>
          {[
            { title: "Deploy checklist", tags: "ops · runbook" },
            { title: "Queue limits explained", tags: "infra" },
            { title: "Monthly report outline", tags: "reporting" },
            { title: "Onboarding shortcuts", tags: "reference" },
          ].map((note) => (
            <div key={note.title} className="py-1">
              <p className="truncate text-2xs font-semibold text-text">{note.title}</p>
              <p className="text-2xs text-text-subtle">{note.tags}</p>
            </div>
          ))}
        </div>
      </div>
    </MockFrame>
  );
}
