/**
 * Inline SVG icon set for `/banner`.
 *
 * Every mark is drawn here rather than pulled from lucide (which the app uses
 * elsewhere) because the reference comp has its own icon language: 1.8px
 * rounded strokes and geometric construction. They all paint in `currentColor`
 * so the banner's `--bn-*` tokens drive them.
 */

type IconProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Isometric cube, three visible faces on the emerald ramp. */
export function BrandCube({ className }: IconProps) {
  return (
    <svg viewBox="0 0 38 38" className={className} aria-hidden="true">
      <rect width="38" height="38" rx="10" fill="var(--bn-tile-bg)" />
      <path d="M19 7 30 13v12l-11 6-11-6V13z" fill="#0f6e58" />
      <path d="M19 7 30 13l-11 6-11-6z" fill="#7fe3c4" />
      <path d="M19 19 30 13v12l-11 6z" fill="#1f9d7d" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="6.4" {...stroke} />
      <path d="m16 16 4 4" {...stroke} />
    </svg>
  );
}

export function ArrowRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M4.5 12h15m0 0-5.5-5.5M19.5 12 14 17.5" {...stroke} />
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M8 5.6v12.8L19 12z" {...stroke} />
    </svg>
  );
}

export function LeafIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M20 4c0 8.3-4.4 12.6-10.6 12.6A5.4 5.4 0 0 1 4 11.2C4 5.9 9.5 4 20 4z" {...stroke} />
      <path d="M4.8 20c3.2-4.6 6.9-7.8 11.4-9.8" {...stroke} />
    </svg>
  );
}

export function BarsIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M5.8 19v-5M12 19V8m6.2 11V4.6" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function HeartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 20s-7.4-4.4-7.4-9.4A4.2 4.2 0 0 1 12 8.1a4.2 4.2 0 0 1 7.4 2.5c0 5-7.4 9.4-7.4 9.4z"
        {...stroke}
      />
    </svg>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" {...stroke} />
    </svg>
  );
}
