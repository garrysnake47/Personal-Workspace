import Link from "next/link";

import { ArrowRight, BarsIcon, HeartIcon, LeafIcon, PlayIcon } from "@/components/banner/banner-icons";
import { BannerMotion } from "@/components/banner/banner-motion";
import { BannerNav } from "@/components/banner/banner-nav";
import { BannerScene } from "@/components/banner/banner-scene";

/**
 * The banner, reproduced from the supplied light/dark reference comps.
 *
 * Three layers, back to front:
 *   1. `BannerScene` — the room photography.
 *   2. readability masks — a left wedge, a top band under the nav pill and a
 *      bottom band, all painted in `--bn-bg` so they dissolve into whichever
 *      theme is live.
 *   3. content — nav, copy and the benefit row.
 *
 * The room stays a separate photographic layer so the page retains real links,
 * selectable copy, responsive layout and independent theme treatment.
 */

const FEATURES = [
  { Icon: LeafIcon, title: "Stay organized", copy: "Everything in one place" },
  { Icon: BarsIcon, title: "Make progress", copy: "Small steps, big growth" },
  { Icon: HeartIcon, title: "A calmer you", copy: "Less clutter, more clarity" },
] as const;

export function BannerHero() {
  return (
    <section id="banner" className="bn-chapter relative isolate min-h-dvh overflow-hidden">
      <BannerMotion />

      {/* ---- layer 1 + 2: scene and its readability masks ---- */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* The room fills the frame from lg up. Below that it becomes a fixed
            420px band along the bottom — a 16:9 scene sliced into a portrait
            viewport zooms until the wall art alone fills the screen, and a
            percentage height would measure the (much taller) stacked section. */}
        <div
          data-bn-reveal="scene"
          className="absolute inset-x-0 bottom-0 h-[420px] lg:inset-0 lg:h-auto"
        >
          <BannerScene />
        </div>

        {/* readability: a left wedge on wide screens, a top fade on narrow */}
        <div
          className="absolute inset-0 hidden lg:block"
          style={{
            background:
              "linear-gradient(100deg, var(--bn-bg) 0%, var(--bn-bg) 20%, color-mix(in srgb, var(--bn-bg) 74%, transparent) 36%, transparent 56%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-[420px] lg:hidden"
          style={{ background: "linear-gradient(to bottom, var(--bn-bg), transparent 38%)" }}
        />
        <div
          className="absolute inset-x-0 top-0 h-40"
          style={{ background: "linear-gradient(to bottom, var(--bn-bg) 8%, transparent)" }}
        />
        <div
          className="absolute inset-x-0 bottom-0 hidden h-32 lg:block"
          style={{
            background:
              "linear-gradient(to top, color-mix(in srgb, var(--bn-bg) 62%, transparent), transparent)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-60 lg:hidden"
          style={{
            background:
              "linear-gradient(to top, var(--bn-bg) 0%, var(--bn-bg) 34%, transparent 100%)",
          }}
        />
      </div>

      <BannerNav />

      <div className="relative flex min-h-dvh flex-col px-6 pt-28 pb-10 md:px-10 lg:px-[6.7%] lg:pt-[12.3vw] lg:pb-[4vw]">
        {/* ------------------------------ copy ------------------------------ */}
        <div className="max-w-[760px] lg:max-w-[56%]">
          <p data-bn-reveal="copy" className="bn-eyebrow bn-reveal-delay-1">
            A calmer, clearer tomorrow
          </p>

          {/* The break after "workday" is the comp's, and it only holds where
              the measure is wide enough — below lg the line wraps naturally. */}
          <h1 data-bn-reveal="copy" className="bn-h1 bn-reveal-delay-2 mt-6 lg:mt-[1.6vw]">
            Write the workday
            <br className="hidden lg:block" /> down.{" "}
            <span className="bn-h1-accent">Keep the thread.</span>
          </h1>

          <p
            data-bn-reveal="copy"
            className="bn-lead bn-reveal-delay-3 mt-5 max-w-[680px] lg:mt-[2.2vw] lg:max-w-[41vw]"
          >
            A personal work log for people who build, ship, and collaborate. Capture your work,
            meeting notes, and ticket updates — so the story of each day stays clear.
          </p>

          <div
            data-bn-reveal="copy"
            className="bn-copy-actions bn-reveal-delay-4 mt-7 flex flex-wrap items-center gap-4 lg:mt-[2.3vw] lg:gap-[1.5vw]"
          >
            <Link href="/register" className="bn-btn bn-cta">
              Get started
              <ArrowRight className="size-[1.15em]" />
            </Link>
            <Link href="#toolkit" className="bn-btn bn-ghost">
              <PlayIcon className="size-[1.2em]" />
              How it works
            </Link>
          </div>

        </div>

        {/* ------------------------------ benefits -------------------------- */}
        <ul
          id="features"
          className="mt-12 flex flex-col gap-5 md:flex-row md:flex-wrap md:items-center lg:mt-auto lg:max-w-[56%] lg:gap-0"
        >
          {FEATURES.map(({ Icon, title, copy }, index) => (
            <li
              key={title}
              data-bn-reveal="feature"
              className={`bn-feature bn-reveal-delay-${index + 2} flex items-center gap-3 md:flex-1 lg:gap-[0.8vw] lg:px-[1.2vw] lg:first:pl-0`}
              style={index === 0 ? undefined : { borderInlineStart: "1px solid var(--bn-divider)" }}
            >
              <span className="bn-feature-icon flex shrink-0 items-center justify-center rounded-full bg-[var(--bn-tile-bg)] text-[var(--bn-tile-fg)]">
                <Icon className="size-[45%]" />
              </span>
              <span className="block">
                <span className="bn-feature-title block whitespace-nowrap">{title}</span>
                <span className="bn-feature-sub block">{copy}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
