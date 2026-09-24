import Link from "next/link";
import {
  PiClockCounterClockwiseDuotone,
  PiLinkSimpleDuotone,
  PiListChecksDuotone,
  PiNotebookDuotone,
  PiNotePencilDuotone,
  PiSquaresFourDuotone,
} from "react-icons/pi";

import { ArrowRight } from "@/components/banner/banner-icons";

const TOOLS = [
  { Icon: PiNotebookDuotone, title: "Work logs", copy: "Capture each day", tone: "mint", position: "top" },
  { Icon: PiSquaresFourDuotone, title: "Dashboard", copy: "See what matters", tone: "clay", position: "upper-left" },
  { Icon: PiListChecksDuotone, title: "Tracker", copy: "Keep follow-ups moving", tone: "sand", position: "upper-right" },
  { Icon: PiNotePencilDuotone, title: "Notes", copy: "Organize your thinking", tone: "sand", position: "lower-left" },
  { Icon: PiLinkSimpleDuotone, title: "Resources", copy: "Keep useful links close", tone: "clay", position: "lower-right" },
  { Icon: PiClockCounterClockwiseDuotone, title: "Ticket history", copy: "Preserve every update", tone: "mint", position: "bottom" },
] as const;

export function BannerToolkit() {
  return (
    <section id="toolkit" className="bn-toolkit bn-chapter" aria-labelledby="toolkit-heading">
      <div className="bn-toolkit-copy">
        <p className="bn-toolkit-eyebrow">Everything you need</p>
        <h2 id="toolkit-heading" className="bn-toolkit-heading">All in one place.</h2>
        <p className="bn-toolkit-lead">
          Keep your work, thoughts, and references organized — without the clutter.
        </p>
        <Link href="/register" className="bn-btn bn-cta bn-toolkit-cta">
          Get started
          <ArrowRight className="size-[1.1em]" />
        </Link>
      </div>

      <div className="bn-toolkit-map">
        <svg className="bn-toolkit-connectors" viewBox="0 0 1000 700" aria-hidden="true">
          <path d="M500 304 C500 236 500 185 500 132" />
          <path d="M430 332 C355 300 300 240 248 214" />
          <path d="M570 332 C650 300 700 240 752 214" />
          <path d="M430 402 C350 430 300 480 240 500" />
          <path d="M570 402 C650 430 700 480 760 500" />
          <path d="M500 430 C500 500 500 548 500 586" />
        </svg>

        <div className="bn-toolkit-core">
          <span className="bn-core-mark" aria-hidden="true" />
          <strong>All in one place.</strong>
          <p>Your work and knowledge, connected.</p>
        </div>

        <ul className="bn-toolkit-cluster">
          {TOOLS.map(({ Icon, title, copy, tone, position }) => (
            <li key={title} className="bn-cluster-card" data-position={position} data-tone={tone}>
              <span className="bn-cluster-icon" data-tone={tone} aria-hidden="true"><Icon /></span>
              <span><strong>{title}</strong><small>{copy}</small></span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
