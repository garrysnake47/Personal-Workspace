"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/components/cn";

/* ---------------------------------------------------------------------------
   The amend attempt — this page's signature interaction.

   The visitor presses a control that offers to change an entry. It does not
   change it. The deletion red strikes the line once, then resolves as a NEW
   dated entry appended below with its own id; the original stays, dimmed but
   fully legible. That single gesture discharges the whole append-only claim,
   which is the one thing this product has that an issue tracker does not.

   This is also the page's only use of the deletion colour. It appears struck,
   never as a live state, because the product has no delete.

   Every id and timestamp below is illustrative, and labelled as such in the
   caption — the product has no users and no real history to quote.
--------------------------------------------------------------------------- */

type Entry = {
  id: string;
  at: string;
  status: string;
  body: string;
};

const ORIGINAL: Entry = {
  id: "4f2a9c1",
  at: "14 Mar · 17:42",
  status: "In progress",
  body: "Traced the duplicate-charge report to the retry handler. Not fixed yet — need the payment log for Tuesday.",
};

const CORRECTION: Entry = {
  id: "b7e0d43",
  at: "15 Mar · 09:18",
  status: "In review",
  body: "Correction: it was the webhook replaying, not the retry handler. Fix is in review.",
};

type Phase = "idle" | "striking" | "appended";

export function AmendAttempt() {
  const [phase, setPhase] = useState<Phase>("idle");
  const liveRef = useRef<HTMLParagraphElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  const reducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const attempt = useCallback(() => {
    if (phase !== "idle") return;

    // Under reduced motion the strike is skipped entirely — the outcome is
    // identical, it simply arrives without the flash.
    if (reducedMotion()) {
      setPhase("appended");
      return;
    }

    setPhase("striking");
    timers.current.push(setTimeout(() => setPhase("appended"), 620));
  }, [phase]);

  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPhase("idle");
  }, []);

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        {/* Original entry */}
        <article
          className={cn(
            "flex gap-3 p-4 transition-colors duration-300 md:gap-4 md:p-5",
            phase === "appended" && "bg-surface-2/40",
          )}
        >
          <span
            aria-hidden="true"
            className="m-data mt-1 hidden text-xs text-text-subtle md:block"
          >
            {ORIGINAL.id}
          </span>
          <div className="min-w-0 flex-1">
            <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="m-data text-xs text-text-subtle">
                {ORIGINAL.at}
              </span>
              <StatusTag>{ORIGINAL.status}</StatusTag>
            </header>
            <p
              className={cn(
                "relative mt-2 text-md transition-colors duration-300",
                // Superseded, not faded out: the id, timestamp and status keep
                // their own colours so "still there, still dated" stays true.
                phase === "appended" ? "text-text-muted" : "text-text",
                phase === "striking" && "m-strike",
              )}
            >
              {ORIGINAL.body}
            </p>
          </div>
        </article>

        {/* The appended correction */}
        {phase === "appended" ? (
          <article className="flex gap-3 border-t border-border bg-[var(--m-gutter-add-bg)]/60 p-4 md:gap-4 md:p-5">
            <span
              aria-hidden="true"
              className="m-data mt-1 hidden text-xs text-[var(--c-accent-text)] md:block"
            >
              {CORRECTION.id}
            </span>
            <div className="min-w-0 flex-1">
              <header className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="m-data text-xs text-[var(--c-accent-text)]">
                  {CORRECTION.at}
                </span>
                <StatusTag tone="add">{CORRECTION.status}</StatusTag>
              </header>
              <p className="mt-2 text-md text-text">{CORRECTION.body}</p>
            </div>
          </article>
        ) : null}

        {/* Control */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-surface-2 px-4 py-3 md:px-5">
          <p
            ref={liveRef}
            aria-live="polite"
            className="m-data text-xs text-text-muted"
          >
            {phase === "appended"
              ? "2 entries · nothing overwritten"
              : "1 entry"}
          </p>

          {phase === "appended" ? (
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-border-strong px-4 py-2 text-sm font-semibold text-text transition-colors duration-150 hover:bg-surface-3"
            >
              Run it again
            </button>
          ) : (
            <button
              type="button"
              onClick={attempt}
              disabled={phase === "striking"}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-[var(--c-primary-fg)] transition-colors duration-150 hover:bg-primary-hover disabled:opacity-70"
            >
              Amend this entry
            </button>
          )}
        </footer>
      </div>

      <p className="mt-3 text-sm text-text-subtle">
        {phase === "appended"
          ? "The original is still there, still readable, still dated. A correction is a new entry — that is the only way to change the record."
          : "Press it. The entry will not change."}{" "}
        <span className="text-text-subtle">Illustrative entries.</span>
      </p>
    </div>
  );
}

function StatusTag({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "add";
}) {
  return (
    <span
      className={cn(
        "m-data inline-flex items-center gap-1.5 rounded-[4px] px-1.5 py-0.5 text-[0.625rem] tracking-[0.08em] uppercase",
        tone === "add"
          ? "bg-[var(--c-primary-subtle)] text-[var(--c-accent-text)]"
          : "bg-surface-3 text-text-muted",
      )}
    >
      {/* State is never colour alone — a mark rides with the word. `+` is real
          diff notation; the neutral mark is drawn rather than a unicode
          bullet standing in for an icon. */}
      {tone === "add" ? (
        <span aria-hidden="true">+</span>
      ) : (
        <span aria-hidden="true" className="size-1 rounded-full bg-current" />
      )}
      {children}
    </span>
  );
}
