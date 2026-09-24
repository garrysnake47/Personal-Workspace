/**
 * Theme constants shared between the pre-hydration inline script (which runs
 * before React) and the React provider. Keep the storage key in both places
 * identical — the script is a string, so it cannot import this at runtime.
 */

export const THEME_STORAGE_KEY = "pw-theme";

export const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

/**
 * Runs in <head> before first paint, so the correct theme is on <html> from the
 * very first frame — no flash of the wrong theme.
 *
 * Order of truth: explicit stored choice > system preference.
 * `data-theme` records the *choice* ("system" stays "system"); the `dark` class
 * records the *resolved* value, which is what the CSS actually keys off.
 */
export const THEME_INIT_SCRIPT = `(function(){try{
var k=${JSON.stringify(THEME_STORAGE_KEY)};
var s=localStorage.getItem(k);
if(s!=="light"&&s!=="dark"&&s!=="system"){s="system";}
var d=s==="dark"||(s==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
var e=document.documentElement;
e.classList.toggle("dark",d);
e.dataset.theme=s;
e.style.colorScheme=d?"dark":"light";
}catch(_){}})();`;
