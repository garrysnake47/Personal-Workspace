"use client";

import { useEffect } from "react";

/**
 * Replays marketing reveals whenever an element re-enters the viewport.
 *
 * Content is visible by default. The controller only arms hidden start states
 * after the observer exists, so a blocked script or hydration error can never
 * leave useful content invisible.
 */
export function RevealController() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".marketing-document");
    if (!root) return;

    const elements = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal], [data-word-rise]"),
    );
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    if (reducedMotion.matches || elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.toggleAttribute("data-in-view", entry.isIntersecting);
        }
      },
      {
        root: null,
        rootMargin: "-10% 0px -15% 0px",
        threshold: 0.18,
      },
    );

    const viewportHeight = window.innerHeight;
    elements.forEach((element) => {
      const bounds = element.getBoundingClientRect();
      const initiallyVisible =
        bounds.bottom > viewportHeight * 0.1 &&
        bounds.top < viewportHeight * 0.85;
      element.toggleAttribute("data-in-view", initiallyVisible);
      observer.observe(element);
    });
    root.setAttribute("data-motion-ready", "true");

    return () => {
      observer.disconnect();
      root.removeAttribute("data-motion-ready");
      elements.forEach((element) => element.removeAttribute("data-in-view"));
    };
  }, []);

  return null;
}
