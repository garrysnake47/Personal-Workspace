"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Three sections, three headline moments. Navigation, supporting copy, cards,
 * icons, controls, imagery and footer stay static so motion preserves the
 * hierarchy instead of turning the entire page into a reveal sequence.
 */
export function BannerMotion() {
  useGSAP(() => {
    const scroller = document.querySelector<HTMLElement>(".banner-page");
    if (!scroller) return;

    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const replay = {
        scroller,
        start: "top 72%",
        toggleActions: "restart none restart reset",
        invalidateOnRefresh: true,
      } as const;

      const hero = scroller.querySelector<HTMLElement>("#banner");
      const heroHeading = hero?.querySelector<HTMLElement>(".bn-h1");
      const toolkit = scroller.querySelector<HTMLElement>("#toolkit");
      const toolkitHeading = toolkit?.querySelector<HTMLElement>(".bn-toolkit-heading");
      const closing = scroller.querySelector<HTMLElement>("#closing");
      const closingHeading = closing?.querySelector<HTMLElement>(".bn-closing-copy h2");

      if (hero && heroHeading) {
        gsap.fromTo(
          heroHeading,
          { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" },
          {
            autoAlpha: 1,
            clipPath: "inset(0 0% 0 0)",
            duration: 1.45,
            ease: "power2.out",
            clearProps: "opacity,visibility,clipPath",
            scrollTrigger: { trigger: hero, ...replay },
          },
        );
      }

      if (toolkit && toolkitHeading) {
        gsap.fromTo(
          toolkitHeading,
          {
            autoAlpha: 0,
            y: 34,
            rotateX: -22,
            transformPerspective: 700,
            transformOrigin: "50% 100%",
          },
          {
            autoAlpha: 1,
            y: 0,
            rotateX: 0,
            duration: 1.6,
            ease: "expo.out",
            clearProps: "opacity,visibility,transform",
            scrollTrigger: { trigger: toolkit, ...replay },
          },
        );
      }

      if (closing && closingHeading) {
        gsap.fromTo(
          closingHeading,
          { autoAlpha: 0, scale: 0.9 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: 1.7,
            ease: "power3.out",
            clearProps: "opacity,visibility,transform",
            scrollTrigger: { trigger: closing, ...replay },
          },
        );
      }

      ScrollTrigger.refresh();
    });

    return () => media.revert();
  }, []);

  return null;
}
