/** The OpenJarvis "J" mark as inline SVG (matches the app/PWA icon). */
export function JarvisMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="oj-mark-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" className="fill-surface-2" />
      <path
        d="M38 16h6v22a12 12 0 0 1-12 12 12 12 0 0 1-12-12h6a6 6 0 0 0 12 0z"
        fill="url(#oj-mark-grad)"
      />
      <circle cx="41" cy="14" r="4" fill="#22d3ee" />
    </svg>
  );
}
