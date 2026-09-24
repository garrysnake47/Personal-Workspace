"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import type { ReactNode } from "react";

/**
 * MUI for form fields (Input / Select / Textarea / Autocomplete).
 *
 * The palette carries concrete hexes because MUI computes alphas from them;
 * every visible surface/border/text in the overrides reads our CSS tokens
 * instead, so fields follow the app palette AND flip with `.dark` for free.
 *
 * `enableCssLayer` puts MUI in `@layer mui` (declared first in globals.css),
 * so Tailwind utilities passed via `className` still win.
 */
const theme = createTheme({
  palette: {
    primary: { main: "#3c6e71", contrastText: "#ffffff" },
    secondary: { main: "#284b63", contrastText: "#ffffff" },
    text: { primary: "#353535", secondary: "#414141" },
  },
  shape: { borderRadius: 10 },
  typography: { fontFamily: "inherit" },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--c-surface)",
          color: "var(--c-text)",
          fontSize: "var(--text-base)",
          fontWeight: 500,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--c-border-strong)", transition: "border-color 150ms ease" },
          "&:hover:not(.Mui-disabled):not(.Mui-focused) .MuiOutlinedInput-notchedOutline": { borderColor: "var(--c-primary)" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--c-primary)", borderWidth: 2 },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": { borderColor: "var(--c-danger)" },
          "&.Mui-disabled": { backgroundColor: "var(--c-surface-2)", opacity: 0.7 },
        },
        input: {
          padding: "10px 14px",
          "&::placeholder": { color: "var(--c-text-subtle)", opacity: 1 },
        },
        multiline: { padding: "10px 14px" },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: { fontFamily: "inherit", color: "var(--c-text)" },
        input: { "&::placeholder": { color: "var(--c-text-subtle)", opacity: 1 } },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: { color: "var(--c-accent-text)" },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundColor: "var(--c-surface)", color: "var(--c-text)", backgroundImage: "none" },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          marginTop: 6,
          border: "1px solid var(--c-border)",
          borderRadius: 12,
          boxShadow: "0 12px 32px -8px rgba(40, 75, 99, 0.28)",
        },
        list: { padding: 6 },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: "var(--text-base)",
          fontWeight: 500,
          minHeight: 38,
          "&:hover": { backgroundColor: "var(--c-surface-2)" },
          "&.Mui-selected, &.Mui-selected:hover": { backgroundColor: "var(--c-primary-subtle)", color: "var(--c-accent-text)", fontWeight: 600 },
          "&.Mui-focusVisible": { backgroundColor: "var(--c-surface-3)" },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          marginTop: 6,
          border: "1px solid var(--c-border)",
          borderRadius: 12,
          boxShadow: "0 12px 32px -8px rgba(40, 75, 99, 0.28)",
        },
        listbox: {
          padding: 6,
          "& .MuiAutocomplete-option": { borderRadius: 8, minHeight: 40 },
          "& .MuiAutocomplete-option.Mui-focused": { backgroundColor: "var(--c-surface-2)" },
          "& .MuiAutocomplete-option[aria-selected='true']": { backgroundColor: "var(--c-primary-subtle)" },
        },
        noOptions: { color: "var(--c-text-muted)", fontSize: "var(--text-sm)" },
      },
    },
  },
});

export function MuiProvider({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui", enableCssLayer: true }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppRouterCacheProvider>
  );
}
