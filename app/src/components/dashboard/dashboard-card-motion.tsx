"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

/** Dashboard cards stay visible by default; motion enhances viewport entry only. */
export function DashboardCardMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".dashboard-page");
    if (!root) return;

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-card-reveal]", root);

      cards.forEach((card, index) => {
        const reveal = () => {
          gsap.fromTo(
            card,
            { autoAlpha: 0.86, y: 12 },
            { autoAlpha: 1, y: 0, duration: 0.42, delay: (index % 2) * 0.05, ease: "power1.out", overwrite: "auto" },
          );
        };

        ScrollTrigger.create({
          trigger: card,
          start: "top 90%",
          onEnter: reveal,
          onEnterBack: reveal,
        });
      });

      return () => {
        cards.forEach((card) => {
          gsap.killTweensOf(card);
          gsap.set(card, { clearProps: "opacity,visibility,transform" });
        });
      };
    });

    return () => media.revert();
  }, []);

  return null;
}
