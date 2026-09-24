"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { scrollToPortfolioSection } from "./portfolio-scroll-controller";

type Section = "home" | "workspace" | "notes" | "about" | "contact";

const links = [
  { id: "home", label: "Home" },
  { id: "workspace", label: "Workspace" },
  { id: "about", label: "About" },
  { id: "notes", label: "Notes" },
  { id: "contact", label: "Contact" },
] as const;

const sections: Section[] = ["home", "workspace", "notes", "about", "contact"];

export function PortfolioNav({ mobile = false }: { mobile?: boolean }) {
  const [active, setActive] = useState<Section>("home");
  const [scrolled, setScrolled] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let frame = 0;
    const update = () => {
      setScrolled(window.scrollY > 28);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const marker = window.scrollY + window.innerHeight * 0.38;
        let current: Section = "home";
        for (const id of sections) {
          const element = document.getElementById(id);
          if (element && element.getBoundingClientRect().top + window.scrollY <= marker) current = id;
        }
        setActive(current);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <motion.nav
      aria-label={mobile ? "Mobile navigation" : "Primary navigation"}
      className={mobile ? "pf-mobile-nav pf-shell" : "pf-nav"}
      data-scrolled={scrolled || undefined}
      animate={{ y: scrolled && !mobile ? -2 : 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {links.map((link) => {
        const isCurrent = link.id === active;
        const href = "href" in link && typeof link.href === "string" ? link.href : `#${link.id}`;
        return (
          <Link
            key={link.id}
            href={href}
            className={isCurrent ? "is-active" : undefined}
            aria-current={isCurrent ? "location" : undefined}
            onClick={(event) => {
              event.preventDefault();
              setActive(link.id as Section);
              scrollToPortfolioSection(link.id);
            }}
          >
            {link.label}
            {isCurrent && (
              <motion.span
                className="pf-nav-indicator"
                layoutId={mobile ? "mobile-nav-indicator" : "desktop-nav-indicator"}
                transition={reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 38 }}
                aria-hidden="true"
              />
            )}
          </Link>
        );
      })}
    </motion.nav>
  );
}
