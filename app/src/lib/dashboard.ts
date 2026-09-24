import "server-only";

import { prisma } from "@/lib/prisma";
import { isWeekend } from "date-fns";

import { getSprint } from "@/lib/sprint";

/** UTC midnight of a Date's LOCAL calendar day — how work log dates are stored. */
function utcDayOf(date: Date) {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
}
import {
  WORKFLOW_STATUS_ORDER,
  normalizeTicketStatus,
  type WorkflowStatus,
} from "@/lib/workflow-status";

/**
 * Dashboard reads.
 *
 * Everything here is a COUNT or a short `take`, never a full table scan pulled
 * into memory to be counted in JS. The dashboard is the first screen of the day
 * and must stay cheap as the history grows.
 *
 * The one exception is the ticket stage tally: stored rows still carry legacy
 * statuses that `normalizeTicketStatus` folds into the five workflow stages, so
 * a SQL `groupBy` would tally the wrong buckets. It selects the status column
 * only — one small string per ticket.
 */

export async function getDashboard(userId: string, now: Date) {
  const today = utcDayOf(now);
  // `sprint` is the LOCAL window — that is what gets rendered. The query needs
  // UTC midnight of those same local calendar days, because that is how work
  // log dates are stored. `toDateOnly` reads UTC components, so feeding it a
  // local-midnight Date shifts it a day west of here; hence `utcDayOf`.
  const sprint = getSprint(now);
  const range = { start: utcDayOf(sprint.start), end: utcDayOf(sprint.end) };
  const todayKey = today.toISOString().slice(0, 10);

  const [
    todayLog,
    sprintLogs,
    sprintUpdates,
    ticketStatuses,
    openTracker,
    recentUpdates,
    noteCount,
    resourceCount,
  ] = await Promise.all([
    prisma.workLog.findFirst({
      where: { userId, date: today },
      select: {
        id: true,
        title: true,
        projectName: true,
        _count: { select: { ticketUpdates: true } },
        meetings: { select: { id: true, notes: true } },
      },
    }),

    // Dates only, then filtered to weekdays in JS. The Work Logs page shows
    // weekday logs only (`isWeekend` filter there), and a dashboard that
    // disagrees with the page it links to is worse than no dashboard. Postgres
    // has no timezone-safe day-of-week predicate for a `@db.Date` column here,
    // and a sprint is 14 rows at most, so the filter is cheap.
    prisma.workLog.findMany({
      where: { userId, date: { gte: range.start, lte: range.end } },
      select: { date: true },
    }),

    prisma.ticketWorkUpdate.findMany({
      where: { userId, workLog: { date: { gte: range.start, lte: range.end } } },
      select: { ticketId: true },
    }),

    prisma.ticket.findMany({ where: { userId }, select: { status: true } }),

    // Open tracker entries that carry a day, plus the undated pile. Notes are
    // excluded: they are reference, not something the day owes you.
    prisma.followUp.findMany({
      where: { userId, status: "Open", kind: { not: "Note" } },
      orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        kind: true,
        person: true,
        subject: true,
        dueDate: true,
      },
    }),

    prisma.ticketWorkUpdate.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        description: true,
        status: true,
        createdAt: true,
        ticket: { select: { ticketId: true, title: true } },
        workLog: { select: { id: true, date: true } },
      },
    }),

    prisma.note.count({ where: { userId, deletedAt: null } }),
    prisma.resource.count({ where: { userId } }),
  ]);

  const stageCounts = WORKFLOW_STATUS_ORDER.reduce(
    (acc, stage) => ({ ...acc, [stage]: 0 }),
    {} as Record<WorkflowStatus, number>,
  );
  for (const { status } of ticketStatuses) {
    stageCounts[normalizeTicketStatus(status)] += 1;
  }

  const overdue = openTracker.filter(
    (entry) => entry.dueDate && entry.dueDate.toISOString().slice(0, 10) < todayKey,
  );
  const dueToday = openTracker.filter(
    (entry) => entry.dueDate && entry.dueDate.toISOString().slice(0, 10) === todayKey,
  );

  return {
    today,
    sprint,
    todayLog: todayLog
      ? {
          id: todayLog.id,
          title: todayLog.title,
          projectName: todayLog.projectName,
          ticketUpdates: todayLog._count.ticketUpdates,
          meetingsTotal: todayLog.meetings.length,
          meetingsFilled: todayLog.meetings.filter((m) => m.notes.trim()).length,
        }
      : null,
    sprintLogCount: sprintLogs.filter((log) => !isWeekend(log.date)).length,
    sprintUpdateCount: sprintUpdates.length,
    sprintTicketCount: new Set(sprintUpdates.map((u) => u.ticketId)).size,
    stageCounts,
    ticketTotal: ticketStatuses.length,
    overdue,
    dueToday,
    undatedCount: openTracker.filter((entry) => !entry.dueDate).length,
    recentUpdates,
    noteCount,
    resourceCount,
  };
}

export type Dashboard = Awaited<ReturnType<typeof getDashboard>>;
