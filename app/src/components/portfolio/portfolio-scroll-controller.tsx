"use client";

import { useEffect } from "react";

export function scrollToPortfolioSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return false;
  window.history.replaceState(null, "", `#${id}`);
  target.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start",
  });
  return true;
}

/** Gives every same-page homepage link the same interruptible scroll behavior. */
export function PortfolioScrollController() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[href^='#']");
      if (!link) return;
      const id = link.getAttribute("href")?.slice(1);
      if (!id || !document.getElementById(id)) return;
      event.preventDefault();
      scrollToPortfolioSection(id);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
