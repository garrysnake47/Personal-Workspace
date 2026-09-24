"use client";

import {
  AlarmClock,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  Hash,
  ListTodo,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  RotateCcw,
  StickyNote,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, formatDistanceToNowStrict, parseISO } from "date-fns";

import {
  addFollowUpUpdate,
  createFollowUp,
  deleteFollowUp,
  rescheduleFollowUp,
  setFollowUpStatus,
} from "@/actions/follow-ups";
import { cn } from "@/components/cn";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Field, FormError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
  /** "YYYY-MM-DD" or null. A plain calendar day — no time, no timezone. */
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  updates: TrackerUpdate[];
};

const KINDS = ["FollowUp", "Task", "Note"] as const satisfies readonly EntryKind[];

/**
 * Everything that differs between the three kinds lives here, so the form and
 * the cards stay one component instead of three near-copies.
 */
const KIND_META: Record<
  EntryKind,
  {
    label: string;
    Icon: typeof MessageSquare;
    tone: string;
    /** Is this addressed to a person? */
    needsPerson: boolean;
    /** Can it carry a date and therefore land in Today/Upcoming? */
    datable: boolean;
    subjectLabel: string;
    subjectPlaceholder: string;
    noteLabel: string;
    notePlaceholder: string;
    /** Heading above the appended record, inside an expanded card. */
    recordLabel: string;
  }
