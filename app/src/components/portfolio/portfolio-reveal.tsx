"use client";

import gsap from "gsap";
import { useEffect, useRef, type ReactNode } from "react";

type PortfolioRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  kind?: "text" | "card" | "accent" | "quote";
};

const REVEAL = {
  text: { x: 0, y: 12, scale: 1 },
  card: { x: 0, y: 18, scale: 0.985 },
  accent: { x: -10, y: 0, scale: 1 },
  quote: { x: 24, y: 0, scale: 1 },
} as const;

export function PortfolioReveal({ children, className, delay = 0, kind = "text" }: PortfolioRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const initial = REVEAL[kind];
    const textTargets = Array.from(
      element.querySelectorAll<HTMLElement>("h1,h2,h3,p,strong,blockquote,.pf-button,.pf-text-link,.pf-inside-text > span"),
    );
    let played = false;

    // Keep content readable before hydration; GSAP only adds spatial movement.
    gsap.set(element, { opacity: 1, ...initial });
    gsap.set(textTargets, { opacity: 1, y: 8 });
    if (reduced || !("IntersectionObserver" in window)) {
      gsap.set(element, { x: 0, y: 0, scale: 1 });
      gsap.set(textTargets, { opacity: 1, y: 0 });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !played) {
          played = true;
          gsap.to(element, {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: kind === "card" || kind === "quote" ? 0.68 : 0.56,
            delay,
            ease: "power3.out",
            overwrite: "auto",
          });
          if (textTargets.length) {
            gsap.to(textTargets, {
              opacity: 1,
              y: 0,
              duration: 0.44,
              delay: delay + 0.04,
              stagger: 0.055,
              ease: "power2.out",
              overwrite: "auto",
            });
          }
        } else if (!entry.isIntersecting) {
          played = false;
          gsap.killTweensOf(element);
          gsap.killTweensOf(textTargets);
          gsap.set(element, { opacity: 1, ...initial });
          gsap.set(textTargets, { opacity: 1, y: 8 });
        }
      },
      { threshold: 0.02, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      gsap.killTweensOf(element);
    };
  }, [delay, kind]);

  return <div ref={ref} className={className}>{children}</div>;
}
