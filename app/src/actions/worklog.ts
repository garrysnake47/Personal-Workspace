"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/session";
import { fail, notFound, ok, parseOrFail } from "@/lib/result";
import {
  addMeeting,
  deleteMeeting as deleteMeetingRow,
  deleteWorkLog as deleteWorkLogRow,
  getOrCreateWorkLog,
  getWorkLogByDate,
  getWorkLogById,
  listWorkLogs as listWorkLogsQuery,
  todayUtc,
  updateWorkLogDetails,
  updateMeeting as updateMeetingRow,
} from "@/lib/worklogs";
import {
  createMeetingSchema,
  deleteMeetingSchema,
  deleteWorkLogSchema,
  updateMeetingSchema,
  updateWorkLogSchema,
  workLogDateSchema,
} from "@/lib/validation";

/**
 * Work log server actions.
 *
 * Every one starts with `requireUserId()` and passes that id down. No action
 * accepts a userId from the client.
 */

function revalidateWorkLog(workLogId?: string) {
  revalidatePath("/work-logs");
  revalidatePath("/dashboard");
  if (workLogId) {
    revalidatePath(`/work-logs/${workLogId}`);
    revalidatePath(`/work-logs/${workLogId}/edit`);
  }
}

/** Today's work log, created with the 4 default meetings if it's the first call. */
export async function openTodayWorkLog() {
  const userId = await requireUserId();
  const date = todayUtc();
  const existing = await getWorkLogByDate(userId, date);
  if (existing) {
    revalidateWorkLog(existing.id);
    return ok(existing);
  }
  if (date.getUTCDay() === 0 || date.getUTCDay() === 6) {
    return fail("VALIDATION_ERROR", "Work logs can only be created on weekdays");
  }
  const workLog = await getOrCreateWorkLog(userId, date);
  revalidateWorkLog(workLog.id);
  return ok(workLog);
}

/** Open (or create) a dated work log. Input: { date, title?, projectName? } */
export async function openWorkLogForDate(input: unknown) {
  const userId = await requireUserId();
  const parsed = parseOrFail(workLogDateSchema, input);
  if (!parsed.ok) return parsed;

  const existing = await getWorkLogByDate(userId, parsed.data.date);
  if (existing) {
    revalidateWorkLog(existing.id);
    return ok(existing);
  }
  if (parsed.data.date.getUTCDay() === 0 || parsed.data.date.getUTCDay() === 6) {
    return fail("VALIDATION_ERROR", "Work logs can only be created on weekdays");
  }

  const workLog = await getOrCreateWorkLog(
    userId,
    parsed.data.date,
    parsed.data.title,
    parsed.data.projectName,
  );
  revalidateWorkLog(workLog.id);
  return ok(workLog);
}

/** Read-only fetch. Returns NOT_FOUND for someone else's id. */
export async function getWorkLog(workLogId: string) {
  const userId = await requireUserId();
  const workLog = await getWorkLogById(userId, workLogId);
  if (!workLog) return notFound("Work log not found");
  return ok(workLog);
}

export async function listWorkLogs(options?: {
  search?: string;
  from?: string;
  to?: string;
  ticketId?: string;
  take?: number;
  skip?: number;
}) {
  const userId = await requireUserId();
  return ok(
    await listWorkLogsQuery(userId, {
      search: options?.search?.trim() || undefined,
      from: options?.from ? new Date(`${options.from}T00:00:00.000Z`) : undefined,
      to: options?.to ? new Date(`${options.to}T00:00:00.000Z`) : undefined,
      ticketId: options?.ticketId,
      take: options?.take,
      skip: options?.skip,
    }),
  );
}

/** Update work-log identity fields. Input: { workLogId, title?, projectName? } */
export async function updateWorkLog(input: unknown) {
  const userId = await requireUserId();
  const parsed = parseOrFail(updateWorkLogSchema, input);
  if (!parsed.ok) return parsed;

  const { workLogId, title, projectName } = parsed.data;
  if (title === undefined && projectName === undefined) return fail("VALIDATION_ERROR", "Nothing to update");

  const workLog = await updateWorkLogDetails(userId, workLogId, { title, projectName });
  if (!workLog) return notFound("Work log not found");

  revalidateWorkLog(workLogId);
  return ok(workLog);
}

/** Deletes the log + its meetings + its ticket updates. Tickets are kept. */
export async function deleteWorkLog(input: unknown) {
  const userId = await requireUserId();
  const parsed = parseOrFail(deleteWorkLogSchema, input);
  if (!parsed.ok) return parsed;

  const removed = await deleteWorkLogRow(userId, parsed.data.workLogId);
  if (!removed) return notFound("Work log not found");

  revalidateWorkLog();
  return ok({ deleted: true });
}

// --- meetings ---------------------------------------------------------------

/** "+ Add Meeting". Input: { workLogId, name, notes? } */
export async function createMeeting(input: unknown) {
  const userId = await requireUserId();
  const parsed = parseOrFail(createMeetingSchema, input);
  if (!parsed.ok) return parsed;

  const { workLogId, name, notes } = parsed.data;
  const meeting = await addMeeting(userId, workLogId, name, notes);
  if (!meeting) return notFound("Work log not found");

  revalidateWorkLog(workLogId);
  return ok(meeting);
}

/**
 * Autosave target for meeting notes. Input: { meetingId, name?, notes? }
 * Idempotent — safe to call on every debounce tick.
 */
export async function updateMeeting(input: unknown) {
  const userId = await requireUserId();
  const parsed = parseOrFail(updateMeetingSchema, input);
  if (!parsed.ok) return parsed;

  const { meetingId, name, notes } = parsed.data;
  const meeting = await updateMeetingRow(userId, meetingId, { name, notes });
  if (!meeting) return notFound("Meeting not found");

  return ok({ ...meeting, savedAt: new Date() });
}

export async function deleteMeeting(input: unknown) {
  const userId = await requireUserId();
  const parsed = parseOrFail(deleteMeetingSchema, input);
  if (!parsed.ok) return parsed;

  const removed = await deleteMeetingRow(userId, parsed.data.meetingId);
  if (!removed) return notFound("Meeting not found");

  revalidateWorkLog();
  return ok({ deleted: true });
}
