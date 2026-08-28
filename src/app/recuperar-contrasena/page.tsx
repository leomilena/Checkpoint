"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/ui/field";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStatus("done");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Recuperar contraseña</h1>
        <p className="mt-1 text-sm text-muted">Te enviaremos un enlace para restablecerla.</p>
      </div>

      {status === "done" ? (
        <p className="rounded-card border border-border bg-surface p-6 text-sm text-text">
          Si el email existe en Checkpoint, recibirás un enlace de recuperación en breve.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-card border border-border bg-surface p-6">
          <Field label="Email" htmlFor="email">
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </Field>
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
          >
            {status === "loading" ? "Enviando…" : "Enviar enlace"}
          </button>
        </form>
      )}
    </div>
  );
}
