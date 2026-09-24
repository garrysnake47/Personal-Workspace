import Image from "next/image";
import Link from "next/link";

import { ArrowRight, BrandCube } from "@/components/banner/banner-icons";

export function BannerClosing() {
  return (
    <section id="closing" className="bn-closing bn-chapter" aria-labelledby="closing-heading">
      <div className="bn-closing-image" aria-hidden="true">
        <Image src="/Images/banner/closing-landscape-v1.png" alt="" fill sizes="100vw" className="bn-closing-photo bn-closing-photo-light" />
        <Image src="/Images/banner/closing-landscape-dark-v1.png" alt="" fill sizes="100vw" className="bn-closing-photo bn-closing-photo-dark" />
      </div>

      <div className="bn-closing-copy">
        <p className="bn-section-label">Same work. A clearer tomorrow.</p>
        <h2 id="closing-heading">A clearer record makes tomorrow easier.</h2>
        <Link href="/register" className="bn-btn bn-closing-cta">Create your space<ArrowRight className="size-[1.1em]" /></Link>
      </div>

      <div className="bn-sign-labels" aria-hidden="true">
        <span>Less clutter</span><span>More focus</span><span>A clearer day</span>
      </div>

      <footer className="bn-closing-footer">
        <Link href="#banner" className="bn-footer-brand">
          <BrandCube />
          <span><strong>WorkNest</strong><small>A personal record for better workdays.</small></span>
        </Link>
        <nav aria-label="Footer"><Link href="#banner">Home</Link><Link href="#toolkit">Features</Link><Link href="/login">Sign in</Link></nav>
        <p>Built for clearer workdays.</p>
      </footer>
    </section>
  );
}
