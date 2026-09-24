/* ---------------------------------------------------------------------------
   A day in the log — the product surface, DRAWN in DOM and tokens.

   No screenshot, by the user's decision (PRODUCT.md, Evidence on Hand). One
   `role="img"` node with a single label, so a screen reader hears what this
   shows once instead of reading out illustrative ticket ids as if they were
   real. Every value in it is invented and captioned as such by the caller.
--------------------------------------------------------------------------- */

const MEETINGS = [
  { name: "Stand-up", note: "Duplicate-charge report is mine. Asked for the payment log." },
  { name: "Sprint sync", note: "ASU-1611 slips to next sprint — dependency on billing." },
  { name: "1:1", note: "Agreed to write up the webhook replay before Friday." },
  { name: "Retro", note: "" },
] as const;

const UPDATES = [
  { id: "ASU-1604", status: "In review", body: "Webhook replay confirmed. Fix up for review." },
  { id: "ASU-1611", status: "Blocked", body: "Waiting on billing to expose the ledger endpoint." },
  { id: "ASU-1588", status: "Released", body: "Shipped behind the flag at 16:20." },
] as const;

export function DayInTheLog() {
  return (
    <div
      role="img"
      aria-label="A day in a work log: the date, four meeting notes, and three ticket updates each with a status."
      className="overflow-hidden rounded-xl border border-border bg-surface"
    >
      <header className="flex items-baseline justify-between gap-4 border-b border-border px-4 py-3 md:px-5">
        <span className="m-display text-lg">Friday</span>
        <span className="m-data text-xs text-text-subtle">14 Mar</span>
      </header>

      <div className="grid gap-px bg-border md:grid-cols-2">
        <section className="bg-surface p-4 md:p-5">
          <h3 className="m-data text-[0.625rem] tracking-[0.12em] text-text-subtle uppercase">
            Meetings
          </h3>
          <ul className="mt-3 flex flex-col gap-2.5">
            {MEETINGS.map((meeting) => (
              <li key={meeting.name} className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-text">
                  {meeting.name}
                </span>
                {meeting.note ? (
                  <span className="text-sm text-text-muted">{meeting.note}</span>
                ) : (
                  <span className="text-sm text-text-subtle italic">
                    No notes yet
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-surface p-4 md:p-5">
          <h3 className="m-data text-[0.625rem] tracking-[0.12em] text-text-subtle uppercase">
            Ticket updates
          </h3>
          <ul className="mt-3 flex flex-col gap-3">
            {UPDATES.map((update) => (
              <li key={update.id} className="flex flex-col gap-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="m-data text-xs text-[var(--c-accent-text)]">
                    {update.id}
                  </span>
                  <span className="m-data inline-flex items-center gap-1.5 rounded-[4px] bg-surface-3 px-1.5 py-0.5 text-[0.625rem] tracking-[0.08em] text-text-muted uppercase">
                    {/* Drawn, not a unicode bullet standing in for a glyph. */}
                    <span
                      aria-hidden="true"
                      className="size-1 rounded-full bg-current"
                    />
                    {update.status}
                  </span>
                </span>
                <span className="text-sm text-text-muted">{update.body}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
