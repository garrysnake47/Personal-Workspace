"use client";

import {
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Inbox,
  Lightbulb,
  ListTodo,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Star,
  StickyNote,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

import {
  addFollowUpUpdate,
  createFollowUp,
  deleteFollowUp,
  setFollowUpPinned,
  setFollowUpStatus,
} from "@/actions/follow-ups";
import { cn } from "@/components/cn";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Field, FormError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import type {
  EntryKind,
  FollowUpChannel,
  FollowUpStatus,
} from "@/generated/prisma/enums";

type TrackerUpdate = {
  id: string;
  note: string;
  channel: FollowUpChannel;
  occurredAt: string;
  createdAt: string;
};

type TrackerEntry = {
  id: string;
  kind: EntryKind;
  /** Only a follow-up is addressed to someone; tasks and notes are yours. */
  person: string | null;
  subject: string;
  ticketKey: string | null;
  status: FollowUpStatus;
  /** Flagged important — shown first. */
  pinned: boolean;
  /** "YYYY-MM-DD" or null. A plain calendar day — no time, no timezone. */
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  updates: TrackerUpdate[];
};

const KINDS = ["Note", "Idea", "Task", "FollowUp"] as const satisfies readonly EntryKind[];

/**
 * Everything that differs between the kinds lives here, so the form and the
 * rows stay one component instead of four near-copies.
 */
const KIND_META: Record<
  EntryKind,
  {
    label: string;
    plural: string;
    Icon: typeof MessageSquare;
    /** Is this addressed to a person? */
    needsPerson: boolean;
    /** Can it carry a date and therefore land in Today/Upcoming? */
    datable: boolean;
    subjectLabel: string;
    subjectPlaceholder: string;
    noteLabel: string;
    /** Heading above the appended record, inside the details popup. */
    recordLabel: string;
  }
> = {
  FollowUp: {
    label: "Follow-up",
    plural: "Follow-ups",
    Icon: MessageSquare,
    needsPerson: true,
    datable: true,
    subjectLabel: "Subject",
    subjectPlaceholder: "Timebase notification fix",
    noteLabel: "What did you tell them?",
    recordLabel: "What I told them",
  },
  Task: {
    label: "Task",
    plural: "Tasks",
    Icon: ListTodo,
    needsPerson: false,
    datable: true,
    subjectLabel: "Task",
    subjectPlaceholder: "Review the release checklist",
    noteLabel: "Any detail worth keeping",
    recordLabel: "Progress",
  },
  Note: {
    label: "Note",
    plural: "Notes",
    Icon: StickyNote,
    needsPerson: false,
    datable: false,
    subjectLabel: "Title",
    subjectPlaceholder: "Deploy steps for the worker",
    noteLabel: "Note",
    recordLabel: "Notes",
  },
  Idea: {
    label: "Idea",
    plural: "Ideas",
    Icon: Lightbulb,
    needsPerson: false,
    datable: false,
    subjectLabel: "Idea",
    subjectPlaceholder: "Auto-generate release notes from ticket updates",
    noteLabel: "Thoughts",
    recordLabel: "Thoughts",
  },
};

const CHANNELS = [
  "Slack",
  "Email",
  "Call",
  "Meeting",
  "Teams",
  "InPerson",
  "Other",
] as const satisfies readonly FollowUpChannel[];

const CHANNEL_META: Record<
  FollowUpChannel,
  { label: string; Icon: typeof MessageSquare }
> = {
  Slack: { label: "Slack", Icon: MessageSquare },
  Email: { label: "Email", Icon: Mail },
  Call: { label: "Call", Icon: Phone },
  Meeting: { label: "Meeting", Icon: CalendarDays },
  Teams: { label: "Teams", Icon: Users },
  InPerson: { label: "In person", Icon: Users },
  Other: { label: "Other", Icon: StickyNote },
};

/** List sections, top to bottom. Important items sort to the top of their section. */
type Group = "overdue" | "today" | "upcoming" | "undated" | "notes" | "done";

/** Each group is its own card, coloured by one tone (tokens in globals.css). */
const GROUPS: Record<Group, { title: string; hint: string; Icon: typeof MessageSquare; tone: string }> = {
  overdue: { title: "Overdue", hint: "Past their date", Icon: CircleAlert, tone: "var(--c-tk-overdue)" },
  today: { title: "Today", hint: "Due today", Icon: CalendarCheck2, tone: "var(--c-tk-today)" },
  upcoming: { title: "Upcoming", hint: "Coming up next", Icon: CalendarClock, tone: "var(--c-tk-upcoming)" },
  undated: { title: "No date", hint: "Open, whenever", Icon: Inbox, tone: "var(--c-tk-undated)" },
  notes: { title: "Notes & ideas", hint: "Kept for reference", Icon: StickyNote, tone: "var(--c-tk-notes)" },
  done: { title: "Done", hint: "Finished", Icon: CircleCheck, tone: "var(--c-tk-done)" },
};

/** A colour per type so rows are easy to tell apart at a glance. */
const KIND_TONE: Record<EntryKind, string> = {
  FollowUp: "var(--c-tk-followup)",
  Task: "var(--c-tk-task)",
  Note: "var(--c-tk-note)",
  Idea: "var(--c-tk-idea)",
};

/** Sets `--tone` for the tinted-chip / tinted-header recipes below. */
function tone(value: string) {
  return { "--tone": value } as React.CSSProperties;
}

/**
 * Tinted chip in one tone: a faint fill, no outline, so it stays quiet. The text
 * is the tone deepened with 20% ink so every tone clears 4.5:1 at 12px (the
 * pure red/amber/green tones alone land at ~4.1–4.4:1 on their own tint).
 */
const TINT_CHIP = "bg-[color-mix(in_srgb,var(--tone)_10%,var(--c-surface))] text-[color-mix(in_srgb,var(--tone)_80%,var(--c-text))]";

function todayIso() {
  // Local calendar day, not UTC: "today" means the user's today.
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 10);
}