> = {
  FollowUp: {
    label: "Follow-up",
    Icon: MessageSquare,
    tone: "bg-primary text-primary-fg",
    needsPerson: true,
    datable: true,
    subjectLabel: "Subject",
    subjectPlaceholder: "Timebase notification fix",
    noteLabel: "What did you tell them?",
    notePlaceholder:
      "Told Ashwini on Slack that the fix is on staging, QA starts tomorrow.",
    recordLabel: "What I told them",
  },
  Task: {
    label: "Task",
    Icon: ListTodo,
    tone: "bg-status-waiting text-primary-fg",
    needsPerson: false,
    datable: true,
    subjectLabel: "Task",
    subjectPlaceholder: "Review the release checklist",
    noteLabel: "Any detail worth keeping",
    notePlaceholder: "Optional. Anything you would want to read back later.",
    recordLabel: "Progress",
  },
  Note: {
    label: "Note",
    Icon: StickyNote,
    tone: "bg-sidebar text-sidebar-fg",
    needsPerson: false,
    datable: false,
    subjectLabel: "Title",
    subjectPlaceholder: "Deploy steps for the worker",
    noteLabel: "Note",
    notePlaceholder: "Write it down before you lose it.",
    recordLabel: "Notes",
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

type Bucket = "overdue" | "today" | "upcoming" | "undated" | "notes";

const BUCKET_META: Record<
  Bucket,
  { title: string; blurb: string; accent: string; rule: string; head: string; dot: string; alwaysShow: boolean }
> = {
  overdue: {
    title: "Overdue",
    blurb: "The day you set has passed.",
    accent: "text-danger",
    rule: "border-l-danger",
    head: "bg-danger text-danger-fg",
    dot: "bg-danger",
    alwaysShow: false,
  },
  today: {
    title: "Today",
    blurb: "Due today.",
    accent: "text-accent-text",
    rule: "border-l-primary",
    head: "bg-primary text-primary-fg",
    dot: "bg-primary",
    alwaysShow: true,
  },
  upcoming: {
    title: "Upcoming",
    blurb: "Dated, not yet due.",
    accent: "text-text-muted",
    rule: "border-l-border-strong",
    head: "bg-sidebar text-sidebar-fg",
    dot: "bg-sidebar",
    alwaysShow: false,
  },
  undated: {
    title: "No date",
    blurb: "Open, with no day attached.",
    accent: "text-text-muted",
    rule: "border-l-border",
    head: "bg-card-navy text-accent-text",
    dot: "bg-border-strong",
    alwaysShow: true,
  },
  notes: {
    title: "Notes",
    blurb: "Kept for reference, not for doing.",
    accent: "text-text-muted",
    rule: "border-l-border",
    head: "bg-card-navy text-accent-text",
    dot: "bg-border-strong",
    alwaysShow: false,
  },
};

type Filter = "All" | EntryKind;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "All", label: "All" },
  { value: "FollowUp", label: "Follow-ups" },
  { value: "Task", label: "Tasks" },
  { value: "Note", label: "Notes" },
];

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
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerKind, setComposerKind] = useState<EntryKind>("FollowUp");
  const [filter, setFilter] = useState<Filter>("All");
  const today = useSyncExternalStore(subscribeNever, todayIso, () => serverToday);

  const groups = useMemo(() => {
    const next = {
      overdue: [] as TrackerEntry[],
      today: [] as TrackerEntry[],
      upcoming: [] as TrackerEntry[],
      undated: [] as TrackerEntry[],
      notes: [] as TrackerEntry[],
      done: [] as TrackerEntry[],
    };

    for (const entry of entries) {
      if (filter !== "All" && entry.kind !== filter) continue;

      if (entry.status === "Done") next.done.push(entry);
      else if (entry.kind === "Note") next.notes.push(entry);
      else if (!entry.dueDate) next.undated.push(entry);
      else if (entry.dueDate < today) next.overdue.push(entry);
      else if (entry.dueDate === today) next.today.push(entry);
      else next.upcoming.push(entry);
    }

    const byRecent = (a: TrackerEntry, b: TrackerEntry) =>
      b.updatedAt.localeCompare(a.updatedAt);
    next.undated.sort(byRecent);
    next.notes.sort(byRecent);
    next.done.sort((a, b) =>
      (b.completedAt ?? b.updatedAt).localeCompare(a.completedAt ?? a.updatedAt),
    );
    return next;
  }, [entries, today, filter]);

  const total =
    groups.overdue.length +
    groups.today.length +
    groups.upcoming.length +
    groups.undated.length +
    groups.notes.length;

  const openCount = entries.filter((entry) => entry.status !== "Done").length;

  function openComposer(kind: EntryKind) {
    setComposerKind(kind);
    setComposerOpen(true);
  }

  return (
    <div className="flex min-w-0 flex-col">
      <PageHeader
        title="Tracker"
        description="Follow-ups, tasks and notes in one place. Everything you record is appended, never rewritten — so months later you can still say what you told someone, and when."
        action={
          <Button
            onClick={() => setComposerOpen((open) => !open)}
            aria-expanded={composerOpen}
            aria-controls="tracker-composer"
          >
            <Plus aria-hidden="true" />
            Add entry
          </Button>
        }
      />

      {loadError ? <FormError>{loadError}</FormError> : null}

      {composerOpen ? (
        <TrackerComposer
          people={people}
          today={today}
          kind={composerKind}
          onKindChange={setComposerKind}
          onDone={() => setComposerOpen(false)}
        />
      ) : null}

      {entries.length === 0 ? (
        <EmptyBoard onStart={openComposer} />
      ) : (
        <>
          <section aria-label="At a glance" className="mb-6 grid grid-cols-2 overflow-hidden rounded-xl border border-border md:grid-cols-4">
            {(["overdue", "today", "upcoming", "undated"] as const).map((bucket, index) => {
              const meta = BUCKET_META[bucket];
              const count = groups[bucket].length;
              const alert = bucket === "overdue" && count > 0;
              return (
                <a
                  key={bucket}
                  href={`#tracker-${bucket}`}
                  className={cn(
                    "group relative flex min-w-0 flex-col gap-1 border-border px-5 pb-4 pt-5 transition-colors hover:bg-surface-2",
                    index % 2 === 1 && "border-l",
                    index >= 2 && "border-t md:border-t-0",
                    index === 2 && "md:border-l",
                  )}
                >
                  <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 h-1", meta.dot)} />
                  <span className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted group-hover:text-accent-text">{meta.title}</span>
                  <span className={cn("text-3xl font-bold leading-none tabular-nums", alert ? "text-danger" : "text-text")}>{count}</span>
                  <span className="truncate text-sm text-text-muted">{meta.blurb}</span>
                </a>
              );
            })}
          </section>

          <div role="tablist" aria-label="Filter by type" className="mb-6 flex flex-wrap items-end gap-1 border-b border-border">
            {FILTERS.map(({ value, label }) => {
              const selected = filter === value;
              const count = value === "All" ? openCount : entries.filter((entry) => entry.kind === value && entry.status !== "Done").length;
              return (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setFilter(value)}
                  className={cn(
                    "-mb-px flex h-11 cursor-pointer items-center gap-2 border-b-2 px-3 text-sm font-semibold",
                    "transition-colors duration-150 ease-standard",
                    selected ? "border-sidebar text-accent-text" : "border-transparent text-text-muted hover:border-border-strong hover:text-text",
                  )}
                >
                  {label}
                  <span className={cn("rounded-full px-1.5 py-0.5 text-2xs font-bold tabular-nums", selected ? "bg-sidebar text-sidebar-fg" : "bg-card-navy text-accent-text")}>{count}</span>
                </button>
              );
            })}
          </div>

          {total === 0 && groups.done.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border-strong bg-card px-6 py-12 text-center text-sm text-text-muted">
              Nothing of this type yet.
            </p>
          ) : (
            <div className="flex min-w-0 flex-col gap-7">
              <BucketSection bucket="overdue" items={groups.overdue} today={today} />
              <BucketSection bucket="today" items={groups.today} today={today} />
              <BucketSection bucket="upcoming" items={groups.upcoming} today={today} />
              <BucketSection bucket="undated" items={groups.undated} today={today} />
              <BucketSection bucket="notes" items={groups.notes} today={today} />

              {groups.done.length > 0 ? (
                <details className="motion-disclosure group min-w-0">
                  <summary className="flex w-fit cursor-pointer list-none items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm font-semibold text-accent-text transition-colors hover:border-primary hover:bg-primary-subtle [&::-webkit-details-marker]:hidden">
                    <Check className="size-4" aria-hidden="true" />
                    <span className="group-open:hidden">Show done</span>
                    <span className="hidden group-open:inline">Hide done</span>
                    <span className="rounded-full bg-status-completed px-2 py-0.5 text-xs text-primary-fg tabular-nums">{groups.done.length}</span>
                    <ChevronDown className="size-4 transition-transform duration-150 ease-standard group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="motion-disclosure-content mt-4 overflow-hidden rounded-xl border border-border">
                    <div className="flex items-center gap-2 bg-status-completed px-4 py-2.5 text-sm font-semibold text-primary-fg">Done</div>
                    <ul className="divide-y divide-border">
                      {groups.done.map((entry, index) => (
                        <li key={entry.id}>
                          <TrackerCard entry={entry} today={today} index={index} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BucketSection({
  bucket,
  items,
  today,
}: {
  bucket: Bucket;
  items: TrackerEntry[];
  today: string;
}) {
  const meta = BUCKET_META[bucket];

  // An empty Overdue pile is good news, not information — don't give it a
  // heading. Today and No date keep theirs so the page has a stable shape.
  if (items.length === 0 && !meta.alwaysShow) return null;

  return (
    <section
      id={`tracker-${bucket}-section`}
      aria-labelledby={`tracker-${bucket}`}
      className="scroll-reveal min-w-0 scroll-mt-24 overflow-hidden rounded-xl border border-border"
    >
      <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5", meta.head)}>
        <h2 id={`tracker-${bucket}`} className="scroll-mt-24 text-base font-semibold">{meta.title}</h2>
        <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-bold text-accent-text tabular-nums">{items.length}</span>
        <p className="min-w-0 text-sm opacity-90">{meta.blurb}</p>
      </div>

      {items.length === 0 ? (
        <p className="px-4 py-5 text-sm text-text-muted">Nothing here.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((entry, index) => (
            <li key={entry.id} className="min-w-0">
              <TrackerCard entry={entry} today={today} index={index} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TrackerCard({
  entry,
  today,
  index,
}: {
  entry: TrackerEntry;
  today: string;
  index: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);

  const kind = KIND_META[entry.kind];
  const latest = entry.updates[0];
  const isDone = entry.status === "Done";
  const overdue = !isDone && entry.dueDate !== null && entry.dueDate < today;

  function run(
    action: () => Promise<{ ok: boolean; error?: { message: string } }>,
    successMessage: string,
  ) {
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

  return (
    <details
      style={{ "--motion-index": index } as React.CSSProperties}
      className={cn(
        "motion-stagger scroll-reveal-item group min-w-0 bg-surface open:bg-surface-2",
        isDone && "opacity-70",
        pending && "pointer-events-none opacity-60",
      )}
    >
      <summary className="flex min-w-0 cursor-pointer list-none items-start gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full text-sm font-semibold",
            isDone ? "bg-status-completed text-primary-fg" : kind.tone,
          )}
        >
          {entry.person ? initials(entry.person) : <kind.Icon className="size-4" />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-md font-semibold text-text">
              {entry.subject}
            </span>
            <span
              className={cn(
                "inline-flex h-5 shrink-0 items-center rounded-full px-2 text-2xs font-semibold",
                kind.tone,
              )}
            >
              {kind.label}
            </span>
            {/* No longer settable from the composer; still rendered for
                entries created while the field existed. */}
            {entry.ticketKey ? (
              <span className="inline-flex h-5 shrink-0 items-center gap-0.5 rounded-full border border-border-strong px-2 font-mono text-2xs font-semibold text-accent-text">
                <Hash className="size-3" aria-hidden="true" />
                {entry.ticketKey}
              </span>
            ) : null}
          </div>

          <p className="mt-0.5 truncate text-sm text-text-muted">
            {entry.person ? (
              <span className="font-medium text-text">{entry.person}</span>
            ) : null}
            {latest ? (
              <>
                {entry.person ? " · " : ""}
                {entry.kind === "FollowUp"
                  ? `${CHANNEL_META[latest.channel].label} · `
                  : ""}
                {formatDistanceToNowStrict(parseISO(latest.occurredAt), {
                  addSuffix: true,
                })}
              </>
            ) : (
              `${entry.person ? " · " : ""}nothing recorded yet`
            )}
          </p>

          {latest ? (
            <p className="mt-1 line-clamp-1 text-sm text-text-muted">{latest.note}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {entry.dueDate ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-semibold whitespace-nowrap",
                overdue ? "border-danger bg-danger text-danger-fg" : "border-accent-text/35 bg-card-navy text-accent-text",
              )}
            >
              {overdue ? (
                <AlarmClock className="size-3" aria-hidden="true" />
              ) : (
                <CalendarClock className="size-3" aria-hidden="true" />
              )}
              {format(parseISO(entry.dueDate), "d MMM")}
            </span>
          ) : null}
          <span className="hidden text-xs font-medium whitespace-nowrap text-text-muted md:inline">
            {entry.updates.length}{" "}
            {entry.updates.length === 1 ? "entry" : "entries"}
          </span>
          <ChevronDown
            className="size-4 text-accent-text transition-transform duration-150 ease-standard group-open:rotate-180"
            aria-hidden="true"
          />
        </div>
      </summary>

      <div className="motion-disclosure-content border-t border-border px-4 pb-4 pt-3 md:pl-16">
        <h3 className="text-xs font-semibold tracking-[0.06em] text-accent-text uppercase">
          {kind.recordLabel}
        </h3>

        {entry.updates.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">
            Nothing recorded yet. Add the first entry below.
          </p>
        ) : (
          <ol className="relative mt-3 flex flex-col gap-4 border-l-2 border-border pl-5">
            {entry.updates.map((update) => {
              const channel = CHANNEL_META[update.channel];
              const Icon = entry.kind === "FollowUp" ? channel.Icon : kind.Icon;
              return (
                <li key={update.id} className="relative min-w-0">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[2.0625rem] top-0 grid size-6 place-items-center rounded-full border-2 border-surface bg-sidebar text-sidebar-fg"
                  >
                    <Icon className="size-3" />
                  </span>
                  <p className="flex flex-wrap items-center gap-x-2 text-xs font-semibold text-text">
                    <time dateTime={update.occurredAt}>
                      {format(parseISO(update.occurredAt), "EEE d MMM yyyy, HH:mm")}
                    </time>
                    {entry.kind === "FollowUp" ? <span className="rounded-full bg-card-navy px-2 py-0.5 text-2xs text-accent-text">{channel.label}</span> : null}
                  </p>
                  <p className="mt-1 text-sm whitespace-pre-wrap text-text">
                    {update.note}
                  </p>
                </li>
              );
            })}
          </ol>
        )}

        {adding ? (
          <AddUpdateForm entry={entry} onDone={() => setAdding(false)} />
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => setAdding(true)}>
              <Plus aria-hidden="true" />
              Add entry
            </Button>

            <Button
              size="sm"
              variant={isDone ? "secondary" : "subtle"}
              onClick={() =>
                run(
                  () =>
                    setFollowUpStatus({
                      followUpId: entry.id,
                      status: isDone ? "Open" : "Done",
                    }),
                  isDone ? "Reopened" : "Marked done",
                )
              }
            >
              {isDone ? (
                <>
                  <RotateCcw aria-hidden="true" />
                  Reopen
                </>
              ) : (
                <>
                  <Check aria-hidden="true" />
                  Mark done
                </>
              )}
            </Button>

            {kind.datable ? (
              <label className="ml-auto flex items-center gap-2 text-xs text-text-muted">
                <span className="whitespace-nowrap">
                  {entry.kind === "Task" ? "Due" : "Next nudge"}
                </span>
                <Input
                  type="date"
                  aria-label={`Date for ${entry.subject}`}
                  defaultValue={entry.dueDate ?? ""}
                  className="w-40"
                  onChange={(event) =>
                    run(
                      () =>
                        rescheduleFollowUp({
                          followUpId: entry.id,
                          dueDate: event.target.value || null,
                        }),
                      "Date updated",
                    )
                  }
                />
              </label>
            ) : null}

            <Button
              size="sm"
              variant="ghost"
              className={cn("text-danger hover:text-danger", !kind.datable && "ml-auto")}
              aria-label={`Delete ${entry.subject}`}
              onClick={() =>
                run(() => deleteFollowUp({ followUpId: entry.id }), "Deleted")
              }
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
    </details>
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
    <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
      <Field label={kind.noteLabel} htmlFor={`note-${entry.id}`} error={error}>
        <Textarea
          id={`note-${entry.id}`}
          rows={3}
          autoFocus
          value={note}
          placeholder={kind.notePlaceholder}
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

function TrackerComposer({
  people,
  today,
  kind,
  onKindChange,
  onDone,
}: {
  people: string[];
  today: string;
  kind: EntryKind;
  onKindChange: (kind: EntryKind) => void;
  onDone: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [person, setPerson] = useState("");
  const [subject, setSubject] = useState("");
  const [channel, setChannel] = useState<FollowUpChannel>("Slack");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
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

      toast.success(`${meta.label} saved`);
      onDone();
      router.refresh();
    });
  }

  return (
    <section
      id="tracker-composer"
      aria-labelledby="tracker-composer-heading"
      className="motion-disclosure-content mb-6 flex min-w-0 flex-col gap-4 rounded-lg border border-primary/40 bg-primary-subtle/40 p-4 md:p-5"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-md bg-surface-3 text-text-muted"
        >
          <meta.Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 id="tracker-composer-heading" className="text-lg font-semibold text-text">
            Add an entry
          </h2>
          <p className="text-xs text-text-muted">
            Pick what it is first — the form follows.
          </p>
        </div>
      </div>

      <FormError>{formError}</FormError>

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Type" htmlFor="tracker-kind">
          <Select
            id="tracker-kind"
            value={kind}
            onChange={(event) => {
              onKindChange(event.target.value as EntryKind);
              setFields({});
            }}
          >
            {KINDS.map((value) => (
              <option key={value} value={value}>
                {KIND_META[value].label}
              </option>
            ))}
          </Select>
        </Field>

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
        ) : (
          <div className="hidden md:block" aria-hidden="true" />
        )}

        <Field
          label={meta.subjectLabel}
          htmlFor="tracker-subject"
          required
          error={fields.subject}
        >
          <Input
            id="tracker-subject"
            value={subject}
            placeholder={meta.subjectPlaceholder}
            aria-invalid={fields.subject ? true : undefined}
            onChange={(event) => setSubject(event.target.value)}
          />
        </Field>

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
          <Field
            label={kind === "Task" ? "Due" : "Next nudge"}
            htmlFor="tracker-due"
            hint={
              kind === "Task"
                ? "Set today's date to put it in Today."
                : "Leave empty to just record it."
            }
            error={fields.dueDate}
          >
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

      <Field
        label={meta.noteLabel}
        htmlFor="tracker-note"
        hint="Recorded as the first entry. Later ones are appended, never overwritten."
        error={fields.note}
      >
        <Textarea
          id="tracker-note"
          rows={3}
          value={note}
          placeholder={meta.notePlaceholder}
          onChange={(event) => setNote(event.target.value)}
        />
      </Field>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="secondary" onClick={onDone} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={save} loading={pending}>
          <Check aria-hidden="true" />
          Save {meta.label.toLowerCase()}
        </Button>
      </div>
    </section>
  );
}

function EmptyBoard({ onStart }: { onStart: (kind: EntryKind) => void }) {
  return (
    <div className="scroll-reveal flex flex-col items-center gap-4 rounded-lg border border-dashed border-border-strong bg-card px-6 py-14 text-center">
      <span
        aria-hidden="true"
        className="grid size-11 place-items-center rounded-md bg-surface-3 text-text-muted"
      >
        <MessageSquare className="size-5" />
      </span>
      <div>
        <p className="text-md font-semibold text-text">Nothing tracked yet</p>
        <p className="mx-auto mt-1 max-w-[52ch] text-sm text-text-muted">
          Three things live here: what you told someone, what you owe, and what
          you want to keep. Start with whichever you have right now.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {KINDS.map((value) => {
          const meta = KIND_META[value];
          return (
            <Button
              key={value}
              variant={value === "FollowUp" ? "primary" : "secondary"}
              onClick={() => onStart(value)}
            >
              <meta.Icon aria-hidden="true" />
              {meta.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}
