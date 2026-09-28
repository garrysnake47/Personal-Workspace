import "server-only";

import { DEFAULT_TITLE, type DayType } from "@/components/work-log/day-type";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { TicketStatus as StoredTicketStatus } from "@/generated/prisma/enums";
import {
  normalizeTicketStatus,
  type WorkflowStatus,
} from "@/lib/workflow-status";

/**
 * Work log data access.
 *
 * Every function here takes an explicit `userId` and puts it in the WHERE
 * clause. Callers get that id from `requireUser()` — never from the client.
 */

/** Spec section 5: every new work log starts with these four cards. */
export const DEFAULT_MEETINGS = [
  "ASU Sync-up",
  "Veritech Sync-up",
  "Client Sync-up",
  "Others",
] as const;

/** Today at UTC midnight — the canonical storage form for WorkLog.date. */
export function todayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
  );
}

/** Normalise any Date to UTC midnight so `@@unique([userId, date])` behaves. */
export function toDateOnly(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function formatDateKey(date: Date): string {
  return toDateOnly(date).toISOString().slice(0, 10);
}

/** Everything the work log editor needs in one round trip. */
export const workLogInclude = {
  meetings: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
  ticketUpdates: {
    orderBy: { createdAt: "asc" },
    include: { ticket: true },
  },
  // Never `data` here — file bytes are only read by the download route.
  attachments: {
    orderBy: { createdAt: "asc" },
    select: { id: true, kind: true, name: true, url: true, mimeType: true, size: true, createdAt: true },
  },
} satisfies Prisma.WorkLogInclude;

export type WorkLogWithRelations = Awaited<
  ReturnType<typeof getWorkLogById>
>;

/**
 * Today's work log (or a historical one), creating it with the four default
 * meeting cards if it does not exist.
 *
 * Safe against two concurrent callers: the unique (userId, date) index means
 * the loser of the race gets P2002 and we simply re-read the winner's row.
 */
export async function getOrCreateWorkLog(
  userId: string,
  date: Date = todayUtc(),
  title?: string,
  dayType: DayType = "Work",
) {
  const day = toDateOnly(date);

  const existing = await prisma.workLog.findFirst({
    where: { userId, date: day },
    include: workLogInclude,
  });
  if (existing) return normalizeWorkLogStatuses(existing);

  try {
    const created = await prisma.workLog.create({
      data: {
        userId,
        date: day,
        title: title?.trim() || DEFAULT_TITLE[dayType],
        dayType,
        meetings: {
          create: DEFAULT_MEETINGS.map((name, order) => ({
            name,
            notes: "",
            order,
            isDefault: true,
          })),
        },
      },
      include: workLogInclude,
    });
    return normalizeWorkLogStatuses(created);
  } catch (error) {
    // Lost a create race — the row exists now, so read it.
    const raced = await prisma.workLog.findFirst({
      where: { userId, date: day },
      include: workLogInclude,
    });
    if (raced) return normalizeWorkLogStatuses(raced);
    throw error;
  }
}

export function getOrCreateTodayWorkLog(userId: string) {
  return getOrCreateWorkLog(userId, todayUtc());
}

/** Read one work log. Returns null if it isn't this user's. */
export async function getWorkLogById(userId: string, workLogId: string) {
  const workLog = await prisma.workLog.findFirst({
    where: { id: workLogId, userId },
    include: workLogInclude,
  });
  return workLog ? normalizeWorkLogStatuses(workLog) : null;
}

export async function getWorkLogByDate(userId: string, date: Date) {
  const workLog = await prisma.workLog.findFirst({
    where: { userId, date: toDateOnly(date) },
    include: workLogInclude,
  });
  return workLog ? normalizeWorkLogStatuses(workLog) : null;
}

export type ListWorkLogsOptions = {
  search?: string;
  from?: Date;
  to?: Date;
  /** Filter to logs that touched this Ticket.id. */
  ticketId?: string;
  take?: number;
  skip?: number;
};

/** Listing page: newest first, with counts. */
export async function listWorkLogs(
  userId: string,
  options: ListWorkLogsOptions = {},
) {
  const { search, from, to, ticketId, take = 50, skip = 0 } = options;

  const where = {
    userId,
    ...(from || to
      ? {
          date: {
            ...(from ? { gte: toDateOnly(from) } : {}),
            ...(to ? { lte: toDateOnly(to) } : {}),
          },
        }
      : {}),
    ...(ticketId ? { ticketUpdates: { some: { ticketId, userId } } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            {
              meetings: {
                some: {
                  notes: { contains: search, mode: "insensitive" as const },
                },
              },
            },
            {
              ticketUpdates: {
                some: {
                  userId,
                  OR: [
                    {
                      description: {
                        contains: search,
                        mode: "insensitive" as const,
                      },
                    },
                    {
                      ticket: {
                        ticketId: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                    },
                  ],
                },
              },
            },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.workLog.findMany({
      where,
      orderBy: { date: "desc" },
      take,
      skip,
      include: {
        _count: { select: { meetings: true, ticketUpdates: true } },
        // Ticket keys + titles for the sprint tile's hover list.
        ticketUpdates: {
          where: { userId },
          orderBy: { createdAt: "asc" },
          select: { id: true, ticket: { select: { ticketId: true, title: true } } },
        },
      },
    }),
    prisma.workLog.count({ where }),
  ]);

  return { items, total };
}

/** The logs just before and after this one (by date) — the editor's ‹ › buttons. */
export async function getAdjacentWorkLogs(userId: string, workLogId: string) {
  const current = await prisma.workLog.findFirst({ where: { id: workLogId, userId }, select: { date: true } });
  if (!current) return null;
  const select = { id: true, date: true } as const;
  const [previous, next] = await Promise.all([
    prisma.workLog.findFirst({ where: { userId, date: { lt: current.date } }, orderBy: { date: "desc" }, select }),
    prisma.workLog.findFirst({ where: { userId, date: { gt: current.date } }, orderBy: { date: "asc" }, select }),
  ]);
  return { previous, next };
}

export async function updateWorkLogDetails(
  userId: string,
  workLogId: string,
  data: { title?: string; dayType?: DayType },
) {
  const result = await prisma.workLog.updateMany({
    where: { id: workLogId, userId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.dayType !== undefined ? { dayType: data.dayType } : {}),
    },
  });
  if (result.count === 0) return null;
  return getWorkLogById(userId, workLogId);
}

/** Deletes the log, its meetings and its ticket updates. Tickets survive. */
export async function deleteWorkLog(userId: string, workLogId: string) {
  const result = await prisma.workLog.deleteMany({
    where: { id: workLogId, userId },
  });
  return result.count > 0;
}

// --- meetings ---------------------------------------------------------------

/** Verify the meeting hangs off a work log this user owns. */
async function assertMeetingOwned(userId: string, meetingId: string) {
  return prisma.meeting.findFirst({
    where: { id: meetingId, workLog: { userId } },
    select: { id: true, workLogId: true, order: true },
  });
}

export async function addMeeting(
  userId: string,
  workLogId: string,
  name: string,
  notes = "",
) {
  const workLog = await prisma.workLog.findFirst({
    where: { id: workLogId, userId },
    select: { id: true },
  });
  if (!workLog) return null;

  const last = await prisma.meeting.findFirst({
    where: { workLogId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  return prisma.meeting.create({
    data: {
      workLogId,
      name,
      notes,
      order: (last?.order ?? -1) + 1,
      isDefault: false,
    },
  });
}

/** Autosave target for meeting notes. Idempotent, one row, no history. */
export async function updateMeeting(
  userId: string,
  meetingId: string,
  data: { name?: string; notes?: string },
) {
  const owned = await assertMeetingOwned(userId, meetingId);
  if (!owned) return null;

  const meeting = await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.notes !== undefined ? { notes: data.notes } : {}),
    },
  });

  await touchWorkLog(owned.workLogId);
  return meeting;
}

export async function deleteMeeting(userId: string, meetingId: string) {
  const owned = await assertMeetingOwned(userId, meetingId);
  if (!owned) return false;
  await prisma.meeting.delete({ where: { id: meetingId } });
  await touchWorkLog(owned.workLogId);
  return true;
}

/** Bump updatedAt so "last saved" and the listing stay honest. */
export async function touchWorkLog(workLogId: string) {
  await prisma.workLog.update({
    where: { id: workLogId },
    data: { updatedAt: new Date() },
  });
}

function normalizeWorkLogStatuses<
  T extends {
    ticketUpdates: Array<{
      status: StoredTicketStatus;
      ticket: { status: StoredTicketStatus };
    }>;
  },
>(
  workLog: T,
): Omit<T, "ticketUpdates"> & {
  ticketUpdates: Array<
    Omit<T["ticketUpdates"][number], "status" | "ticket"> & {
      status: WorkflowStatus;
      ticket: Omit<T["ticketUpdates"][number]["ticket"], "status"> & {
        status: WorkflowStatus;
      };
    }
  >;
} {
  const { ticketUpdates, ...rest } = workLog;
  return {
    ...rest,
    ticketUpdates: ticketUpdates.map((update) => {
      const { status, ticket, ...updateRest } = update;
      const { status: ticketStatus, ...ticketRest } = ticket;
      return {
        ...updateRest,
        status: normalizeTicketStatus(status),
        ticket: {
          ...ticketRest,
          status: normalizeTicketStatus(ticketStatus),
        },
      } as Omit<T["ticketUpdates"][number], "status" | "ticket"> & {
        status: WorkflowStatus;
        ticket: Omit<T["ticketUpdates"][number]["ticket"], "status"> & {
          status: WorkflowStatus;
        };
      };
    }),
  };
}


// ---------------------------------------------------------------------------
// Learning notes & attachments
// ---------------------------------------------------------------------------

export const ATTACHMENT_SELECT = {
  id: true,
  kind: true,
  name: true,
  url: true,
  mimeType: true,
  size: true,
  createdAt: true,
} as const;

/** Max bytes per uploaded file (stored in Postgres). */
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

export async function saveLearningNotesRow(userId: string, workLogId: string, notes: string) {
  const result = await prisma.workLog.updateMany({
    where: { id: workLogId, userId },
    data: { learningNotes: notes },
  });
  return result.count > 0;
}

export async function addLinkAttachment(
  userId: string,
  workLogId: string,
  data: { url: string; label?: string | null },
) {
  const owned = await prisma.workLog.findFirst({ where: { id: workLogId, userId }, select: { id: true } });
  if (!owned) return null;
  let name = data.label?.trim() || "";
  if (!name) {
    try { name = new URL(data.url).hostname.replace(/^www\./, ""); } catch { name = data.url; }
  }
  return prisma.workLogAttachment.create({
    data: { workLogId, userId, kind: "Link", name, url: data.url },
    select: ATTACHMENT_SELECT,
  });
}

export async function addFileAttachments(
  userId: string,
  workLogId: string,
  files: Array<{ name: string; mimeType: string; bytes: Uint8Array<ArrayBuffer> }>,
) {
  const owned = await prisma.workLog.findFirst({ where: { id: workLogId, userId }, select: { id: true } });
  if (!owned) return null;
  return prisma.$transaction(
    files.map((file) =>
      prisma.workLogAttachment.create({
        data: {
          workLogId,
          userId,
          kind: "File",
          name: file.name,
          mimeType: file.mimeType,
          size: file.bytes.byteLength,
          data: file.bytes,
        },
        select: ATTACHMENT_SELECT,
      }),
    ),
  );
}

export async function getAttachmentFile(userId: string, attachmentId: string) {
  return prisma.workLogAttachment.findFirst({
    where: { id: attachmentId, userId, kind: "File" },
    select: { name: true, mimeType: true, size: true, data: true },
  });
}

export async function deleteAttachmentRow(userId: string, attachmentId: string) {
  const result = await prisma.workLogAttachment.deleteMany({ where: { id: attachmentId, userId } });
  return result.count > 0;
}


/** YYYY-MM-DD keys of every day this user marked as Holiday or Leave. */
export async function listDaysOff(userId: string) {
  const rows = await prisma.workLog.findMany({
    where: { userId, dayType: { not: "Work" } },
    select: { date: true },
  });
  return rows.map((row) => formatDateKey(row.date));
}