/** The clock never notifies us; a re-render is close enough for a date. */
function subscribeNever() {
  return () => {};
}

function groupOf(entry: TrackerEntry, today: string): Group {
  if (entry.status === "Done") return "done";
  if (entry.kind === "Note" || entry.kind === "Idea") return "notes";
  if (!entry.dueDate) return "undated";
  if (entry.dueDate < today) return "overdue";
  if (entry.dueDate === today) return "today";
  return "upcoming";
}

/** The date as words: red when late, bold for today, muted otherwise. */
function DueText({ entry, today }: { entry: TrackerEntry; today: string }) {
  if (!entry.dueDate) return null;
  const late = entry.status !== "Done" && entry.dueDate < today;
  const isToday = entry.dueDate === today;
  return (
    <span className={cn(late ? "font-semibold text-danger" : isToday ? "font-semibold text-accent-text" : "")}>
      {isToday ? "Today" : format(parseISO(entry.dueDate), late ? "d MMM" : "EEE d MMM")}
    </span>
  );
}

/** The date as a chip: solid red when late, solid orange for today, teal tint otherwise. */
function DueChip({ entry, today, className }: { entry: TrackerEntry; today: string; className?: string }) {
  if (!entry.dueDate) return null;
  const late = entry.status !== "Done" && entry.dueDate < today;
  const isToday = entry.dueDate === today;
  return (
    <span
      style={tone("var(--c-tk-upcoming)")}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold tabular-nums",
        late ? "bg-tk-overdue text-tk-on shadow-sm" : isToday ? "bg-tk-today text-tk-on shadow-sm" : TINT_CHIP,
        className,
      )}
    >
      <CalendarDays className="size-3.5" aria-hidden="true" />
      {isToday ? "Today" : format(parseISO(entry.dueDate), "EEE d MMM")}
    </span>
  );
}

