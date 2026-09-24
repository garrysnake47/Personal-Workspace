import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { PortfolioThemeToggle } from "@/components/portfolio/portfolio-theme-toggle";

const scenes = {
  login: {
    light: "/Images/portfolio/about-screen-light.webp",
    dark: "/Images/portfolio/about-screen-dark.webp",
    alt: "An open laptop and notebook in a quiet workspace",
    heading: "Pick up where you left off.",
    copy: "Your work logs, resources, and ideas are ready when you are.",
  },
  register: {
    light: "/Images/portfolio/hero-light-v2.png",
    dark: "/Images/portfolio/hero-dark.png",
    alt: "A person building at a desk in a WorkNest workspace",
    heading: "A space to make your own.",
    copy: "Keep the work, thinking, and links worth returning to in one place.",
  },
} as const;

/** Public account pages use the homepage's neutral studio palette and real paired imagery. */
export function AuthShell({
  variant,
  children,
}: {
  variant: "login" | "register";
  children: ReactNode;
}) {
  const scene = scenes[variant];

  return (
    <div className={`auth-shell auth-shell-${variant}`}>
      <header className="auth-header">
        <Link href="/" className="auth-brand" aria-label="WorkNest home">WorkNest</Link>
        <PortfolioThemeToggle />
      </header>

      <main id="main-content" className="auth-layout">
        <section className="auth-form-panel" aria-label={variant === "login" ? "Sign in" : "Create account"}>
          <div className="auth-form-inner">{children}</div>
        </section>

        <aside className="auth-scene" aria-label={scene.alt}>
          <Image src={scene.light} alt={scene.alt} fill priority quality={90} sizes="(min-width: 900px) 50vw, 100vw" className="auth-scene-image auth-scene-light" />
          <Image src={scene.dark} alt="" fill priority quality={90} sizes="(min-width: 900px) 50vw, 100vw" className="auth-scene-image auth-scene-dark" />
          <div className="auth-scene-caption">
            <h2>{scene.heading}</h2>
            <p>{scene.copy}</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
