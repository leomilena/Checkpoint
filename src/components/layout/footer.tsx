import Link from "next/link";
import { Logo } from "@/components/logo";
import { NewsletterForm } from "@/components/layout/newsletter-form";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center">
        <div>
          <Logo />
          <p className="mt-2 max-w-sm text-sm text-muted">
            Videojuegos, cine y frikada. Guarda la partida, sigue leyendo.
          </p>
          <a
            href="https://www.tiktok.com/@theframe_press"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="The Frame en TikTok"
            className="mt-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition hover:border-accent hover:text-accent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M16.6 5.82a4.28 4.28 0 0 1-3.22-1.45V14.4a4.9 4.9 0 1 1-4.9-4.9c.17 0 .33.01.49.03v2.47a2.44 2.44 0 1 0 1.71 2.33V2h2.5a4.27 4.27 0 0 0 3.42 4.19v1.63Z" />
            </svg>
          </a>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-text">Suscríbete al boletín</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center font-mono text-xs text-muted">
        <Link href="/equipo" className="text-accent hover:underline">
          Nuestro equipo
        </Link>
        <span className="mx-2">·</span>
        <Link href="/colabora" className="text-accent hover:underline">
          ¿Quieres escribir con nosotros?
        </Link>
        <span className="mx-2">·</span>© {new Date().getFullYear()} The Frame
      </div>
    </footer>
  );
}