function KindChip({ kind }: { kind: EntryKind }) {
  const meta = KIND_META[kind];
  return (
    <span style={tone(KIND_TONE[kind])} className={cn("inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-bold", TINT_CHIP)}>
      <meta.Icon className="size-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export function TrackerBoard({
  entries,
  people,
  serverToday,
  loadError,
}: {
  entries: TrackerEntry[];
  people: string[];
  serverToday: string;
  loadError?: string;
}) {
  const [composerKind, setComposerKind] = useState<EntryKind | null>(null);
  const [kindFilter, setKindFilter] = useState<EntryKind | "All">("All");
  const [query, setQuery] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const today = useSyncExternalStore(subscribeNever, todayIso, () => serverToday);

  const needle = query.trim().toLowerCase();
  const groups = useMemo(() => {
    const next: Record<Group, TrackerEntry[]> = { overdue: [], today: [], upcoming: [], undated: [], notes: [], done: [] };
    for (const entry of entries) {
      if (kindFilter !== "All" && entry.kind !== kindFilter) continue;
      if (needle && ![entry.subject, entry.person, entry.ticketKey, ...entry.updates.map((u) => u.note)].join(" ").toLowerCase().includes(needle)) continue;
      next[groupOf(entry, today)].push(entry);
    }
    const important = (a: TrackerEntry, b: TrackerEntry) => Number(b.pinned) - Number(a.pinned);
    const byDue = (a: TrackerEntry, b: TrackerEntry) => important(a, b) || (a.dueDate ?? "").localeCompare(b.dueDate ?? "");
    const byRecent = (a: TrackerEntry, b: TrackerEntry) => important(a, b) || b.updatedAt.localeCompare(a.updatedAt);
    next.overdue.sort(byDue);
    next.today.sort(byRecent);
    next.upcoming.sort(byDue);
    next.undated.sort(byRecent);
    next.notes.sort(byRecent);
    next.done.sort((a, b) => (b.completedAt ?? b.updatedAt).localeCompare(a.completedAt ?? a.updatedAt));
    return next;
  }, [entries, today, kindFilter, needle]);

  // Tasks and follow-ups live on the left, notes and ideas on the right.
  const showTasks = kindFilter === "All" || kindFilter === "Task" || kindFilter === "FollowUp";
  const showNotes = kindFilter === "All" || kindFilter === "Note" || kindFilter === "Idea";
  const taskGroups = (["overdue", "today", "upcoming", "undated"] as const).filter((key) => groups[key].length > 0);
  const opened = entries.find((entry) => entry.id === openId) ?? null;
  const openCount = (value: EntryKind | "All") => entries.filter((entry) => entry.status !== "Done" && (value === "All" || entry.kind === value)).length;
  const doneCount = entries.filter((entry) => entry.status === "Done").length;
  const open = (entry: TrackerEntry) => setOpenId(entry.id);

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-6">
      <PageHeader
        className="mb-0"
        title="Tracker"
        description="Notes, ideas, tasks and follow-ups — all in one place."
        action={
          <Button onClick={() => setComposerKind("Task")}>
            <Plus aria-hidden="true" />
            Detailed entry
          </Button>
        }
      />

      {loadError ? <FormError>{loadError}</FormError> : null}

      <QuickCapture people={people} />

      {entries.length === 0 ? (
        <EmptyBoard onStart={setComposerKind} />
      ) : (
        <>
          {/* Toolbar: type pills on the left, search + done on the right. */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div role="tablist" aria-label="Filter by type" className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
              {(["All", ...KINDS] as const).map((value) => {
                const active = kindFilter === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setKindFilter(value)}
                    className={cn(
                      "inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-150",
                      active ? "border-sidebar bg-sidebar text-sidebar-fg" : "border-border bg-surface text-text hover:border-border-strong hover:bg-surface-2",
                    )}
                  >
                    {value === "All" ? "All" : KIND_META[value].plural}
                    <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-sidebar-accent-bg text-sidebar-fg" : "bg-surface-3 text-text")}>{openCount(value)}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 md:ml-auto">
              <div className="min-w-0 flex-1 md:w-64 md:flex-none">
                <label htmlFor="tracker-search" className="sr-only">Search the tracker</label>
                <Input id="tracker-search" value={query} placeholder="Search" startIcon={<Search />} onChange={(event) => setQuery(event.target.value)} />
              </div>
              <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm font-semibold text-text">
                <button
                  type="button"
                  role="switch"
                  aria-checked={showDone}
                  onClick={() => setShowDone((value) => !value)}
                  className={cn("relative h-6 w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-150", showDone ? "bg-sidebar" : "bg-border")}
                >
                  <span className={cn("absolute top-1 size-4 rounded-full bg-surface shadow-sm transition-[left] duration-150", showDone ? "left-5" : "left-1")} aria-hidden="true" />
                </button>
                Show done <span className="text-xs font-medium text-text-subtle tabular-nums">{doneCount}</span>
              </label>
            </div>
          </div>

          <div className={cn("grid items-start gap-6", showTasks && showNotes && "lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_26rem]")}>
            {showTasks ? (
              <div className="flex min-w-0 flex-col gap-5">
                {taskGroups.length === 0 ? (
                  <div className="wl-card flex flex-col items-center gap-2 px-6 py-12 text-center">
                    <CircleCheck className="size-6 text-status-completed" aria-hidden="true" />
                    <p className="text-md font-semibold text-text">{needle ? "Nothing matches" : "All clear"}</p>
                    <p className="text-sm text-text-muted">{needle ? "Try a different word." : "No open tasks or follow-ups."}</p>
                  </div>
                ) : (
                  taskGroups.map((key) => (
                    <GroupCard key={key} group={key} count={groups[key].length}>
                      <ul className="divide-y divide-border">
                        {groups[key].map((entry) => <EntryRow key={entry.id} entry={entry} today={today} onOpen={() => open(entry)} />)}
                      </ul>
                    </GroupCard>
                  ))
                )}
              </div>
            ) : null}

            {showNotes ? (
              <GroupCard group="notes" count={groups.notes.length}>
                {groups.notes.length === 0 ? (
                  <p className="px-5 py-8 text-center text-sm text-text-muted">{needle ? "Nothing matches." : "No notes or ideas yet."}</p>
                ) : (
                  <ul className={cn("grid gap-2.5 bg-surface-2 p-3", !showTasks && "md:grid-cols-2 xl:grid-cols-3")}>
                    {groups.notes.map((entry) => <NoteCard key={entry.id} entry={entry} onOpen={() => open(entry)} />)}
                  </ul>
                )}
              </GroupCard>
            ) : null}
          </div>

          {showDone && groups.done.length > 0 ? (
            <GroupCard group="done" count={groups.done.length}>
              <ul className="divide-y divide-border">
                {groups.done.map((entry) => <EntryRow key={entry.id} entry={entry} today={today} onOpen={() => open(entry)} />)}
              </ul>
            </GroupCard>
          ) : null}
        </>
      )}

      {opened ? <EntryModal key={opened.id} entry={opened} today={today} onClose={() => setOpenId(null)} /> : null}
      {composerKind ? (
        <ComposerModal people={people} today={today} kind={composerKind} onKindChange={setComposerKind} onClose={() => setComposerKind(null)} />
      ) : null}
    </div>
  );
}

/**
 * A group of entries as its own card. The card and header stay neutral (white,
 * palette border); the group's tone lives only on the solid icon tile, so the
 * colour reads as a label instead of washing the whole card in a pastel.
 */
function GroupCard({ group, count, className, children }: { group: Group; count: number; className?: string; children: React.ReactNode }) {
  const meta = GROUPS[group];
  return (
    <section
      aria-labelledby={`tracker-group-${group}`}
      style={tone(meta.tone)}
      className={cn("wl-card overflow-hidden", className)}
    >
      <header className="flex items-center gap-3 border-b border-border px-4 py-3 md:px-5">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--tone)] text-tk-on shadow-sm" aria-hidden="true">
          <meta.Icon className="size-[1.125rem]" />
        </span>
        <div className="min-w-0">
          <h2 id={`tracker-group-${group}`} className="text-lg font-semibold leading-tight text-text">{meta.title}</h2>
          <p className="text-xs font-medium text-text-subtle">{meta.hint}</p>
        </div>
        <span className="ml-auto grid h-7 min-w-7 place-items-center rounded-full bg-surface-2 px-2 text-sm font-semibold text-text tabular-nums">{count}</span>
      </header>
      {children}
    </section>
  );
}

