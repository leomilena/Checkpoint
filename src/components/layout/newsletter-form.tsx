"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return <p className="text-sm font-medium text-accent2">¡Gracias por suscribirte!</p>;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
      <label htmlFor="newsletter-email" className="sr-only">
        Email para el boletín
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="tu@email.com"
        className="w-full rounded-full border border-border bg-surface2 px-4 py-2 text-sm text-text placeholder:text-muted focus:outline-none sm:w-64"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
      >
        {status === "loading" ? "Enviando…" : "Suscribirme"}
      </button>
      {status === "error" && <p className="text-sm text-danger">Ha ocurrido un error. Inténtalo de nuevo.</p>}
    </form>
  );
}
