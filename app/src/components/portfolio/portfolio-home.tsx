import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, BookOpen, Lightbulb, ListTodo, NotebookPen } from "lucide-react";

import { PortfolioThemeToggle } from "@/components/portfolio/portfolio-theme-toggle";
import { PortfolioNav } from "@/components/portfolio/portfolio-nav";
import { PortfolioScrollController } from "@/components/portfolio/portfolio-scroll-controller";
import { PortfolioReveal } from "@/components/portfolio/portfolio-reveal";
import { Link000 } from "@/components/ui/skiper-ui/skiper40";
import { getCurrentUser } from "@/lib/session";

const WORKSPACE_AREAS = [
  { Icon: NotebookPen, title: "Work logs", copy: "Daily work, meeting notes, and ticket updates, recorded in order.", href: "/work-logs" },
  { Icon: BookOpen, title: "Resources & links", copy: "Keep GitHub URLs, docs, commands, and useful references close.", href: "/resources" },
  { Icon: Lightbulb, title: "Notes & code ideas", copy: "Hold on to decisions, drafts, and the ideas worth building.", href: "/notes" },
  { Icon: ListTodo, title: "Tasks & follow-ups", copy: "Track the next thing that needs your attention.", href: "/tracker" },
] as const;

function ThemeImage({
  light,
  dark,
  alt,
  className = "",
  priority = false,
  sizes,
}: {
  light: string;
  dark: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes: string;
}) {
  return (
    <>
      <Image src={light} alt={alt} fill priority={priority} quality={90} sizes={sizes} className={`pf-theme-image pf-image-light ${className}`} />
      <Image src={dark} alt="" fill priority={priority} quality={90} sizes={sizes} className={`pf-theme-image pf-image-dark ${className}`} />
    </>
  );
}

function Brand() {
  return <Link href="#home" className="pf-brand" aria-label="WorkNest home">WorkNest</Link>;
}

export async function PortfolioHome() {
  const user = await getCurrentUser();
  return (
    <main id="main-content" className="portfolio-page">
      <PortfolioScrollController />
      <section id="home" className="pf-hero">
        <ThemeImage
          light="/Images/portfolio/hero-light-v2.png"
          dark="/Images/portfolio/hero-dark.png"
          alt="A focused workspace with a person working at a desk"
          className="pf-hero-photo"
          priority
          sizes="100vw"
        />
        <div className="pf-hero-shade" aria-hidden="true" />

        <header className="pf-header pf-shell">
          <Brand />
          <PortfolioNav />
          <div className="pf-header-actions">
            <PortfolioThemeToggle />
            <Link href={user ? "/dashboard" : "/login"} className="pf-button pf-button-outline">
              {user ? "Open dashboard" : "Sign in"} <ArrowUpRight />
            </Link>
          </div>
        </header>
        <PortfolioNav mobile />

        <div className="pf-hero-copy pf-shell">
          <PortfolioReveal delay={0.02} kind="accent"><p className="pf-kicker">Organize / Learn / Build</p></PortfolioReveal>
          <PortfolioReveal delay={0.09}><h1>My personal<br /><span>workspace.</span></h1></PortfolioReveal>
          <PortfolioReveal delay={0.16}><p className="pf-hero-lead">
            I&apos;m a student, builder, and lifelong learner. This is my space to keep
            resources, notes, and work logs in one place.
          </p></PortfolioReveal>
          <PortfolioReveal delay={0.23}><div className="pf-actions">
            <Link href="#workspace" className="pf-button pf-button-solid">Explore workspace <ArrowUpRight /></Link>
            <Link000 href="#about" className="pf-text-link pf-skiper-link">About me</Link000>
          </div></PortfolioReveal>
        </div>

        <PortfolioReveal className="pf-scroll-cue" delay={0.28} kind="accent">
          <Link href="#workspace">Scroll <ArrowDown aria-hidden="true" /></Link>
        </PortfolioReveal>
      </section>

      <section id="workspace" className="pf-inside" aria-labelledby="inside-heading">
        <div className="pf-shell pf-inside-layout">
          <div className="pf-inside-intro">
            <PortfolioReveal><h2 id="inside-heading">Everything in its place.</h2></PortfolioReveal>
            <PortfolioReveal delay={0.08}><p>A simple home for what I collect, make, and need to return to.</p></PortfolioReveal>
          </div>
          <ul className="pf-inside-list">
            {WORKSPACE_AREAS.map(({ Icon, title, copy, href }, index) => (
              <li key={title} id={title === "Notes & code ideas" ? "notes" : undefined}>
                <PortfolioReveal kind="accent" delay={index * 0.06}>
                  <Link href={href} className="pf-inside-link">
                    <span className="pf-inside-icon" aria-hidden="true"><Icon /></span>
                    <span className="pf-inside-text"><strong>{title}</strong><span>{copy}</span></span>
                    <ArrowUpRight className="pf-inside-arrow" aria-hidden="true" />
                  </Link>
                </PortfolioReveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="about" className="pf-about">
        <div className="pf-about-copy">
          <div>
            <PortfolioReveal><h2>Curious mind.<br />Constantly creating.</h2></PortfolioReveal>
            <PortfolioReveal delay={0.08}><p>I love turning ideas into useful systems. I use this workspace to think clearly, learn consistently, and document the journey.</p></PortfolioReveal>
            <PortfolioReveal delay={0.16}><Link href="/register" className="pf-button pf-button-outline">Create your space <ArrowUpRight /></Link></PortfolioReveal>
          </div>
        </div>
        <div className="pf-about-image">
          <ThemeImage light="/Images/portfolio/about-screen-light.webp" dark="/Images/portfolio/about-screen-dark.webp" alt="A desk with an open laptop screen, notebook, books, and plants" className="pf-about-photo" sizes="(min-width: 768px) 58vw, 100vw" />
        </div>
      </section>

      <section id="contact" className="pf-contact">
        <div className="pf-shell">
          <div className="pf-contact-cta">
            <PortfolioReveal>
              <h2>Have an idea or just want to say hi?</h2>
              <p>I&apos;m always open to meaningful conversations.</p>
            </PortfolioReveal>
          </div>
        </div>
      </section>

      <section className="pf-quote">
        <ThemeImage light="/Images/portfolio/coast-light-v2.png" dark="/Images/portfolio/coast-dark.png" alt="A rocky coastline in soft morning light" className="pf-quote-photo" sizes="100vw" />
        <span className="pf-quote-shade" aria-hidden="true" />
        <div className="pf-shell pf-quote-content">
          <PortfolioReveal kind="quote" className="pf-quote-statement"><blockquote>“A calmer mind<br />builds a brighter you.”</blockquote></PortfolioReveal>
        </div>
      </section>

      <footer className="pf-footer pf-footer-section">
        <div className="pf-shell">
          <div><Brand /><p>Building a better me, one day at a time.</p></div>
          <nav aria-label="Footer navigation"><Link href="#home">Home</Link><Link href="#workspace">Workspace</Link><Link href="#about">About</Link><Link href="/notes">Notes</Link><Link href="#contact">Contact</Link></nav>
          <div className="pf-footer-end">
            <p>© 2026 WorkNest. All rights reserved.</p>
            <a href="https://skiper-ui.com/" target="_blank" rel="noopener noreferrer" className="pf-credit">Link motion by Skiper UI</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
