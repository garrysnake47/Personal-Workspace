"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { ok, parseOrFail } from "@/lib/result";
import { requireUserId } from "@/lib/session";
import { updateProfileSchema } from "@/lib/validation";

/** Profile settings: name, sprint calendar, and whether tickets are used. */
export async function updateProfile(input: unknown) {
  const userId = await requireUserId();
  const parsed = parseOrFail(updateProfileSchema, input);
  if (!parsed.ok) return parsed;

  const { name, sprintStartDate, sprintLengthDays, ticketsEnabled } = parsed.data;
  await prisma.user.update({
    where: { id: userId },
    data: {
      name: name || null,
      sprintStartDate: sprintStartDate ? new Date(`${sprintStartDate}T00:00:00.000Z`) : null,
      sprintLengthDays,
      ticketsEnabled,
    },
  });

  // Nav, sprint calendars and ticket sections all read these settings.
  revalidatePath("/", "layout");
  return ok({ saved: true });
}
