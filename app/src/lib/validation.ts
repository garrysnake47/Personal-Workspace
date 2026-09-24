import { z } from "zod";
import {
  EntryKind,
  FollowUpChannel,
  FollowUpStatus,
  ResourceType,
  TaskPriority,
  TaskStatus,
} from "@/generated/prisma/enums";
import {
  WORKFLOW_STATUS_ORDER,
  type WorkflowStatus,
} from "@/lib/workflow-status";

/**
 * Every server-side mutation validates its input through one of these.
 * Nothing from the client is trusted — not ids, not enum values, not dates.
 */

export const PASSWORD_MIN_LENGTH = 8;

// --- primitives -------------------------------------------------------------

/** A cuid-ish opaque id. Ownership is still verified against userId in the query. */
export const idSchema = z.string().trim().min(1, "Required").max(64);

export const ticketStatusSchema = z.enum(
  WORKFLOW_STATUS_ORDER,
) as z.ZodType<WorkflowStatus>;

export const taskPrioritySchema = z.enum(
  Object.values(TaskPriority) as [string, ...string[]],
) as z.ZodType<TaskPriority>;

export const taskStatusSchema = z.enum(
  Object.values(TaskStatus) as [string, ...string[]],
) as z.ZodType<TaskStatus>;

export const entryKindSchema = z.enum(
  Object.values(EntryKind) as [string, ...string[]],
) as z.ZodType<EntryKind>;

export const followUpChannelSchema = z.enum(
  Object.values(FollowUpChannel) as [string, ...string[]],
) as z.ZodType<FollowUpChannel>;

export const followUpStatusSchema = z.enum(
  Object.values(FollowUpStatus) as [string, ...string[]],
) as z.ZodType<FollowUpStatus>;

export const resourceTypeSchema = z.enum(
  Object.values(ResourceType) as [string, ...string[]],
) as z.ZodType<ResourceType>;

