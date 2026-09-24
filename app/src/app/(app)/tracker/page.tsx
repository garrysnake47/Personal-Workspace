import { listFollowUpPeople, listFollowUps } from "@/actions/follow-ups";
import { TrackerBoard } from "@/components/tracker/tracker-board";

export const metadata = { title: "Tracker" };

/**
 * One board for the three things worth remembering day to day: follow-ups
 * (what you told someone), tasks (what you owe), and notes (what you want to
 * keep). They share a table and a spine — see `EntryKind` in the schema.
 *
 * Dates cross the server/client boundary as ISO strings; the board re-hydrates.
 */
export default async function TrackerPage() {
  const [entries, people] = await Promise.all([
    listFollowUps(),
    listFollowUpPeople(),
  ]);

  return (
    <TrackerBoard
      entries={
        entries.ok
          ? entries.data.map((entry) => ({
              ...entry,
              dueDate: entry.dueDate
                ? entry.dueDate.toISOString().slice(0, 10)
                : null,
              completedAt: entry.completedAt?.toISOString() ?? null,
              createdAt: entry.createdAt.toISOString(),
              updatedAt: entry.updatedAt.toISOString(),
              updates: entry.updates.map((update) => ({
                ...update,
                occurredAt: update.occurredAt.toISOString(),
                createdAt: update.createdAt.toISOString(),
              })),
            }))
          : []
      }
      people={people.ok ? people.data : []}
      // The server's day, used for the first paint; the client corrects to the
      // browser's own clock on hydration (same trick as the top bar's date).
      serverToday={new Date().toISOString().slice(0, 10)}
      loadError={entries.ok ? undefined : entries.error.message}
    />
  );
}
