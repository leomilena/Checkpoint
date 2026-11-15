import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 font-display font-bold tracking-tight text-text ${className}`}
      aria-label="The Frame — ir a portada"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="animate-frame-pulse"
      >
        <path d="M4 9V5a1 1 0 0 1 1-1h4" stroke="var(--cp-accent)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M20 9V5a1 1 0 0 0-1-1h-4" stroke="var(--cp-accent)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M4 15v4a1 1 0 0 0 1 1h4" stroke="var(--cp-accent)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M20 15v4a1 1 0 0 1-1 1h-4" stroke="var(--cp-accent)" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span className="text-lg uppercase">The Frame</span>
    </Link>
  );
}