/** Accepts "YYYY-MM-DD" or a Date; always yields a UTC-midnight Date. */
export const dateOnlySchema = z
  .union([z.string(), z.date()])
  .transform((value, ctx) => {
    const raw = value instanceof Date ? value.toISOString().slice(0, 10) : value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      ctx.addIssue({ code: "custom", message: "Expected a YYYY-MM-DD date" });
      return z.NEVER;
    }
    const parsed = new Date(`${raw}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid date" });
      return z.NEVER;
    }
    return parsed;
  });

export const optionalDateSchema = z
  .union([z.string(), z.date(), z.null()])
  .optional()
  .transform((value, ctx) => {
    if (value === null || value === undefined || value === "") return null;
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid date" });
      return z.NEVER;
    }
    return parsed;
  });

export const tagsSchema = z
  .union([z.array(z.string()), z.string()])
  .optional()
  .transform((value) => {
    if (!value) return [] as string[];
    const list = Array.isArray(value) ? value : value.split(",");
    return Array.from(
      new Set(list.map((t) => t.trim()).filter(Boolean).slice(0, 25)),
    );
  });

/** Trim + collapse whitespace; used for anything rendered as a heading. */
const cleanLine = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "Required")
    .max(max)
    .transform((s) => s.replace(/\s+/g, " "));

const optionalCleanLine = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((s) => s.replace(/\s+/g, " ") || null)
    .optional();

const richText = (max: number) =>
  z.string().max(max).optional().transform((s) => (s ?? "").trimEnd());

// --- auth -------------------------------------------------------------------

export const registerSchema = z
  .object({
    name: cleanLine(120),
    email: z.string().trim().toLowerCase().email("Enter a valid email").max(255),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
      .max(200),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").max(255),
  password: z.string().min(1, "Password is required").max(200),
});

export type RegisterInput = z.input<typeof registerSchema>;
export type LoginInput = z.input<typeof loginSchema>;

// --- work log ---------------------------------------------------------------

export const workLogDateSchema = z.object({
  date: dateOnlySchema,
  title: cleanLine(160).optional(),
  projectName: optionalCleanLine(160),
});

export const updateWorkLogSchema = z.object({
  workLogId: idSchema,
  title: cleanLine(160).optional(),
  projectName: optionalCleanLine(160),
});

export const deleteWorkLogSchema = z.object({ workLogId: idSchema });

// --- meetings ---------------------------------------------------------------

export const createMeetingSchema = z.object({
  workLogId: idSchema,
  name: cleanLine(120),
  notes: richText(20_000),
});

export const updateMeetingSchema = z.object({
  meetingId: idSchema,
  name: cleanLine(120).optional(),
  notes: richText(20_000),
});

export const deleteMeetingSchema = z.object({ meetingId: idSchema });

// --- tickets ----------------------------------------------------------------

/** "asu-1234" -> "ASU-1234". Letters/digits/dash/underscore only. */
export const ticketKeySchema = z
  .string()
  .trim()
  .min(1, "Enter a ticket ID")
  .max(64)
  .transform((s) => s.replace(/\s+/g, "").toUpperCase())
  .refine((s) => /^[A-Z0-9][A-Z0-9_-]*$/.test(s), {
    message: "Ticket ID may only contain letters, numbers, - and _",
  });

export const findTicketSchema = z.object({ ticketKey: ticketKeySchema });

export const upsertTicketForWorkLogSchema = z.object({
  workLogId: idSchema,
  ticketKey: ticketKeySchema,
  title: cleanLine(300).optional(),
  status: ticketStatusSchema.optional(),
});

export const saveTicketWorkUpdateSchema = z.object({
  workLogId: idSchema,
  /** Ticket.id (cuid), not the human key. */
  ticketId: idSchema,
  description: richText(20_000),
  status: ticketStatusSchema,
});

export const appendTicketHistoryEntrySchema = z.object({
  ticketId: idSchema,
  body: z.string().trim().min(1, "Write an update before saving").max(20_000),
  status: ticketStatusSchema,
});

export const deleteTicketHistoryEntrySchema = z.object({
  ticketId: idSchema,
  entryId: idSchema,
});

export const detachTicketFromWorkLogSchema = z.object({
  workLogId: idSchema,
  ticketId: idSchema,
});

export const updateTicketSchema = z.object({
  ticketId: idSchema,
  title: cleanLine(300).optional(),
  status: ticketStatusSchema.optional(),
});

export const deleteTicketSchema = z.object({ ticketId: idSchema });

export const listTicketsSchema = z.object({
  search: z.string().trim().max(200).optional(),
  status: ticketStatusSchema.optional(),
  take: z.coerce.number().int().min(1).max(200).optional(),
  skip: z.coerce.number().int().min(0).optional(),
});

// --- tasks ------------------------------------------------------------------

export const createTaskSchema = z.object({
  title: cleanLine(300),
  description: richText(10_000),
  notes: richText(10_000),
  dueDate: optionalDateSchema,
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
  ticketId: idSchema.nullish(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  taskId: idSchema,
});

export const deleteTaskSchema = z.object({ taskId: idSchema });

// --- notes -----------------------------------------------------------------
// Notes are notebooks now (Note -> Section -> Page) and validate through
// `lib/notes.ts`, which the editor imports too. Nothing lives here.

// --- links ------------------------------------------------------------------

export const createLinkSchema = z.object({
  title: cleanLine(300),
  url: z.string().trim().url("Enter a valid URL").max(2000),
  description: richText(5_000),
  category: cleanLine(80).optional(),
  tags: tagsSchema,
});

export const updateLinkSchema = createLinkSchema.partial().extend({
  linkId: idSchema,
});

export const deleteLinkSchema = z.object({ linkId: idSchema });

// --- resources --------------------------------------------------------------

export const createResourceSchema = z.object({
  title: cleanLine(300),
  description: richText(5_000),
  type: resourceTypeSchema.optional(),
  url: z.string().trim().url("Enter a valid URL").max(2000).nullish().or(z.literal("")),
  content: richText(100_000),
  tags: tagsSchema,
});

export const updateResourceSchema = createResourceSchema.partial().extend({
  resourceId: idSchema,
});

export const deleteResourceSchema = z.object({ resourceId: idSchema });


// --- follow-ups -------------------------------------------------------------

/** A follow-up due date is a plain calendar day; no time component is stored. */
export const followUpDueDateSchema = z
  .union([z.string(), z.date(), z.null()])
  .optional()
  .transform((value, ctx) => {
    if (value === null || value === undefined || value === "") return null;
    const raw =
      value instanceof Date ? value.toISOString().slice(0, 10) : value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      ctx.addIssue({ code: "custom", message: "Expected a YYYY-MM-DD date" });
      return z.NEVER;
    }
    const parsed = new Date(`${raw}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid date" });
      return z.NEVER;
    }
    return parsed;
  });

export const createFollowUpSchema = z
  .object({
    kind: entryKindSchema.default("FollowUp"),
    /** Optional here, then required for FollowUp in the refinement below. */
    person: z.string().trim().max(120).optional(),
    subject: cleanLine(300),
    ticketKey: z.string().trim().max(64).nullish().or(z.literal("")),
    dueDate: followUpDueDateSchema,
    /** Optional: a thread can be opened before there is anything to record. */
    note: z.string().trim().max(10_000).optional(),
    channel: followUpChannelSchema.optional(),
    occurredAt: optionalDateSchema,
  })
  .superRefine((value, ctx) => {
    // Only a follow-up is addressed to someone. A task or a note is yours, so
    // demanding a name there would be noise — and a Note has no date either.
    if (value.kind === "FollowUp" && !value.person) {
      ctx.addIssue({
        code: "custom",
        path: ["person"],
        message: "Who did you update?",
      });
    }
    if (value.kind === "Note" && value.dueDate) {
      ctx.addIssue({
        code: "custom",
        path: ["dueDate"],
        message: "A note has no due date — log it as a task instead",
      });
    }
  });

/** Appending is the only write that touches history, so `note` is required. */
export const addFollowUpUpdateSchema = z.object({
  followUpId: idSchema,
  note: z.string().trim().min(1, "Write what you told them").max(10_000),
  channel: followUpChannelSchema.optional(),
  occurredAt: optionalDateSchema,
});

export const setFollowUpStatusSchema = z.object({
  followUpId: idSchema,
  status: followUpStatusSchema,
});

export const rescheduleFollowUpSchema = z.object({
  followUpId: idSchema,
  dueDate: followUpDueDateSchema,
});

export const deleteFollowUpSchema = z.object({ followUpId: idSchema });
