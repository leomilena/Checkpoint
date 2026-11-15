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
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-text">Suscríbete al boletín</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-border px-4 py-4 text-center font-mono text-xs text-muted">
        © {new Date().getFullYear()} The Frame
      </div>
    </footer>
  );
}