/** A note or idea: a small card with its latest line of thought. */
function NoteCard({ entry, onOpen }: { entry: TrackerEntry; onOpen: () => void }) {
  const latest = entry.updates[0];
  const isDone = entry.status === "Done";
  return (
    <li className="group relative flex flex-col gap-2 rounded-xl border border-border bg-surface p-3.5 shadow-xs transition-[border-color,box-shadow] duration-150 hover:border-border-strong hover:shadow-md">
      <div className="flex items-center gap-2">
        <KindChip kind={entry.kind} />
        {entry.pinned ? <Star className="ml-auto size-4 fill-current text-warning" aria-label="Important" /> : null}
      </div>
      <button
        type="button"
        onClick={onOpen}
        className={cn("cursor-pointer text-left text-md font-semibold leading-snug after:absolute after:inset-0 after:rounded-[inherit]", isDone ? "text-text-subtle line-through" : "text-text group-hover:text-accent-text")}
      >
        {entry.subject}
      </button>
      {latest ? <p className="line-clamp-2 text-sm leading-relaxed text-text-muted">{latest.note}</p> : null}
      <p className="text-xs text-text-subtle">Updated {format(parseISO(entry.updatedAt), "d MMM")}</p>
    </li>
  );
}

/**
 * The fastest path in: pick a type, type one line, press Enter. A follow-up
 * asks who; a task or follow-up can take a date. Details can be added later.
 */
