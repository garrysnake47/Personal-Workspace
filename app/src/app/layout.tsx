import type { Metadata, Viewport } from "next";
import {
  Archivo,
  Bricolage_Grotesque,
  Geist,
  Geist_Mono,
  Martian_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";
import localFont from "next/font/local";

import { Providers } from "@/components/providers";

import "./globals.css";

/**
 * Type — design.md §6. Geist is the app UI face (2026-09-28 refresh, per the
 * taste + redesign skills): a crisp neo-grotesk with real Medium/SemiBold
 * steps, so dense 13-14px labels keep a clear hierarchy. Geist Mono carries
 * ticket IDs, timestamps and code, and shares Geist's metrics.
 *
 * Plus Jakarta Sans stays loaded for the PUBLIC pages only (homepage, banner,
 * auth), which reference `--font-jakarta` directly. Its italic is used for one
 * span in the marketing hero, so the real italic file is loaded rather than a
 * synthesised oblique.
 *
 * Self-hosted by `next/font` (no Google request at runtime, no layout shift).
 */
const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
});

/** Ticket IDs, timestamps, saved commands. Ligatures are switched off in CSS. */
const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-jakarta",
});

/* ---------------------------------------------------------------------------
   Marketing faces — PUBLIC PAGES ONLY. The app UI is Plus Jakarta Sans +
   JetBrains Mono and stays that way; these three are scoped to
   `.marketing-document` in globals.css.

   Bricolage Grotesque is the display voice: variable width and optical size,
   engineered rather than neutral. Deliberately NOT a monospace — mono as a
   costume for "technical" is a refusal, so Martian Mono is confined to the
   things that are actually data: commit ids, timestamps, dates and counts,
   where its tabular figures do real work. Archivo carries prose.
--------------------------------------------------------------------------- */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-archivo",
});

const martianMono = Martian_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-martian-mono",
});

const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-500.ttf", weight: "500", style: "normal" },
    { path: "./fonts/cormorant-garamond-600.ttf", weight: "600", style: "normal" },
  ],
  display: "swap",
  variable: "--font-cormorant",
});


export const metadata: Metadata = {
  title: {
    default: "WorkNest",
    template: "%s · WorkNest",
  },
  description:
    "Daily work logs, meeting notes, and ticket updates in one focused WorkNest.",
};

export const viewport: Viewport = {
  // Light-only site: the mobile browser chrome always matches the white page.
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`h-full ${geist.variable} ${geistMono.variable} ${jakarta.variable} ${bricolage.variable} ${archivo.variable} ${martianMono.variable} ${cormorant.variable}`}
    >
      <body className="flex min-h-full flex-col bg-bg text-text">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
