"use client";

import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { useTheme } from "@/components/theme/theme-provider";

export function PortfolioThemeToggle() {
  const { resolved, setTheme } = useTheme();
  const reducedMotion = useReducedMotion();
  const next = resolved === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      className="pf-theme-toggle"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => setTheme(next)}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={resolved}
          className="pf-theme-toggle-icon"
          initial={reducedMotion ? false : { opacity: 0, rotate: -35, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0, rotate: 35, scale: 0.8 }}
          transition={{ duration: reducedMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          {resolved === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
