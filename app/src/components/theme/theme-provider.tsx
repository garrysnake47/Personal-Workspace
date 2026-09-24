"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { isTheme, THEME_STORAGE_KEY, type Theme } from "@/components/theme/theme";

type ThemeContextValue = {
  /** What the user chose: light | dark | system. */
  theme: Theme;
  /** What that currently resolves to. `system` follows the OS live. */
  resolved: "light" | "dark";
  setTheme: (next: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const QUERY = "(prefers-color-scheme: dark)";

/* --------------------------------------------------------------------------
   localStorage and matchMedia are external stores, so they are read through
   `useSyncExternalStore` rather than copied into state inside an effect. That
   keeps the server snapshot ("system") and the client snapshot (the persisted
   choice) explicit, and avoids the cascading render an effect+setState causes.
-------------------------------------------------------------------------- */

let cachedTheme: Theme | null = null;
const listeners = new Set<() => void>();

function readStoredTheme(): Theme {
  if (cachedTheme === null) {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      // Private mode / storage blocked — fall back to following the system.
    }
    cachedTheme = isTheme(stored) ? stored : "system";
  }
  return cachedTheme;
}

function subscribeTheme(onChange: () => void) {
  listeners.add(onChange);
  // Another tab changed the preference.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    cachedTheme = null;
    listeners.forEach((listener) => listener());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

function subscribeSystem(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    readStoredTheme,
    () => "system" as Theme,
  );

  const systemDark = useSyncExternalStore(
    subscribeSystem,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );

  const resolved: "light" | "dark" =
    theme === "system" ? (systemDark ? "dark" : "light") : theme;

  // Sync the DOM (an external system) with the resolved theme. The inline
  // script in <head> already did this for the first paint; this keeps it true
  // afterwards, when the choice or the OS preference changes.
  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle("dark", resolved === "dark");
    el.dataset.theme = theme;
    el.style.colorScheme = resolved;
  }, [theme, resolved]);

  const setTheme = useCallback((next: Theme) => {
    cachedTheme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Non-fatal: the choice just won't survive a reload.
    }
    listeners.forEach((listener) => listener());
  }, []);

  const value = useMemo(
    () => ({ theme, resolved, setTheme }),
    [theme, resolved, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
