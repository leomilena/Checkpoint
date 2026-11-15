import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="font-mono text-sm uppercase tracking-widest text-accent">Error 404</span>
      <h1 className="font-display text-2xl font-bold text-text">The Frame no encontrado</h1>
      <p className="text-muted">La página que buscas no existe o se ha movido.</p>
      <Link href="/" className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-bg hover:opacity-90">
        Volver a portada
      </Link>
    </div>
  );
}
