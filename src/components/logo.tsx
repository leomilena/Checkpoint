import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`flex items-center gap-2 font-display font-bold tracking-tight text-text ${className}`}
      aria-label="Checkpoint — ir a portada"
    >
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-checkpoint rounded-full bg-accent" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
      </span>
      <span className="text-lg uppercase">Checkpoint</span>
    </Link>
  );
}
