"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/ui/field";

export function WriterApplicationForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const res = await fetch("/api/writer-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message, website }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se ha podido enviar la solicitud.");
      setStatus("error");
      return;
    }

    setStatus("done");
    setName("");
    setEmail("");
    setMessage("");
  }

  if (status === "done") {
    return (
      <div className="rounded-card border border-border bg-surface p-6 text-center">
        <p className="font-display text-lg font-bold text-text">¡Solicitud enviada!</p>
        <p className="mt-2 text-sm text-muted">
          Gracias por escribirnos. Te contestaremos por email en cuanto la revisemos.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6">
      <Field label="Nombre" htmlFor="wa-name">
        <input
          id="wa-name"
          required
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Email" htmlFor="wa-email">
        <input
          id="wa-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Cuéntanos qué te gustaría escribir" htmlFor="wa-message">
        <textarea
          id="wa-message"
          required
          maxLength={2000}
          rows={5}
          placeholder="Qué juegos/pelis/series te gustan, si tienes experiencia escribiendo, algún enlace de algo tuyo si lo tienes…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={inputClass}
        />
      </Field>

      {/* Campo trampa para bots: invisible para personas, visible para rastreadores automáticos. */}
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
      >
        {status === "loading" ? "Enviando…" : "Enviar solicitud"}
      </button>
    </form>
  );
}
