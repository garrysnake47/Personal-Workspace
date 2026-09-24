"use client";

import { useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";

import { cn } from "@/components/cn";

/** A page entry. `id` is the DOM id of the heading it should scroll to. */
export type TocPage = { id: string; title: string };

/** A section and the pages under it. `id` is the section's DOM id. */
export type TocSection = { id: string; title: string; pages: TocPage[] };

/** Matches the `.note-accordion` open/close transition in `globals.css`. */
const ACCORDION_MS = 280;

export type NoteTableOfContentsProps = {
  sections: TocSection[];
  className?: string;
};

/**
 * "On this page" for a note.
 *
 * A sticky right-hand column from `lg` up; below that it folds into a
 * disclosure so it does not push the note itself off the first screen.
 */
export function NoteTableOfContents({
  sections,
  className,
}: NoteTableOfContentsProps) {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // every anchor we track, sections included, in document order
  const anchorIds = useMemo(
    () => sections.flatMap((s) => [s.id, ...s.pages.map((p) => p.id)]),
    [sections],
  );

  useEffect(() => {
    if (anchorIds.length === 0) return;

    const elements = anchorIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    // Anything in the band just under the sticky header counts as "here"; the
    // highest such heading wins, so scrolling reads top-down like the note.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: 0 },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [anchorIds]);

  const jumpTo = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();

      // The note's sections are collapsible `<details>`, closed by default. A
      // target inside a closed one has no layout, so open every ancestor
      // first — otherwise the scroll lands on whatever happens to sit at that
      // offset instead. They share a `name`, so the browser closes whichever
      // section was open as this one opens.
      let expanded = false;
      let ancestor: HTMLElement | null = target.closest("details");
      while (ancestor instanceof HTMLDetailsElement) {
        if (!ancestor.open) {
          ancestor.open = true;
          expanded = true;
        }
        ancestor = ancestor.parentElement?.closest("details") ?? null;
      }

      const scroll = () =>
        target.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });

      // A section that had to open — and the one that closes in its place —
      // are both mid-transition (see `.note-accordion` in globals.css), so the
      // target keeps moving for the length of that animation. Scrolling into
      // it now chases a stale offset and lands short; wait it out first. When
      // nothing expanded, a frame of slack is enough.
      if (expanded && !reduceMotion) {
        window.setTimeout(scroll, ACCORDION_MS + 20);
      } else {
        requestAnimationFrame(() => requestAnimationFrame(scroll));
      }

      // keep the URL shareable without the browser's own jump
      window.history.replaceState(null, "", `#${id}`);
      setActiveId(id);
      setOpen(false);
    },
    [reduceMotion],
  );

  if (sections.length === 0) return null;

  const list = (
    <nav aria-label="On this page">
      <ul className="space-y-1.5">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={(event) => jumpTo(event, section.id)}
              aria-current={activeId === section.id ? "location" : undefined}
              className={cn(
                "flex min-h-[38px] items-center rounded-lg px-2.5 py-2 text-base font-semibold leading-snug transition-colors",
                activeId === section.id
                  ? "bg-primary text-primary-fg"
                  : "text-text hover:bg-surface-2 hover:text-primary",
              )}
            >
              {section.title}
            </a>

            {section.pages.length > 0 ? (
              <ul className="mt-1 ml-2.5 space-y-1 border-l border-border-strong pl-3">
                {section.pages.map((page) => (
                  <li key={page.id}>
                    <a
                      href={`#${page.id}`}
                      onClick={(event) => jumpTo(event, page.id)}
                      aria-current={
                        activeId === page.id ? "location" : undefined
                      }
                      className={cn(
                        "flex min-h-[34px] items-center rounded-lg px-3 py-1.5 text-sm leading-snug transition-colors",
                        activeId === page.id
                          ? "bg-surface-3 font-semibold text-accent-text"
                          : "text-text-muted hover:bg-surface-2 hover:text-text",
                      )}
                    >
                      {page.title}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <div className={className}>
      {/* below lg: a disclosure, so the note stays the first thing you see */}
      <details
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
        className="group border-b border-border-strong pb-4 lg:hidden"
      >
        <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-text-subtle transition-colors hover:text-text">
          <span
            aria-hidden="true"
            className="transition-transform group-open:rotate-90"
          >
            ›
          </span>
          On this page
        </summary>
        <div className="mt-4">{list}</div>
      </details>

      {/*
        The label stays put; only the list beneath it scrolls, so "On this
        page" is never the thing that gets scrolled out of view on a long
        note. The height budget leaves room for `main`'s own top/bottom
        padding plus the label — tune here, not on the outer sticky wrapper.
      */}
      <div className="hidden rounded-xl bg-surface-2 p-4 lg:block">
        <p className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-text-subtle">
          On this page
        </p>
        <div className="mt-3 max-h-[calc(100svh-13rem)] overflow-y-auto pr-1">
          {list}
        </div>
      </div>
    </div>
  );
}