function QuickCapture({ people }: { people: string[] }) {
  const router = useRouter();
  const [kind, setKind] = useState<EntryKind>("Note");
  const [subject, setSubject] = useState("");
  const [person, setPerson] = useState("");
  const [date, setDate] = useState("");
  const [important, setImportant] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const meta = KIND_META[kind];

  function save() {
    const text = subject.trim();
    if (!text || pending) return;
    if (meta.needsPerson && !person.trim()) { setError("Who is this follow-up with?"); return; }
    startTransition(async () => {
      const result = await createFollowUp({
        kind,
        subject: text.slice(0, 300),
        person: meta.needsPerson ? person.trim() : undefined,
        dueDate: meta.datable && date ? date : null,
      });
      if (!result.ok) { setError(result.error.message); return; }
      if (important) await setFollowUpPinned({ followUpId: result.data.id, pinned: true });
      toast.success(`${meta.label} saved`);
      setSubject("");
      setPerson("");
      setDate("");
      setImportant(false);
      setError(undefined);
      router.refresh();
    });
  }

  return (
    <section aria-label="Quick capture" className="wl-card flex flex-col gap-3 p-3 md:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <KindPicker value={kind} onChange={(value) => { setKind(value); setError(undefined); }} label="What is it?" />
        <label htmlFor="quick-capture" className="sr-only">New {meta.label.toLowerCase()}</label>
        <Input
          id="quick-capture"
          value={subject}
          maxLength={300}
          placeholder={`Add a ${meta.label.toLowerCase()} — press Enter to save`}
          aria-invalid={error ? true : undefined}
          className="min-w-0 flex-1"
          onChange={(event) => { setSubject(event.target.value); setError(undefined); }}
          onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); save(); } }}
        />
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-pressed={important}
            aria-label="Mark important"
            title="Mark important"
            onClick={() => setImportant((value) => !value)}
            className={cn("grid size-10 cursor-pointer place-items-center rounded-lg border transition-colors duration-150", important ? "border-warning text-warning" : "border-border text-text-subtle hover:border-border-strong hover:text-text")}
          >
            <Star className={cn("size-4", important && "fill-current")} aria-hidden="true" />
          </button>
          <Button onClick={save} loading={pending} disabled={!subject.trim()} className="max-md:flex-1">
            Save
          </Button>
        </div>
      </div>

      {meta.needsPerson || meta.datable ? (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {meta.needsPerson ? (
            <label className="flex items-center gap-2 text-sm text-text-muted">
              Who
              <Input id="quick-capture-person" value={person} list="quick-capture-people" className="w-48" onChange={(event) => { setPerson(event.target.value); setError(undefined); }} />
              <datalist id="quick-capture-people">{people.map((name) => <option key={name} value={name} />)}</datalist>
            </label>
          ) : null}
          {meta.datable ? (
            <label className="flex items-center gap-2 text-sm text-text-muted">
              {kind === "Task" ? "Due" : "Next nudge"}
              <Input id="quick-capture-date" type="date" value={date} className="w-44" onChange={(event) => setDate(event.target.value)} />
            </label>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="text-sm font-medium text-danger" role="alert">{error}</p> : null}
    </section>
  );
}

/** Segmented type picker shared by quick capture and the detailed entry popup. */
function KindPicker({ value, onChange, label }: { value: EntryKind; onChange: (kind: EntryKind) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex shrink-0 gap-1 rounded-lg border border-border bg-surface-2 p-0.5">
      {KINDS.map((kind) => {
        const item = KIND_META[kind];
        const active = value === kind;
        return (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(kind)}
            className={cn(
              "flex h-9 flex-auto cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-2 text-sm font-semibold md:px-3 transition-colors duration-150",
              active ? "bg-sidebar text-sidebar-fg shadow-sm" : "text-text-muted hover:bg-surface-3 hover:text-text",
            )}
          >
            <item.Icon className="size-4 shrink-0 max-md:hidden" aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** A round checkbox that marks an entry done / open without opening it. */
function DoneToggle({ entry }: { entry: TrackerEntry }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const done = entry.status === "Done";
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={done ? `Reopen ${entry.subject}` : `Mark ${entry.subject} done`}
      disabled={pending}
      onClick={() => startTransition(async () => {
        const result = await setFollowUpStatus({ followUpId: entry.id, status: done ? "Open" : "Done" });
        if (!result.ok) { toast.error(result.error.message); return; }
        toast.success(done ? "Reopened" : "Marked done");
        router.refresh();
      })}
      className={cn(
        "relative z-10 grid size-5 shrink-0 cursor-pointer place-items-center rounded-full border-2 transition-colors duration-150 disabled:cursor-wait disabled:opacity-60",
        done ? "border-primary bg-primary text-primary-fg" : "border-border-strong text-transparent hover:border-primary hover:text-primary",
      )}
    >
      <Check className="size-3" strokeWidth={3} aria-hidden="true" />
    </button>
  );
}

/** One entry. The whole row opens the details popup; the circle finishes it. */
function EntryRow({ entry, today, onOpen }: { entry: TrackerEntry; today: string; onOpen: () => void }) {
  const isDone = entry.status === "Done";
  const records = entry.updates.length;
  return (
    <li className="group relative flex items-start gap-3.5 px-4 py-3.5 transition-colors duration-150 hover:bg-surface-2 md:items-center md:px-5">
      <span className="pt-0.5 md:pt-0"><DoneToggle entry={entry} /></span>

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={onOpen}
          className={cn(
            "flex w-full cursor-pointer items-center gap-2 text-left text-md font-semibold leading-snug after:absolute after:inset-0",
            isDone ? "text-text-subtle line-through" : "text-text group-hover:text-accent-text",
          )}
        >
          <span className="min-w-0">{entry.subject}</span>
          {entry.pinned ? <Star className="size-4 shrink-0 fill-current text-warning" aria-label="Important" /> : null}
        </button>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-text-muted">
          <KindChip kind={entry.kind} />
          {entry.person ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-text">
              <Users className="size-3.5 text-text-subtle" aria-hidden="true" />
              {entry.person}
            </span>
          ) : null}
          {records ? (
            <span className="inline-flex items-center gap-1.5">
              <MessageSquare className="size-3.5 text-text-subtle" aria-hidden="true" />
              {records} {records === 1 ? "record" : "records"}
            </span>
          ) : null}
          <DueChip entry={entry} today={today} className="md:hidden" />
        </div>
      </div>

      <DueChip entry={entry} today={today} className="hidden md:inline-flex" />
      <ChevronRight className="hidden size-5 shrink-0 text-text-subtle transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-text md:block" aria-hidden="true" />
    </li>
  );
}

/** One entry's details, in a popup. */
function EntryModal({ entry, today, onClose }: { entry: TrackerEntry; today: string; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const kind = KIND_META[entry.kind];
  const isDone = entry.status === "Done";

  function run(action: () => Promise<{ ok: boolean; error?: { message: string } }>, successMessage: string) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error?.message ?? "Something went wrong");
        return;
      }
      toast.success(successMessage);
      router.refresh();
    });
  }

  const facts: Array<{ label: string; value: React.ReactNode }> = [
    { label: "Status", value: isDone ? `Done${entry.completedAt ? ` · ${format(parseISO(entry.completedAt), "d MMM")}` : ""}` : "Open" },
    ...(entry.person ? [{ label: "With", value: entry.person }] : []),
    ...(entry.dueDate ? [{ label: entry.kind === "Task" ? "Due" : "Next nudge", value: <DueText entry={entry} today={today} /> }] : []),
    ...(entry.ticketKey ? [{ label: "Ticket", value: <span className="font-mono">{entry.ticketKey}</span> }] : []),
    { label: "Added", value: format(parseISO(entry.createdAt), "d MMM yyyy") },
  ];

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      eyebrow={
        <span className="flex items-center gap-1.5">
          <kind.Icon className="size-4" aria-hidden="true" />
          {kind.label}
          {entry.pinned ? <><span aria-hidden="true">·</span><Star className="size-3.5 fill-current text-warning" aria-hidden="true" />Important</> : null}
        </span>
      }
      title={<span className={cn(isDone && "text-text-muted line-through")}>{entry.subject}</span>}
    >
      <div className={cn("flex flex-col gap-6", pending && "opacity-60")}>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-5">
          {facts.map((fact) => (
            <div key={fact.label} className="min-w-0">
              <dt className="text-xs text-text-subtle">{fact.label}</dt>
              <dd className="mt-1 truncate text-sm font-medium text-text">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-center gap-2">
          {isDone ? (
            <Button size="sm" variant="secondary" onClick={() => run(() => setFollowUpStatus({ followUpId: entry.id, status: "Open" }), "Reopened")}>
              <RotateCcw aria-hidden="true" />
              Reopen
            </Button>
          ) : (
            <Button size="sm" onClick={() => run(() => setFollowUpStatus({ followUpId: entry.id, status: "Done" }), "Marked done")}>
              <Check aria-hidden="true" />
              Mark done
            </Button>
          )}
          <Button size="sm" variant="secondary" onClick={() => setAdding(true)} disabled={adding}>
            <Plus aria-hidden="true" />
            Add entry
          </Button>
          <div className="ml-auto flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              iconOnly
              aria-pressed={entry.pinned}
              aria-label={entry.pinned ? "Remove from important" : "Mark important"}
              title={entry.pinned ? "Remove from important" : "Mark important"}
              onClick={() => run(() => setFollowUpPinned({ followUpId: entry.id, pinned: !entry.pinned }), entry.pinned ? "Removed from important" : "Marked important")}
            >
              <Star aria-hidden="true" className={cn(entry.pinned && "fill-current text-warning")} />
            </Button>
            <Button size="sm" variant="ghost" iconOnly className="hover:text-danger" aria-label={`Delete ${entry.subject}`} title="Delete" onClick={() => setConfirmDelete(true)}>
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        </div>

        {adding ? <AddUpdateForm entry={entry} onDone={() => setAdding(false)} /> : null}

        {/* History */}
        <section aria-label={kind.recordLabel} className="border-t border-border pt-5">
          <h3 className="text-sm font-semibold text-text">
            {kind.recordLabel} <span className="font-normal text-text-subtle tabular-nums">· {entry.updates.length}</span>
          </h3>
          {entry.updates.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted">Nothing recorded yet. Use “Add entry” to write the first one.</p>
          ) : (
            <ol className="mt-4 flex flex-col">
              {entry.updates.map((update, index) => {
                const channel = CHANNEL_META[update.channel];
                return (
                  <li key={update.id} className="relative flex gap-4 pb-5 last:pb-0">
                    {index < entry.updates.length - 1 ? <span aria-hidden="true" className="absolute left-[0.3125rem] top-4 bottom-0 w-px bg-border" /> : null}
                    <span aria-hidden="true" className="relative mt-1.5 size-2.5 shrink-0 rounded-full bg-sidebar" />
                    <div className="min-w-0">
                      <p className="text-xs text-text-muted">
                        <time dateTime={update.occurredAt} className="font-medium text-text">{format(parseISO(update.occurredAt), "EEE d MMM yyyy, HH:mm")}</time>
                        {entry.kind === "FollowUp" ? ` · via ${channel.label}` : ""}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-md leading-6 text-text">{update.note}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>

      <ConfirmationDialog
        open={confirmDelete}
        title={`Delete “${entry.subject}”?`}
        description="This removes the entry and everything recorded on it. It can't be undone."
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          onClose();
          run(() => deleteFollowUp({ followUpId: entry.id }), "Deleted");
        }}
      />
    </Modal>
  );
}

function AddUpdateForm({
  entry,
  onDone,
}: {
  entry: TrackerEntry;
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [channel, setChannel] = useState<FollowUpChannel>(
    entry.kind === "FollowUp" ? "Slack" : "Other",
  );
  const [error, setError] = useState<string>();
  const kind = KIND_META[entry.kind];

  function save() {
    startTransition(async () => {
      const result = await addFollowUpUpdate({
        followUpId: entry.id,
        note,
        channel,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      toast.success("Recorded");
      setNote("");
      onDone();
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-2 p-4">
      <Field label={kind.noteLabel} htmlFor={`note-${entry.id}`} error={error}>
        <Textarea
          id={`note-${entry.id}`}
          rows={3}
          autoFocus
          value={note}
          aria-invalid={error ? true : undefined}
          onChange={(event) => {
            setNote(event.target.value);
            setError(undefined);
          }}
        />
      </Field>

      <div className="flex flex-wrap items-end gap-3">
        {/* Where you said it only means something for a follow-up. */}
        {entry.kind === "FollowUp" ? (
          <Field label="Where" htmlFor={`channel-${entry.id}`} className="w-44">
            <Select
              id={`channel-${entry.id}`}
              value={channel}
              onChange={(event) => setChannel(event.target.value as FollowUpChannel)}
            >
              {CHANNELS.map((value) => (
                <option key={value} value={value}>
                  {CHANNEL_META[value].label}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onDone} disabled={pending}>
            Cancel
          </Button>
          <Button size="sm" onClick={save} loading={pending}>
            <Check aria-hidden="true" />
            Record it
          </Button>
        </div>
      </div>
    </div>
  );
}

/** The full form — type, who, subject, where, date and a first note — in a popup. */
function ComposerModal({
  people,
  today,
  kind,
  onKindChange,
  onClose,
}: {
  people: string[];
  today: string;
  kind: EntryKind;
  onKindChange: (kind: EntryKind) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [person, setPerson] = useState("");
  const [subject, setSubject] = useState("");
  const [channel, setChannel] = useState<FollowUpChannel>("Slack");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [important, setImportant] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>();

  const meta = KIND_META[kind];

  function save() {
    startTransition(async () => {
      const result = await createFollowUp({
        kind,
        person: meta.needsPerson ? person : undefined,
        subject,
        // A note has no day; sending one would be rejected by the schema.
        dueDate: meta.datable ? dueDate || null : null,
        note,
        channel: kind === "FollowUp" ? channel : "Other",
      });

      if (!result.ok) {
        setFields(result.error.fields ?? {});
        setFormError(result.error.fields ? undefined : result.error.message);
        return;
      }
      if (important) await setFollowUpPinned({ followUpId: result.data.id, pinned: true });

      toast.success(`${meta.label} saved`);
      onClose();
      router.refresh();
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="New entry"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={save} loading={pending}>
            <Check aria-hidden="true" />
            Save {meta.label.toLowerCase()}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <FormError>{formError}</FormError>

        <KindPicker value={kind} onChange={(value) => { onKindChange(value); setFields({}); }} label="Type" />

        <Field label={meta.subjectLabel} htmlFor="tracker-subject" required error={fields.subject}>
          <Input
            id="tracker-subject"
            value={subject}
            autoFocus
            placeholder={meta.subjectPlaceholder}
            aria-invalid={fields.subject ? true : undefined}
            onChange={(event) => setSubject(event.target.value)}
          />
        </Field>

        {meta.needsPerson || meta.datable ? (
          <div className="grid gap-5 md:grid-cols-2">
            {meta.needsPerson ? (
              <Field label="Person" htmlFor="tracker-person" required error={fields.person}>
                <Input
                  id="tracker-person"
                  list="tracker-people"
                  value={person}
                  placeholder="Ashwini"
                  aria-invalid={fields.person ? true : undefined}
                  onChange={(event) => setPerson(event.target.value)}
                />
                <datalist id="tracker-people">
                  {people.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </Field>
            ) : null}

            {kind === "FollowUp" ? (
              <Field label="Where" htmlFor="tracker-channel">
                <Select
                  id="tracker-channel"
                  value={channel}
                  onChange={(event) => setChannel(event.target.value as FollowUpChannel)}
                >
                  {CHANNELS.map((value) => (
                    <option key={value} value={value}>
                      {CHANNEL_META[value].label}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : null}

            {meta.datable ? (
              <Field label={kind === "Task" ? "Due" : "Next nudge"} htmlFor="tracker-due" error={fields.dueDate}>
                <Input
                  id="tracker-due"
                  type="date"
                  min={kind === "Task" ? undefined : today}
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </Field>
            ) : null}
          </div>
        ) : null}

        <Field
          label={meta.noteLabel}
          htmlFor="tracker-note"
          hint="Saved as the first record. Later ones are added below it, never overwritten."
          error={fields.note}
        >
          <Textarea
            id="tracker-note"
            rows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </Field>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-text">
          <input
            type="checkbox"
            checked={important}
            onChange={(event) => setImportant(event.target.checked)}
            className="size-4 cursor-pointer accent-[var(--c-warning)]"
          />
          <Star className={cn("size-4", important ? "fill-current text-warning" : "text-text-subtle")} aria-hidden="true" />
          Mark as important
        </label>
      </div>
    </Modal>
  );
}

function EmptyBoard({ onStart }: { onStart: (kind: EntryKind) => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border-strong bg-card px-6 py-14 text-center">
      <span
        aria-hidden="true"
        className="grid size-11 place-items-center rounded-md bg-surface-3 text-text-muted"
      >
        <MessageSquare className="size-5" />
      </span>
      <div>
        <p className="text-md font-semibold text-text">Nothing tracked yet</p>
        <p className="mx-auto mt-1 max-w-[52ch] text-sm text-text-muted">
          Jot down anything — a note, an idea, a task, or what you told someone.
          Use the box above, or start a detailed entry.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {KINDS.map((value) => {
          const meta = KIND_META[value];
          return (
            <Button key={value} variant="secondary" onClick={() => onStart(value)}>
              <meta.Icon aria-hidden="true" />
              {meta.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
