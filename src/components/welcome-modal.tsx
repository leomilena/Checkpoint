"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const STORAGE_KEY = "the-frame-welcome-seen";

export function WelcomeModal() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (session?.user) return;

    let seen = true;
    try {
      seen = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // Si localStorage no está disponible (modo privado, bloqueado...),
      // mejor no mostrar nada que arriesgarnos a reventar la página.
      return;
    }
    if (!seen) setOpen(true);
  }, [status, session]);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Sin acceso a localStorage no podemos recordar la elección, pero
      // cerrar el modal en esta visita no debe fallar por eso.
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div className="relative w-full max-w-md rounded-card border border-border bg-surface p-6 shadow-xl">
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface2 hover:text-text"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <h2 id="welcome-modal-title" className="pr-8 font-display text-xl font-bold text-text">
          ¡Bienvenido a The Frame!
        </h2>
        <p className="mt-2 text-sm text-muted">
          Crea una cuenta o inicia sesión para valorar artículos, comentar y guardar lo que más te
          interese para leer más tarde.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/registro"
            onClick={close}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-bg transition hover:opacity-90"
          >
            Crear cuenta
          </Link>
          <Link
            href="/entrar"
            onClick={close}
            className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-accent hover:text-accent"
          >
            Entrar
          </Link>
        </div>

        <p className="mt-5 border-t border-border pt-4 text-sm text-muted">
          ¿Te gustaría escribir con nosotros?{" "}
          <Link href="/colabora" onClick={close} className="text-accent hover:underline">
            Contacta aquí
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
