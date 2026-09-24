"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

import { cn } from "@/components/cn";
import { Container, SectionHead } from "@/components/marketing/primitives";

/**
 * FAQ accordion.
 *
 * Accessibility: each row's trigger is a real <button> inside an <h3> (so the
 * questions appear in the document outline), carrying aria-expanded and
 * aria-controls. The panel keeps its id and is toggled with `hidden`, so
 * in-page find and screen-reader navigation both behave. Multiple rows may be
 * open at once — an accordion that closes your previous answer is hostile.
 */

const FAQS = [
  {
    q: "What is this for?",
    a: "Recording what you actually did each day — the meetings you attended and the tickets you moved — so reviewing a sprint means reading, not remembering.",
  },
  {
    q: "How is a work log different from a notes app?",
    a: "A work log is one entry per day, opened for you with your recurring meetings already listed. You are never staring at an empty document deciding how to structure it.",
  },
  {
    q: "What happens to a ticket's earlier updates?",
    a: "Nothing. Each day appends a new update to the ticket and records the status as it was at that moment. Previous entries are never overwritten, so the timeline stays honest.",
  },
  {
    q: "Do I have to remember to save?",
    a: "No. Notes and work updates autosave as you type, and re-saving the same day's update edits that day's entry instead of creating a duplicate.",
  },
  {
    q: "Is my data private?",
    a: "Every record is scoped to your own account and can only be read by you. There are no shared workspaces and no team access levels, because this is deliberately a single-person tool.",
  },
  {
    q: "Does it work on a phone?",
    a: "Yes. Every screen is built mobile-first and tested from 360px up, in both light and dark.",
  },
] as const;

export function Faq() {
  const [open, setOpen] = useState<readonly number[]>([0]);

  const toggle = (index: number) =>
    setOpen((current) =>
      current.includes(index)
        ? current.filter((i) => i !== index)
        : [...current, index],
    );

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-surface-2 py-16 md:py-24"
    >
      <Container>
        <SectionHead
          id="faq-heading"
          eyebrow="Questions"
          heading="The things people ask before they start"
          lead="Six answers. If yours is not here, it is probably answered by opening today's log and typing two lines."
        />

        <div className="mt-10 grid gap-x-10 md:mt-12 md:grid-cols-2">
          {FAQS.map((faq, index) => {
            const isOpen = open.includes(index);
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-trigger-${index}`;

            return (
              <div
                key={faq.q}
                data-reveal="fade"
                style={
                  { "--reveal-delay": `${index * 60}ms` } as React.CSSProperties
                }
                className="border-b border-border py-4"
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggle(index)}
                    className="group flex w-full cursor-pointer items-start justify-between gap-4 rounded-md text-left"
                  >
                    <span className="text-md font-bold text-text">{faq.q}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full",
                        // motion.csv row 1 — 150ms, power1.out, <2px move.
                        "transition-[transform,background-color,color] duration-150 ease-power1-out group-hover:-translate-y-px",
                        isOpen
                          ? "bg-primary text-primary-fg"
                          : "bg-primary-subtle text-accent-text",
                      )}
                    >
                      {isOpen ? (
                        <Minus className="size-3.5" strokeWidth={3} />
                      ) : (
                        <Plus className="size-3.5" strokeWidth={3} />
                      )}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className="pt-3 pr-10"
                >
                  <p className="text-md text-text-muted">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
