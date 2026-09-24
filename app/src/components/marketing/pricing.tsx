"use client";

import { useState } from "react";

import { cn } from "@/components/cn";
import {
  CheckList,
  Container,
  CtaLink,
  OffsetCard,
  SectionHead,
} from "@/components/marketing/primitives";

/**
 * Single-plan pricing with a monthly/yearly toggle.
 *
 * The toggle is a real radiogroup (two <button role="radio">s in a labelled
 * group) rather than a checkbox switch, because "Monthly" and "Yearly" are two
 * choices, not one on/off state. Arrow keys work for free on a radiogroup
 * because both options stay focusable and `aria-checked` carries the state.
 */

const PLAN_FEATURES = [
  "Unlimited daily work logs and meeting notes",
  "Unlimited tickets with full append-only history",
  "Tasks, notes, links and reference material",
  "Keyboard search across everything you've written",
  "Month and quarter report views",
  "Light and dark, on every screen size",
] as const;

const PERIODS = {
  monthly: { price: "$6", suffix: "/ month", note: "Billed monthly." },
  yearly: { price: "$58", suffix: "/ year", note: "Two months free vs. monthly." },
} as const;

type Period = keyof typeof PERIODS;

export function Pricing() {
  const [period, setPeriod] = useState<Period>("monthly");
  const active = PERIODS[period];

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="py-16 md:py-24"
    >
      <Container>
        <SectionHead
          id="pricing-heading"
          eyebrow="Pricing"
          heading="One plan, because there is one of you"
          lead="No seat maths, no feature gates, nothing held back for a tier above. It is one workspace for one person."
        >
          <div
            role="radiogroup"
            aria-label="Billing period"
            className="inline-flex self-start rounded-full border border-border-strong bg-surface p-1"
          >
            {(Object.keys(PERIODS) as Period[]).map((key) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={period === key}
                onClick={() => setPeriod(key)}
                className={cn(
                  "cursor-pointer rounded-full px-4 py-1.5 text-sm font-bold capitalize transition-colors duration-150 ease-power1-out",
                  period === key
                    ? "bg-primary-strong text-primary-fg"
                    : "text-text-muted hover:text-text",
                )}
              >
                {key}
              </button>
            ))}
          </div>
        </SectionHead>

        <div data-reveal className="mt-10 md:mt-12">
        <OffsetCard className="p-6 md:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:gap-10">
            <div className="flex flex-col gap-5 md:border-r md:border-border md:pr-10">
              <div>
                <p className="text-lg font-extrabold text-text">Workspace Pro</p>
                <p className="mt-1 text-md text-text-muted">
                  Everything the app does, for one person.
                </p>
              </div>
              <p className="flex items-end gap-2">
                <span className="text-4xl font-extrabold tracking-tight text-text md:text-6xl">
                  {active.price}
                </span>
                <span className="pb-1 text-md font-semibold text-text-muted">
                  {active.suffix}
                </span>
              </p>
              <p aria-live="polite" className="text-sm text-text-subtle">
                {active.note}
              </p>
              <CtaLink href="/register" arrow className="w-full">
                Start free trial
              </CtaLink>
              <p className="text-center text-sm text-text-subtle">
                No credit card required · Cancel anytime
              </p>
            </div>

            <div>
              <p className="mb-4 text-2xs font-semibold tracking-[0.18em] text-text-subtle uppercase">
                What&rsquo;s included
              </p>
              <CheckList items={PLAN_FEATURES} />
            </div>
          </div>
        </OffsetCard>
        </div>
      </Container>
    </section>
  );
}
