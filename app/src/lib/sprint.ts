import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";

/**
 * The sprint calendar — ONE definition, imported by everything that talks about
 * sprints. The dashboard and the Work Logs page each had their own copy of this
 * arithmetic and immediately disagreed by a day ("1 Sep – 14 Sep" vs
 * "2 Sep – 15 Sep"), because one worked in local days and the other in UTC.
 * Do not re-derive it anywhere; import `getSprint`.
 */

/** Sprints are counted from this day. Local midnight, not UTC. */
export const SPRINT_CYCLE_ANCHOR = new Date(2026, 8, 2);
export const SPRINT_CYCLE_DAYS = 14;

export type Sprint = { start: Date; end: Date; offset: number };

/** The sprint window containing `date`, in local calendar days. */
export function getSprint(date: Date): Sprint {
  const day = startOfDay(date);
  const offset = Math.floor(
    differenceInCalendarDays(day, SPRINT_CYCLE_ANCHOR) / SPRINT_CYCLE_DAYS,
  );
  const start = addDays(SPRINT_CYCLE_ANCHOR, offset * SPRINT_CYCLE_DAYS);
  return { start, end: addDays(start, SPRINT_CYCLE_DAYS - 1), offset };
}
