import type { Metadata } from "next";

import { PortfolioHome } from "@/components/portfolio/portfolio-home";

import "./banner.css";

export const metadata: Metadata = {
  title: "Banner",
  description: "Hero banner — light and dark.",
};

/**
 * Standalone banner page. Deliberately outside both the app shell and the
 * marketing frame: it carries its own nav pill and its own palette, so
 * wrapping it in either would double the chrome.
 *
 * The theme control is a working affordance for reviewing the two comps, not
 * part of the design. It sits bottom-RIGHT: bottom-left is where the Next dev
 * tools badge lives, and the two were overlapping in development. It drives the
 * app's existing `.dark` class on <html>, which is what `--bn-*` keys off.
 */
export default function BannerPage() {
  return <PortfolioHome />;
}
