import type { Metadata, Viewport } from "next";
import {
  Archivo,
  Bricolage_Grotesque,
  JetBrains_Mono,
  Martian_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";
import Script from "next/script";
import localFont from "next/font/local";

import { Providers } from "@/components/providers";
import { THEME_INIT_SCRIPT } from "@/components/theme/theme";

import "./globals.css";

/**
 * Type — design.md §6. Plus Jakarta Sans is the UI face: a geometric sans with
 * a tall x-height, so 13-14px labels stay legible at the density this app runs
 * at, and `tabular-nums` keeps columns of dates and counts aligned.
 *
 * Self-hosted by `next/font` (no Google request at runtime, no layout shift),
 * variable weights so 400/500/600/700 cost one file.
 *
 * The italic face is loaded for ONE span — the marketing hero's second headline
 * line. Without it the browser synthesises an oblique by shearing the roman,
 * which at 72px is plainly a fake. It is a second variable file, so it costs
 * one request on the public page and nothing in the app UI, which never
 * sets `italic`.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-jakarta",
});

/** Ticket IDs, timestamps, saved commands. Ligatures are switched off in CSS. */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains-mono",
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
  // Matches the light/dark surfaces so the mobile browser chrome doesn't clash.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0d" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // The pre-hydration script below mutates className / style on <html>,
      // which React would otherwise flag as a hydration mismatch.
      suppressHydrationWarning
      className={`h-full ${jakarta.variable} ${jetbrainsMono.variable} ${bricolage.variable} ${archivo.variable} ${martianMono.variable} ${cormorant.variable}`}
    >
      <head>
        {/*
          Runs before first paint: applies the stored theme (or the system
          preference when there is no stored choice) so there is never a flash
          of the wrong theme. Must stay inline and synchronous — a deferred or
          external script is already too late.
        */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-bg text-text">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
